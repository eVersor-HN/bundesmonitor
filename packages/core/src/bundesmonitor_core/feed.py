"""Lese-Queries fuer Feed, Vorgangsdetail, Themen und Quellenstatus.

Keyset-Pagination auf (published_at DESC, id DESC) fuer stabile, effiziente
Cursor. Die Feed-Karten enthalten die amtlichen Themen (gebuendelt geladen,
kein N+1) und den Originalquellen-Link.
"""

from __future__ import annotations

import base64
import binascii
import json
import uuid
from dataclasses import dataclass, field
from datetime import UTC, date, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from bundesmonitor_core.models import (
    Document,
    Event,
    IngestRun,
    Matter,
    MatterTopic,
    Source,
    SourceItem,
    Topic,
)
from bundesmonitor_core.models.enums import EventType

DEFAULT_LIMIT = 50
MAX_LIMIT = 100


@dataclass(frozen=True)
class TopicRef:
    key: str
    scheme: str
    label: str


@dataclass(frozen=True)
class FeedItem:
    event_id: str
    event_type: str
    title: str
    status_after: str | None
    published_at: datetime | None
    occurred_at: datetime | None
    discovered_at: datetime
    source_name: str | None
    source_url: str | None
    # Nur bei Ereignissen, die zu einem Vorgang gehoeren (z. B. DIP). RSS-Meldungen
    # (Pressemitteilung) sind vorgangslos.
    matter_slug: str | None = None
    matter_title: str | None = None
    matter_type: str | None = None
    current_status: str | None = None
    topics: list[TopicRef] = field(default_factory=list)


@dataclass(frozen=True)
class FeedFilters:
    topic_keys: tuple[str, ...] = ()
    party_keys: tuple[str, ...] = ()
    ort_keys: tuple[str, ...] = ()
    matter_types: tuple[str, ...] = ()
    statuses: tuple[str, ...] = ()
    text: str | None = None


@dataclass(frozen=True)
class FeedPage:
    items: list[FeedItem]
    next_cursor: str | None


def encode_cursor(published_at: datetime, event_id: str) -> str:
    payload = json.dumps({"p": published_at.isoformat(), "i": event_id})
    return base64.urlsafe_b64encode(payload.encode("utf-8")).decode("ascii")


def decode_cursor(cursor: str) -> tuple[datetime, str] | None:
    try:
        payload = json.loads(base64.urlsafe_b64decode(cursor.encode("ascii")))
        return datetime.fromisoformat(payload["p"]), str(payload["i"])
    except (binascii.Error, ValueError, KeyError, TypeError):
        return None


def _as_uuid(value: uuid.UUID | str) -> uuid.UUID:
    return value if isinstance(value, uuid.UUID) else uuid.UUID(str(value))


def _load_topics_for_matters(
    session: Session, matter_ids: list[uuid.UUID]
) -> dict[str, list[TopicRef]]:
    if not matter_ids:
        return {}
    rows = session.execute(
        select(MatterTopic.matter_id, Topic.key, Topic.scheme, Topic.label)
        .join(Topic, Topic.id == MatterTopic.topic_id)
        .where(MatterTopic.matter_id.in_(matter_ids))
    ).all()
    result: dict[str, list[TopicRef]] = {}
    for matter_id, key, scheme, label in rows:
        result.setdefault(str(matter_id), []).append(TopicRef(key, scheme, label))
    return result


def query_feed(
    session: Session,
    filters: FeedFilters | None = None,
    cursor: str | None = None,
    limit: int = DEFAULT_LIMIT,
) -> FeedPage:
    filters = filters or FeedFilters()
    limit = max(1, min(limit, MAX_LIMIT))

    stmt = (
        select(Event, Matter, SourceItem.canonical_url, Source.name)
        .outerjoin(Matter, Matter.id == Event.matter_id)
        .join(SourceItem, SourceItem.id == Event.source_item_id)
        .join(Source, Source.id == SourceItem.source_id)
        .where(Event.published_at.is_not(None))
    )

    if filters.matter_types:
        stmt = stmt.where(Matter.matter_type.in_(filters.matter_types))
    if filters.statuses:
        stmt = stmt.where(Matter.current_status.in_(filters.statuses))
    if filters.text:
        # Freitextsuche ueber Ereignis-/Vorgangstitel und Beschreibung (case-insensitiv).
        like = f"%{filters.text.strip()}%"
        stmt = stmt.where(
            Event.title.ilike(like)
            | Matter.canonical_title.ilike(like)
            | Matter.short_title.ilike(like)
            | Matter.description.ilike(like)
        )

    # Themen/Partei/Ort sind Themen unterschiedlicher Schemata. Innerhalb einer
    # Dimension ODER, zwischen den Dimensionen UND (Facetten-Filter).
    for keys in (filters.topic_keys, filters.party_keys, filters.ort_keys):
        if keys:
            subq = (
                select(MatterTopic.matter_id)
                .join(Topic, Topic.id == MatterTopic.topic_id)
                .where(Topic.key.in_(keys))
            )
            stmt = stmt.where(Matter.id.in_(subq))

    if cursor is not None:
        decoded = decode_cursor(cursor)
        if decoded is not None:
            cur_published, cur_id = decoded
            cur_uuid = _as_uuid(cur_id)
            stmt = stmt.where(
                (Event.published_at < cur_published)
                | ((Event.published_at == cur_published) & (Event.id < cur_uuid))
            )

    stmt = stmt.order_by(Event.published_at.desc(), Event.id.desc()).limit(limit + 1)
    rows = session.execute(stmt).all()

    has_more = len(rows) > limit
    rows = rows[:limit]

    matter_ids = [matter.id for _event, matter, _url, _src in rows if matter is not None]
    topics_by_matter = _load_topics_for_matters(session, matter_ids)

    items: list[FeedItem] = []
    for event, matter, source_url, source_name in rows:
        items.append(
            FeedItem(
                event_id=str(event.id),
                event_type=event.event_type,
                title=event.title,
                status_after=event.status_after,
                published_at=event.published_at,
                occurred_at=event.occurred_at,
                discovered_at=event.discovered_at,
                source_name=source_name,
                source_url=source_url,
                matter_slug=matter.public_slug if matter is not None else None,
                matter_title=matter.canonical_title if matter is not None else None,
                matter_type=matter.matter_type if matter is not None else None,
                current_status=matter.current_status if matter is not None else None,
                topics=topics_by_matter.get(str(matter.id), []) if matter is not None else [],
            )
        )

    next_cursor: str | None = None
    if has_more and items:
        last = items[-1]
        if last.published_at is not None:
            next_cursor = encode_cursor(last.published_at, last.event_id)

    return FeedPage(items=items, next_cursor=next_cursor)


def get_matter_by_slug(session: Session, slug: str) -> Matter | None:
    return session.scalar(select(Matter).where(Matter.public_slug == slug))


@dataclass(frozen=True)
class TimelineEntry:
    event_id: str
    event_type: str
    title: str
    status_after: str | None
    published_at: datetime | None
    occurred_at: datetime | None
    discovered_at: datetime
    source_url: str | None


def get_matter_timeline(session: Session, matter_id: uuid.UUID | str) -> list[TimelineEntry]:
    mid = _as_uuid(matter_id)
    rows = session.execute(
        select(Event, SourceItem.canonical_url)
        .join(SourceItem, SourceItem.id == Event.source_item_id)
        .where(Event.matter_id == mid)
        .order_by(Event.published_at.desc().nulls_last(), Event.id.desc())
    ).all()
    return [
        TimelineEntry(
            event_id=str(event.id),
            event_type=event.event_type,
            title=event.title,
            status_after=event.status_after,
            published_at=event.published_at,
            occurred_at=event.occurred_at,
            discovered_at=event.discovered_at,
            source_url=source_url,
        )
        for event, source_url in rows
    ]


def get_matter_topics(session: Session, matter_id: uuid.UUID | str) -> list[TopicRef]:
    mid = _as_uuid(matter_id)
    return _load_topics_for_matters(session, [mid]).get(str(mid), [])


@dataclass(frozen=True)
class DocumentRef:
    title: str | None
    document_type: str | None
    document_number: str | None
    publisher: str | None
    document_date: date | None
    url: str | None


def get_matter_documents(session: Session, matter_id: uuid.UUID | str) -> list[DocumentRef]:
    mid = _as_uuid(matter_id)
    rows = session.scalars(
        select(Document)
        .where(Document.matter_id == mid)
        .order_by(Document.document_date.desc().nulls_last())
    )
    return [
        DocumentRef(
            title=d.title,
            document_type=d.document_type,
            document_number=d.document_number,
            publisher=d.publisher,
            document_date=d.document_date,
            url=d.url,
        )
        for d in rows
    ]


@dataclass(frozen=True)
class TopicCount:
    key: str
    scheme: str
    label: str
    matter_count: int


def list_topics(session: Session, scheme: str | None = None, limit: int = 100) -> list[TopicCount]:
    stmt = (
        select(Topic.key, Topic.scheme, Topic.label, func.count(MatterTopic.matter_id))
        .join(MatterTopic, MatterTopic.topic_id == Topic.id)
        .group_by(Topic.key, Topic.scheme, Topic.label)
        .order_by(func.count(MatterTopic.matter_id).desc())
        .limit(limit)
    )
    if scheme is not None:
        stmt = stmt.where(Topic.scheme == scheme)
    return [TopicCount(k, s, la, c) for k, s, la, c in session.execute(stmt).all()]


@dataclass(frozen=True)
class SourceStatus:
    key: str
    name: str
    status: str
    last_success_at: datetime | None
    last_new_item_at: datetime | None
    expected_frequency_seconds: int
    known_limitation: str | None


@dataclass(frozen=True)
class Stats:
    matters: int
    events: int
    events_7d: int
    laws_promulgated: int
    documents: int


def get_stats(session: Session) -> Stats:
    def count(model: type) -> int:
        return session.scalar(select(func.count()).select_from(model)) or 0

    week_ago = datetime.now(UTC) - timedelta(days=7)
    events_7d = (
        session.scalar(
            select(func.count()).select_from(Event).where(Event.published_at >= week_ago)
        )
        or 0
    )
    laws = (
        session.scalar(
            select(func.count())
            .select_from(Event)
            .where(Event.event_type == EventType.PROMULGATED.value)
        )
        or 0
    )
    return Stats(
        matters=count(Matter),
        events=count(Event),
        events_7d=events_7d,
        laws_promulgated=laws,
        documents=count(Document),
    )


def source_status(session: Session) -> list[SourceStatus]:
    result: list[SourceStatus] = []
    for source in session.scalars(select(Source).order_by(Source.name)):
        last_run = session.scalar(
            select(IngestRun)
            .where(IngestRun.source_id == source.id, IngestRun.status.in_(("success", "partial")))
            .order_by(IngestRun.finished_at.desc().nulls_last())
            .limit(1)
        )
        status = "unknown"
        if last_run is not None:
            status = "healthy" if last_run.status == "success" else "degraded"
        result.append(
            SourceStatus(
                key=source.key,
                name=source.name,
                status=status,
                last_success_at=last_run.finished_at if last_run else None,
                last_new_item_at=last_run.finished_at if last_run else None,
                expected_frequency_seconds=source.polling_seconds,
                known_limitation=None,
            )
        )
    return result
