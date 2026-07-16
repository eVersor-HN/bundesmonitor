"""Tests fuer die Ingestion namentlicher Abstimmungen (Fixture-basiert)."""

from __future__ import annotations

import io
from datetime import date

from openpyxl import Workbook
from sqlalchemy import select
from sqlalchemy.orm import Session

from bundesmonitor_core.ingestion.archive import InMemoryRawArchive
from bundesmonitor_core.ingestion.votes.ingest import get_or_create_votes_source, ingest_vote
from bundesmonitor_core.ingestion.votes.parser import (
    VoteListEntry,
    parse_vote_list,
    parse_vote_xlsx,
)
from bundesmonitor_core.models import Event, RollCallVote

HEADER = [
    "Wahlperiode",
    "Sitzungnr",
    "Abstimmnr",
    "Fraktion/Gruppe",
    "Name",
    "Vorname",
    "Titel",
    "ja",
    "nein",
    "Enthaltung",
    "ungültig",
    "nichtabgegeben",
    "Bezeichnung",
    "Bemerkung",
]

ROWS = [
    (21, 90, 7, "CDU/CSU", "Muster", "Anna", None, 1, 0, 0, 0, 0, "Anna Muster", None),
    (21, 90, 7, "CDU/CSU", "Beispiel", "Ben", None, 0, 1, 0, 0, 0, "Ben Beispiel", None),
    (21, 90, 7, "SPD", "Test", "Tina", None, 1, 0, 0, 0, 0, "Tina Test", None),
    (21, 90, 7, "SPD", "Probe", "Paul", None, 0, 0, 1, 0, 0, "Paul Probe", None),
    (21, 90, 7, "AfD", "Fall", "Frida", None, 0, 0, 0, 0, 1, "Frida Fall", None),
]


def make_xlsx() -> bytes:
    wb = Workbook()
    ws = wb.active
    assert ws is not None
    ws.append(HEADER)
    for row in ROWS:
        ws.append(row)
    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


LIST_HTML = """
<table><tbody>
<tr>
<td data-th="Dokument"><div class="bt-documents-description">
<p><strong> 10.07.2026: <span>Testgesetz der Bundesregierung</span> </strong></p>
<ul><li><a href="https://example.test/blob/1/20260710_7.pdf">PDF</a></li>
<li><a href="https://example.test/blob/2/20260710_7-xls.xlsx">XLSX</a></li></ul>
</div></td>
</tr>
</tbody></table>
"""


def test_parse_vote_list() -> None:
    entries = parse_vote_list(LIST_HTML)
    assert len(entries) == 1
    entry = entries[0]
    assert entry.title == "Testgesetz der Bundesregierung"
    assert entry.vote_date == date(2026, 7, 10)
    assert entry.xlsx_url.endswith(".xlsx")
    assert entry.pdf_url is not None and entry.pdf_url.endswith(".pdf")


def test_parse_vote_xlsx_aggregates() -> None:
    parsed = parse_vote_xlsx(make_xlsx())
    assert (parsed.wahlperiode, parsed.sitzung, parsed.abstimm_nr) == (21, 90, 7)
    assert parsed.totals == {
        "ja": 2,
        "nein": 1,
        "enthaltung": 1,
        "ungueltig": 0,
        "nicht_abgegeben": 1,
    }
    cdu = next(f for f in parsed.by_fraktion if f["fraktion"] == "CDU/CSU")
    assert cdu["ja"] == 1 and cdu["nein"] == 1
    assert len(parsed.einzelstimmen) == 5
    assert parsed.einzelstimmen[0] == {
        "name": "Anna Muster",
        "fraktion": "CDU/CSU",
        "stimme": "ja",
    }


def test_ingest_vote_idempotent(session: Session) -> None:
    source = get_or_create_votes_source(session)
    archive = InMemoryRawArchive()
    entry = VoteListEntry(
        title="Testgesetz der Bundesregierung",
        vote_date=date(2026, 7, 10),
        xlsx_url="https://example.test/blob/2/20260710_7-xls.xlsx",
        pdf_url=None,
    )
    data = make_xlsx()

    assert ingest_vote(session, source, entry, data, archive) == "created"
    assert ingest_vote(session, source, entry, data, archive) == "unchanged"

    votes = session.scalars(select(RollCallVote)).all()
    assert len(votes) == 1
    vote = votes[0]
    assert vote.totals["ja"] == 2
    assert vote.matter_id is None  # kein Drucksachen-Match -> ehrlich unverknuepft

    events = session.scalars(select(Event)).all()
    assert len(events) == 1
    assert events[0].event_type == "vote_held"
    assert "2 Ja" in (events[0].summary or "")
