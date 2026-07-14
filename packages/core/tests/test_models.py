"""Sanity-Checks fuer das Datenmodell (echte Parser-Tests folgen in Phase 1)."""

from __future__ import annotations

from bundesmonitor_core.models import Base, Event, EventType, Matter

EXPECTED_TABLES = {
    "organizations",
    "sources",
    "ingest_runs",
    "source_items",
    "matters",
    "identifiers",
    "events",
    "documents",
    "topics",
    "matter_topics",
    "source_health",
}


def test_all_tables_registered() -> None:
    assert set(Base.metadata.tables) >= EXPECTED_TABLES


def test_source_item_identity_is_unique() -> None:
    # Deduplizierung haengt an (source_id, external_id, sha256).
    item = Base.metadata.tables["source_items"]
    unique_cols = {
        tuple(c.name for c in con.columns)
        for con in item.constraints
        if con.__class__.__name__ == "UniqueConstraint"
    }
    assert ("source_id", "external_id", "sha256") in unique_cols


def test_event_requires_source_item() -> None:
    # Jedes sichtbare Ereignis muss auf ein Quellelement zeigen (Nachweispflicht).
    assert Event.__table__.c.source_item_id.nullable is False


def test_matter_slug_is_unique() -> None:
    assert Matter.__table__.c.public_slug.unique is True


def test_event_type_vocabulary_present() -> None:
    assert EventType.PROMULGATED.value == "promulgated"
    assert EventType.ADOPTED_BUNDESTAG.value == "adopted_bundestag"
