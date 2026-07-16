"""Feed-Queries: Cursor-Pagination, Themenfilter, Detail/Timeline gegen Fixturdaten."""

from __future__ import annotations

import httpx
from sqlalchemy.orm import Session

from bundesmonitor_core.feed import (
    FeedFilters,
    decode_cursor,
    encode_cursor,
    get_matter_by_slug,
    get_matter_timeline,
    list_topics,
    query_feed,
)
from bundesmonitor_core.ingestion.archive import InMemoryRawArchive
from bundesmonitor_core.ingestion.dip.client import DipClient
from bundesmonitor_core.ingestion.dip.ingest import run_incremental_import

BASE_URL = "https://search.dip.bundestag.de/api/v1"


def _seed(session: Session, transport: httpx.MockTransport) -> None:
    client = DipClient(api_key="t", transport=transport)
    run_incremental_import(session, client, InMemoryRawArchive(), BASE_URL)


def test_feed_paginates_without_overlap(
    session: Session, dip_transport: httpx.MockTransport
) -> None:
    _seed(session, dip_transport)

    seen: set[str] = set()
    cursor: str | None = None
    pages = 0
    while True:
        page = query_feed(session, cursor=cursor, limit=40)
        for item in page.items:
            assert item.event_id not in seen  # keine Duplikate ueber Seiten
            seen.add(item.event_id)
        pages += 1
        if page.next_cursor is None:
            break
        cursor = page.next_cursor
        assert pages < 20  # Terminierungs-Sicherung

    assert len(seen) == 200
    assert pages >= 5


def test_feed_sorted_by_published_desc(
    session: Session, dip_transport: httpx.MockTransport
) -> None:
    _seed(session, dip_transport)
    page = query_feed(session, limit=50)
    published = [i.published_at for i in page.items if i.published_at]
    assert published == sorted(published, reverse=True)


def test_feed_items_have_source_link(
    session: Session, dip_transport: httpx.MockTransport
) -> None:
    _seed(session, dip_transport)
    page = query_feed(session, limit=10)
    for item in page.items:
        assert item.source_url and item.source_url.startswith("https://dip.bundestag.de/vorgang/")


def test_topic_filter_narrows_results(
    session: Session, dip_transport: httpx.MockTransport
) -> None:
    _seed(session, dip_transport)
    topics = list_topics(session)
    assert topics
    top_key = topics[0].key
    filtered = query_feed(session, filters=FeedFilters(topic_keys=(top_key,)), limit=100)
    assert filtered.items
    # Jeder gefilterte Eintrag traegt das gewaehlte Thema.
    for item in filtered.items:
        assert any(t.key == top_key for t in item.topics)


def test_matter_detail_and_timeline(
    session: Session, dip_transport: httpx.MockTransport
) -> None:
    _seed(session, dip_transport)
    first = query_feed(session, limit=1).items[0]
    matter = get_matter_by_slug(session, first.matter_slug)
    assert matter is not None
    timeline = get_matter_timeline(session, str(matter.id))
    assert len(timeline) >= 1


def test_cursor_roundtrip() -> None:
    from datetime import UTC, datetime

    now = datetime(2026, 7, 10, 12, 0, tzinfo=UTC)
    decoded = decode_cursor(encode_cursor(now, "abc"))
    assert decoded == (now, "abc")
