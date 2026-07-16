"""RSS-Parser und -Ingestion gegen echte Fixtures (Bundesregierung, BGBl)."""

from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from bundesmonitor_core.feed import query_feed
from bundesmonitor_core.ingestion.archive import InMemoryRawArchive
from bundesmonitor_core.ingestion.rss.ingest import (
    RSS_SOURCES,
    get_or_create_rss_source,
    ingest_feed_item,
    run_rss_import,
)
from bundesmonitor_core.ingestion.rss.parser import ParsedFeedItem, parse_feed
from bundesmonitor_core.models import Event, Identifier, Matter, SourceItem
from dip_fixtures import load_rss


def _count(session: Session, model: type) -> int:
    return session.scalar(select(func.count()).select_from(model)) or 0


def test_parse_bundesregierung() -> None:
    items = parse_feed(load_rss("bundesregierung_press.xml"))
    assert len(items) == 20
    first = items[0]
    assert first.title
    assert first.link and first.link.startswith("https://")
    assert first.published_at is not None  # RFC-822 geparst


def test_parse_bgbl_metadata() -> None:
    items = parse_feed(load_rss("bgbl_1.xml"))
    assert len(items) >= 100
    # Amtliche Metadaten sind vorhanden.
    with_fundstelle = [i for i in items if i.meta.get("fundstelle")]
    assert with_fundstelle
    assert any("typ" in i.meta for i in items)


def test_ingest_bundesregierung_creates_events(session: Session) -> None:
    spec = RSS_SOURCES["bundesregierung_press"]
    data = load_rss("bundesregierung_press.xml")
    _, result = run_rss_import(session, spec, data, InMemoryRawArchive())
    assert result.fetched == 20
    assert result.created == 20
    assert _count(session, Event) == 20
    # Pressemeldungen sind vorgangslos.
    matterless = session.scalar(
        select(func.count()).select_from(Event).where(Event.matter_id.is_(None))
    )
    assert matterless == 20


def test_rss_import_is_idempotent(session: Session) -> None:
    spec = RSS_SOURCES["bundesregierung_press"]
    data = load_rss("bundesregierung_press.xml")
    run_rss_import(session, spec, data, InMemoryRawArchive())
    _, result = run_rss_import(session, spec, data, InMemoryRawArchive())
    assert result.created == 0
    assert result.unchanged == 20
    assert _count(session, Event) == 20


def test_bgbl_links_to_existing_vorgang_via_gesta(session: Session) -> None:
    # Vorgang mit GESTA-Kennung anlegen (wie aus DIP).
    matter = Matter(
        matter_type="gesetzgebung",
        canonical_title="Ein Gesetz",
        first_seen_at=datetime(2026, 1, 1, tzinfo=UTC),
        public_slug="ein-gesetz-1",
    )
    session.add(matter)
    session.flush()
    session.add(Identifier(matter_id=matter.id, scheme="gesta", value="G123", issuer="DIP"))
    session.flush()

    spec = RSS_SOURCES["bgbl_1"]
    source = get_or_create_rss_source(session, spec)
    item = ParsedFeedItem(
        external_id="https://www.recht.bund.de/eli/bund/bgbl-1/2026/200",
        title="Ein Gesetz",
        link="https://www.recht.bund.de/eli/bund/bgbl-1/2026/200",
        summary=None,
        published_at=datetime(2026, 7, 10, tzinfo=UTC),
        meta={"gesta": "G123", "fundstelle": "BGBl. 2026 I Nr. 200", "typ": "Gesetz"},
    )
    outcome = ingest_feed_item(session, source, spec, item, InMemoryRawArchive())
    assert outcome == "created"

    event = session.scalar(select(Event).where(Event.event_type == "promulgated"))
    assert event is not None
    assert event.matter_id == matter.id  # ueber GESTA verknuepft

    idents = session.scalars(select(Identifier).where(Identifier.matter_id == matter.id))
    schemes = {i.scheme for i in idents}
    assert "eli" in schemes and "bgbl" in schemes


def test_rss_events_appear_in_feed(session: Session) -> None:
    spec = RSS_SOURCES["bundesregierung_press"]
    run_rss_import(session, spec, load_rss("bundesregierung_press.xml"), InMemoryRawArchive())
    page = query_feed(session, limit=50)
    assert page.items
    pm = page.items[0]
    assert pm.source_name == "Bundesregierung Pressemitteilungen"
    assert pm.matter_slug is None  # vorgangslos
    assert pm.source_url is not None


def test_source_item_count_matches(session: Session) -> None:
    spec = RSS_SOURCES["bundesregierung_press"]
    run_rss_import(session, spec, load_rss("bundesregierung_press.xml"), InMemoryRawArchive())
    assert _count(session, SourceItem) == 20
