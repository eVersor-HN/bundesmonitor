"""Vorgangspositionen als Verfahrensschritte am Vorgang (Vorgangsreise)."""

from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from bundesmonitor_core.ingestion.archive import InMemoryRawArchive
from bundesmonitor_core.ingestion.dip.ingest import (
    get_or_create_dip_source,
    ingest_vorgangsposition,
)
from bundesmonitor_core.models import Event, Identifier, Matter

BASE_URL = "https://search.dip.bundestag.de/api/v1"


def _matter_with_vorgang(session: Session, vorgang_id: str) -> Matter:
    matter = Matter(
        matter_type="gesetzgebung",
        canonical_title="Ein Gesetz",
        first_seen_at=datetime(2026, 1, 1, tzinfo=UTC),
        public_slug=f"ein-gesetz-{vorgang_id}",
    )
    session.add(matter)
    session.flush()
    session.add(Identifier(matter_id=matter.id, scheme="dip_vorgang", value=vorgang_id))
    session.flush()
    return matter


def _position(vorgang_id: str, step: str = "1. Beratung") -> dict:
    return {
        "id": "9001",
        "vorgang_id": vorgang_id,
        "vorgangsposition": step,
        "titel": "Gesetzentwurf der Bundesregierung",
        "datum": "2026-05-10",
        "aktualisiert": "2026-05-10T12:00:00+02:00",
    }


def test_position_creates_event_on_matter(session: Session) -> None:
    matter = _matter_with_vorgang(session, "123")
    source = get_or_create_dip_source(session, BASE_URL)
    outcome = ingest_vorgangsposition(session, source, _position("123"), InMemoryRawArchive())
    assert outcome == "created"

    event = session.scalar(select(Event).where(Event.matter_id == matter.id))
    assert event is not None
    assert event.title == "1. Beratung"


def test_position_is_idempotent(session: Session) -> None:
    _matter_with_vorgang(session, "123")
    source = get_or_create_dip_source(session, BASE_URL)
    doc = _position("123")
    ingest_vorgangsposition(session, source, doc, InMemoryRawArchive())
    second = ingest_vorgangsposition(session, source, dict(doc), InMemoryRawArchive())
    assert second == "unchanged"
    assert (session.scalar(select(func.count()).select_from(Event)) or 0) == 1


def test_position_without_matter_creates_no_event(session: Session) -> None:
    source = get_or_create_dip_source(session, BASE_URL)
    outcome = ingest_vorgangsposition(
        session, source, _position("999-fehlt"), InMemoryRawArchive()
    )
    assert outcome == "created"  # Quellitem entsteht
    assert (session.scalar(select(func.count()).select_from(Event)) or 0) == 0
