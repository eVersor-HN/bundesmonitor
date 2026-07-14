"""Ingestion namentlicher Abstimmungen (bundestag.de, amtliche XLSX).

Ablauf je Abstimmung: Listeneintrag -> XLSX laden -> Roh-XLSX archivieren ->
RollCallVote idempotent upserten (Identitaet: Wahlperiode/Sitzung/Abstimmnr)
-> VOTE_HELD-Ereignis fuer den Feed -> optionales Matching auf einen Vorgang
ueber eine Drucksachennummer im Titel (sonst ehrlich unverknuepft).
"""

from __future__ import annotations

import re
from datetime import UTC, datetime
from typing import Any

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from bundesmonitor_core.ingestion.archive import RawArchive
from bundesmonitor_core.ingestion.dip.ingest import IngestResult
from bundesmonitor_core.ingestion.votes.parser import (
    LIST_URL,
    PAGE_URL,
    ParsedVote,
    VoteListEntry,
    parse_vote_list,
    parse_vote_xlsx,
)
from bundesmonitor_core.models import (
    Document,
    Event,
    EventType,
    Identifier,
    IngestRun,
    IngestStatus,
    RollCallVote,
    Source,
    SourceItem,
    SourceType,
)
from bundesmonitor_core.storage import sha256_hex

SOURCE_KEY = "bt_abstimmungen"
XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

_DRUCKSACHE_RE = re.compile(r"\b(2\d)/(\d{1,6})\b")


def _now() -> datetime:
    return datetime.now(UTC)


def get_or_create_votes_source(session: Session) -> Source:
    source = session.scalar(select(Source).where(Source.key == SOURCE_KEY))
    if source is None:
        source = Source(
            key=SOURCE_KEY,
            name="Deutscher Bundestag – Namentliche Abstimmungen",
            base_url=PAGE_URL,
            source_type=SourceType.HTML.value,
            quality_grade="A",
            polling_seconds=3600,
            enabled=True,
        )
        session.add(source)
        session.flush()
    return source


def fetch_vote_list(
    user_agent: str,
    limit: int = 20,
    timeout: float = 30.0,
    transport: httpx.BaseTransport | None = None,
) -> list[VoteListEntry]:
    headers = {"User-Agent": user_agent}
    with httpx.Client(timeout=timeout, headers=headers, transport=transport) as client:
        resp = client.get(LIST_URL, params={"limit": limit})
        resp.raise_for_status()
        return parse_vote_list(resp.text)[:limit]


def fetch_bytes(
    url: str,
    user_agent: str,
    timeout: float = 60.0,
    transport: httpx.BaseTransport | None = None,
) -> bytes:
    headers = {"User-Agent": user_agent}
    with httpx.Client(
        timeout=timeout, headers=headers, transport=transport, follow_redirects=True
    ) as client:
        resp = client.get(url)
        resp.raise_for_status()
        return resp.content


def _match_matter(session: Session, title: str) -> Any | None:
    """Vorgang ueber eine Drucksachennummer im Titel finden (sonst None)."""
    match = _DRUCKSACHE_RE.search(title)
    if match is None:
        return None
    number = f"{match.group(1)}/{match.group(2)}"
    ident = session.scalar(
        select(Identifier).where(
            Identifier.scheme.in_(["bt_drucksache", "br_drucksache"]),
            Identifier.value == number,
        )
    )
    if ident is not None:
        return ident.matter_id
    doc = session.scalar(
        select(Document).where(
            Document.document_number == number, Document.matter_id.is_not(None)
        )
    )
    return doc.matter_id if doc is not None else None


def _payload(entry: VoteListEntry, parsed: ParsedVote) -> dict[str, Any]:
    return {
        "title": entry.title,
        "vote_date": entry.vote_date.isoformat() if entry.vote_date else None,
        "xlsx_url": entry.xlsx_url,
        "pdf_url": entry.pdf_url,
        "wahlperiode": parsed.wahlperiode,
        "sitzung": parsed.sitzung,
        "abstimm_nr": parsed.abstimm_nr,
        "totals": parsed.totals,
        "by_fraktion": parsed.by_fraktion,
    }


def ingest_vote(
    session: Session,
    source: Source,
    entry: VoteListEntry,
    xlsx_data: bytes,
    archive: RawArchive,
) -> str:
    now = _now()
    parsed = parse_vote_xlsx(xlsx_data)
    if parsed.wahlperiode == 0 or not parsed.einzelstimmen:
        return "rejected"

    external_id = f"na:{parsed.wahlperiode}-{parsed.sitzung}-{parsed.abstimm_nr}"
    digest = sha256_hex(xlsx_data)
    existing_item = session.scalar(
        select(SourceItem).where(
            SourceItem.source_id == source.id,
            SourceItem.external_id == external_id,
            SourceItem.sha256 == digest,
        )
    )
    if existing_item is not None:
        return "unchanged"

    raw_key = archive.archive(SOURCE_KEY, xlsx_data, XLSX_MIME, "xlsx")
    published_at = (
        datetime(
            entry.vote_date.year, entry.vote_date.month, entry.vote_date.day, tzinfo=UTC
        )
        if entry.vote_date
        else None
    )
    src_item = SourceItem(
        source_id=source.id,
        external_id=external_id,
        canonical_url=entry.xlsx_url,
        content_type=XLSX_MIME,
        published_at=published_at,
        discovered_at=now,
        fetched_at=now,
        payload_json=_payload(entry, parsed),
        raw_object_key=raw_key,
        sha256=digest,
        version_no=1,
        is_current=True,
    )
    current = session.scalar(
        select(SourceItem).where(
            SourceItem.source_id == source.id,
            SourceItem.external_id == external_id,
            SourceItem.is_current.is_(True),
        )
    )
    if current is not None:
        current.is_current = False
        src_item.version_no = current.version_no + 1
        src_item.supersedes_id = current.id
    session.add(src_item)
    session.flush()

    matter_id = _match_matter(session, entry.title)

    vote = session.scalar(
        select(RollCallVote).where(
            RollCallVote.wahlperiode == parsed.wahlperiode,
            RollCallVote.sitzung == parsed.sitzung,
            RollCallVote.abstimm_nr == parsed.abstimm_nr,
        )
    )
    outcome = "updated" if vote is not None else "created"
    if vote is None:
        vote = RollCallVote(
            wahlperiode=parsed.wahlperiode,
            sitzung=parsed.sitzung,
            abstimm_nr=parsed.abstimm_nr,
            title=entry.title,
            totals=parsed.totals,
            by_fraktion=parsed.by_fraktion,
            einzelstimmen=parsed.einzelstimmen,
            source_item_id=src_item.id,
        )
        session.add(vote)
    vote.title = entry.title
    vote.vote_date = entry.vote_date
    vote.page_url = PAGE_URL
    vote.xlsx_url = entry.xlsx_url
    vote.pdf_url = entry.pdf_url
    vote.totals = parsed.totals
    vote.by_fraktion = parsed.by_fraktion
    vote.einzelstimmen = parsed.einzelstimmen
    vote.source_item_id = src_item.id
    if matter_id is not None:
        vote.matter_id = matter_id
    session.flush()

    dedupe_key = f"vote:{parsed.wahlperiode}-{parsed.sitzung}-{parsed.abstimm_nr}"
    if session.scalar(select(Event).where(Event.dedupe_key == dedupe_key)) is None:
        totals = parsed.totals
        summary = (
            f"Namentliche Abstimmung: {totals['ja']} Ja, {totals['nein']} Nein, "
            f"{totals['enthaltung']} Enthaltungen."
        )
        session.add(
            Event(
                matter_id=matter_id,
                event_type=EventType.VOTE_HELD.value,
                title=entry.title,
                summary=summary,
                published_at=published_at,
                occurred_at=published_at,
                discovered_at=now,
                source_item_id=src_item.id,
                dedupe_key=dedupe_key,
                event_metadata={"totals": totals},
            )
        )
        session.flush()
    return outcome


def run_votes_import(
    session: Session,
    archive: RawArchive,
    user_agent: str,
    limit: int = 20,
    transport: httpx.BaseTransport | None = None,
) -> tuple[IngestRun, IngestResult]:
    source = get_or_create_votes_source(session)
    run = IngestRun(source_id=source.id, started_at=_now(), status=IngestStatus.RUNNING.value)
    session.add(run)
    session.flush()

    result = IngestResult()
    try:
        entries = fetch_vote_list(user_agent, limit=limit, transport=transport)
        for entry in entries:
            result.fetched += 1
            try:
                data = fetch_bytes(entry.xlsx_url, user_agent, transport=transport)
                outcome = ingest_vote(session, source, entry, data, archive)
            except Exception as exc:  # ein defektes Item stoppt nicht den Lauf
                result.rejected += 1
                result.errors.append(f"{entry.xlsx_url}: {exc}")
                continue
            if outcome == "created":
                result.created += 1
            elif outcome == "updated":
                result.updated += 1
            elif outcome == "unchanged":
                result.unchanged += 1
            else:
                result.rejected += 1
        run.status = (
            IngestStatus.SUCCESS.value if not result.errors else IngestStatus.PARTIAL.value
        )
    finally:
        run.finished_at = _now()
        run.fetched_count = result.fetched
        run.created_count = result.created
        run.updated_count = result.updated
        run.rejected_count = result.rejected
        run.error_summary = "; ".join(result.errors[:5]) if result.errors else None
        session.flush()
    return run, result
