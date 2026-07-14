"""Pydantic-Antwortmodelle der oeffentlichen API."""

from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel


class TopicOut(BaseModel):
    key: str
    scheme: str
    label: str


class FeedItemOut(BaseModel):
    event_id: str
    event_type: str
    title: str
    status_after: str | None
    published_at: datetime | None
    occurred_at: datetime | None
    discovered_at: datetime
    source_name: str | None
    source_url: str | None
    matter_slug: str | None
    matter_title: str | None
    matter_type: str | None
    current_status: str | None
    topics: list[TopicOut]


class FeedResponse(BaseModel):
    items: list[FeedItemOut]
    next_cursor: str | None
    generated_at: datetime


class IdentifierOut(BaseModel):
    scheme: str
    value: str
    issuer: str | None


class MatterDetailOut(BaseModel):
    slug: str
    title: str
    short_title: str | None
    description: str | None
    matter_type: str
    current_status: str | None
    first_seen_at: datetime
    last_event_at: datetime | None
    topics: list[TopicOut]
    identifiers: list[IdentifierOut]


class TimelineEventOut(BaseModel):
    event_id: str
    event_type: str
    title: str
    status_after: str | None
    published_at: datetime | None
    occurred_at: datetime | None
    source_url: str | None


class DocumentOut(BaseModel):
    title: str | None
    document_type: str | None
    document_number: str | None
    publisher: str | None
    document_date: date | None
    url: str | None


class TopicCountOut(BaseModel):
    key: str
    scheme: str
    label: str
    matter_count: int


class StatsOut(BaseModel):
    matters: int
    events: int
    events_7d: int
    laws_promulgated: int
    documents: int


class SourceStatusOut(BaseModel):
    key: str
    name: str
    status: str
    last_success_at: datetime | None
    last_new_item_at: datetime | None
    expected_frequency_seconds: int
    known_limitation: str | None
