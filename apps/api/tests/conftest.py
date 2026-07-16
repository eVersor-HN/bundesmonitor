"""API-Testaufbau: SQLite-DB mit Beispieldaten, DB-Dependency ueberschrieben."""

from __future__ import annotations

import uuid
from collections.abc import Iterator
from datetime import UTC, datetime, timedelta

import pytest
from bundesmonitor_core.models import (
    Document,
    Event,
    Identifier,
    IngestRun,
    Matter,
    MatterTopic,
    Source,
    SourceItem,
    Topic,
)
from bundesmonitor_core.models.base import Base
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from bundesmonitor_api.deps import get_db
from bundesmonitor_api.main import app

NOW = datetime(2026, 7, 12, 8, 0, tzinfo=UTC)


def _seed(session: Session) -> None:
    source = Source(
        key="dip", name="DIP Bundestag/Bundesrat", source_type="api",
        polling_seconds=900, enabled=True, quality_grade="A",
    )
    session.add(source)
    session.flush()
    session.add(
        IngestRun(
            source_id=source.id, started_at=NOW - timedelta(minutes=5), finished_at=NOW,
            status="success", fetched_count=2, created_count=2,
        )
    )
    topic = Topic(key="sachgebiet:gesundheit", label="Gesundheit", scheme="sachgebiet")
    session.add(topic)
    session.flush()

    for idx, (title, minutes_ago) in enumerate([("Gesetz A", 60), ("Gesetz B", 10)], start=1):
        matter = Matter(
            matter_type="gesetzgebung", canonical_title=title, short_title=title,
            current_status="Noch nicht beraten", jurisdiction="bund",
            first_seen_at=NOW, public_slug=f"{title.lower().replace(' ', '-')}-{idx}",
        )
        session.add(matter)
        session.flush()
        session.add(
            Identifier(matter_id=matter.id, scheme="dip_vorgang", value=str(idx), issuer="DIP")
        )
        session.add(MatterTopic(matter_id=matter.id, topic_id=topic.id, origin="official"))
        item = SourceItem(
            source_id=source.id, external_id=str(idx),
            canonical_url=f"https://dip.bundestag.de/vorgang/{idx}",
            content_type="application/json", discovered_at=NOW, fetched_at=NOW,
            sha256=uuid.uuid4().hex + uuid.uuid4().hex,
        )
        session.add(item)
        session.flush()
        published = NOW - timedelta(minutes=minutes_ago)
        session.add(
            Event(
                matter_id=matter.id, event_type="status_updated", title=title,
                status_after="Noch nicht beraten", published_at=published,
                discovered_at=NOW, source_item_id=item.id, dedupe_key=f"k{idx}",
            )
        )
        matter.last_event_at = published
        session.add(
            Document(
                matter_id=matter.id, source_item_id=item.id, document_type="Gesetzentwurf",
                title=f"{title} (Drucksache)", document_number=f"21/{idx}00",
                publisher="BT", document_date=NOW.date(),
                url=f"https://dserver.bundestag.de/btd/21/{idx}00.pdf", mime_type="application/pdf",
            )
        )
    session.commit()


@pytest.fixture
def client() -> Iterator[TestClient]:
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    seed_session = factory()
    _seed(seed_session)

    def override_get_db() -> Iterator[object]:
        db = factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()
        seed_session.close()
        engine.dispose()
