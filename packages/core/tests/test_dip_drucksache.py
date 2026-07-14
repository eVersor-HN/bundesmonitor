"""Drucksachen-Import und Verknuepfung als Dokumente mit vorhandenen Vorgaengen."""

from __future__ import annotations

import httpx
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from bundesmonitor_core.feed import get_matter_documents
from bundesmonitor_core.ingestion.archive import InMemoryRawArchive
from bundesmonitor_core.ingestion.dip.client import DipClient
from bundesmonitor_core.ingestion.dip.ingest import (
    get_or_create_dip_source,
    ingest_drucksache,
    run_drucksache_import,
    run_incremental_import,
)
from bundesmonitor_core.models import Document, Identifier, Matter, SourceItem

BASE_URL = "https://search.dip.bundestag.de/api/v1"


def _seed_vorgaenge(session: Session, transport: httpx.MockTransport) -> None:
    run_incremental_import(
        session, DipClient(api_key="t", transport=transport), InMemoryRawArchive(), BASE_URL
    )


def _count(session: Session, model: type) -> int:
    return session.scalar(select(func.count()).select_from(model)) or 0


def _synthetic_drucksache(vorgang_id: str) -> dict:
    return {
        "id": "999001",
        "titel": "Entwurf eines Testgesetzes",
        "dokumentnummer": "21/9999",
        "drucksachetyp": "Gesetzentwurf",
        "herausgeber": "BT",
        "datum": "2026-07-01",
        "aktualisiert": "2026-07-01T10:00:00+02:00",
        "fundstelle": {"pdf_url": "https://dserver.bundestag.de/btd/21/099/2109999.pdf"},
        "vorgangsbezug": [{"id": vorgang_id, "titel": "x", "vorgangstyp": "Gesetzgebung"}],
    }


def test_drucksache_import_creates_source_items(
    session: Session, dip_transport: httpx.MockTransport
) -> None:
    _seed_vorgaenge(session, dip_transport)
    _, result = run_drucksache_import(
        session, DipClient(api_key="t", transport=dip_transport), InMemoryRawArchive(), BASE_URL
    )
    # Die Fixture enthaelt 100 Drucksachen.
    assert result.fetched == 100
    assert result.created == 100
    assert result.rejected == 0


def test_document_links_to_existing_vorgang(
    session: Session, dip_transport: httpx.MockTransport
) -> None:
    _seed_vorgaenge(session, dip_transport)
    source = get_or_create_dip_source(session, BASE_URL)
    vorgang_id = session.scalar(
        select(Identifier.value).where(Identifier.scheme == "dip_vorgang")
    )
    assert vorgang_id is not None

    outcome = ingest_drucksache(
        session, source, _synthetic_drucksache(vorgang_id), InMemoryRawArchive()
    )
    assert outcome == "created"

    matter = session.scalar(
        select(Matter).join(Identifier, Identifier.matter_id == Matter.id).where(
            Identifier.scheme == "dip_vorgang", Identifier.value == vorgang_id
        )
    )
    assert matter is not None
    docs = get_matter_documents(session, matter.id)
    assert len(docs) == 1
    assert docs[0].document_number == "21/9999"
    assert docs[0].url is not None and docs[0].url.endswith(".pdf")


def test_document_link_is_idempotent(
    session: Session, dip_transport: httpx.MockTransport
) -> None:
    _seed_vorgaenge(session, dip_transport)
    source = get_or_create_dip_source(session, BASE_URL)
    vorgang_id = session.scalar(
        select(Identifier.value).where(Identifier.scheme == "dip_vorgang")
    )
    assert vorgang_id is not None
    doc = _synthetic_drucksache(vorgang_id)

    ingest_drucksache(session, source, doc, InMemoryRawArchive())
    second = ingest_drucksache(session, source, dict(doc), InMemoryRawArchive())

    assert second == "unchanged"
    assert _count(session, Document) == 1


def test_document_not_linked_when_vorgang_absent(
    session: Session, dip_transport: httpx.MockTransport
) -> None:
    _seed_vorgaenge(session, dip_transport)
    source = get_or_create_dip_source(session, BASE_URL)

    before_items = _count(session, SourceItem)
    outcome = ingest_drucksache(
        session, source, _synthetic_drucksache("000-existiert-nicht"), InMemoryRawArchive()
    )
    assert outcome == "created"  # Quellitem entsteht,
    assert _count(session, Document) == 0  # aber keine Verknuepfung
    assert _count(session, SourceItem) == before_items + 1
