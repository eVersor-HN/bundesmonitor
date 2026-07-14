"""End-to-end-Ingestion gegen SQLite: Upserts, Idempotenz, Versionierung, Themen.

Deckt die Akzeptanzkriterien aus Phase 1 ab: derselbe Lauf erzeugt keine
Duplikate, ein geaenderter Quelleintrag erzeugt eine neue Version.
"""

from __future__ import annotations

import httpx
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from bundesmonitor_core.ingestion.archive import InMemoryRawArchive
from bundesmonitor_core.ingestion.dip.client import DipClient
from bundesmonitor_core.ingestion.dip.ingest import (
    get_or_create_dip_source,
    ingest_document,
    run_incremental_import,
)
from bundesmonitor_core.models import Event, Matter, MatterTopic, SourceItem
from dip_fixtures import load_fixture

BASE_URL = "https://search.dip.bundestag.de/api/v1"


def _count(session: Session, model: type) -> int:
    return session.scalar(select(func.count()).select_from(model)) or 0


def test_full_import_creates_matters_and_events(
    session: Session, dip_transport: httpx.MockTransport
) -> None:
    client = DipClient(api_key="test", transport=dip_transport)
    archive = InMemoryRawArchive()

    run, result = run_incremental_import(session, client, archive, BASE_URL)

    assert result.fetched == 200
    assert result.created == 200
    assert result.rejected == 0
    assert _count(session, Matter) == 200
    assert _count(session, SourceItem) == 200
    assert _count(session, Event) == 200
    assert run.status == "success"
    assert run.created_count == 200
    # Roharchiv wurde befuellt (Regel: erst archivieren, dann normalisieren).
    assert len(archive.objects) == 200


def test_topics_from_official_metadata_are_linked(
    session: Session, dip_transport: httpx.MockTransport
) -> None:
    client = DipClient(api_key="test", transport=dip_transport)
    run_incremental_import(session, client, InMemoryRawArchive(), BASE_URL)
    # In der Fixture haben etliche Vorgaenge Sachgebiet/Deskriptor.
    assert _count(session, MatterTopic) > 0


def test_reingest_is_idempotent(
    session: Session, dip_transport: httpx.MockTransport
) -> None:
    archive = InMemoryRawArchive()
    client = DipClient(api_key="t", transport=dip_transport)
    run_incremental_import(session, client, archive, BASE_URL)
    matters_after_first = _count(session, Matter)
    events_after_first = _count(session, Event)

    # Zweiter Lauf, identische Daten.
    _, result = run_incremental_import(
        session, DipClient(api_key="t", transport=dip_transport), archive, BASE_URL
    )

    assert result.created == 0
    assert result.unchanged == 200
    assert _count(session, Matter) == matters_after_first
    assert _count(session, Event) == events_after_first


def test_changed_source_creates_new_version(
    session: Session, dip_transport: httpx.MockTransport
) -> None:
    client = DipClient(api_key="t", transport=dip_transport)
    run_incremental_import(session, client, InMemoryRawArchive(), BASE_URL)

    source = get_or_create_dip_source(session, BASE_URL)
    doc = load_fixture("vorgang_page1.json")["documents"][0]
    external_id = str(doc["id"])

    # Inhaltliche Aenderung -> neue Version.
    changed = dict(doc)
    changed["titel"] = doc["titel"] + " (Neufassung)"
    outcome = ingest_document(session, source, changed, InMemoryRawArchive())
    assert outcome == "updated"

    versions = session.scalars(
        select(SourceItem).where(SourceItem.external_id == f"vorgang:{external_id}")
    ).all()
    assert len(versions) == 2
    current = [v for v in versions if v.is_current]
    assert len(current) == 1
    assert current[0].version_no == 2

    matter = session.scalar(select(Matter).where(Matter.short_title.like("%Neufassung%")))
    assert matter is not None
