"""Vorgangsdetail und Ereigniszeitleiste."""

from __future__ import annotations

from typing import Annotated

from bundesmonitor_core.feed import (
    get_matter_by_slug,
    get_matter_documents,
    get_matter_timeline,
    get_matter_topics,
)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from bundesmonitor_api.deps import get_db
from bundesmonitor_api.schemas import (
    DocumentOut,
    IdentifierOut,
    MatterDetailOut,
    TimelineEventOut,
    TopicOut,
)

router = APIRouter(prefix="/api/v1/matters", tags=["matters"])


@router.get("/{slug}", response_model=MatterDetailOut)
def matter_detail(slug: str, db: Annotated[Session, Depends(get_db)]) -> MatterDetailOut:
    matter = get_matter_by_slug(db, slug)
    if matter is None:
        raise HTTPException(status_code=404, detail="Vorgang nicht gefunden")
    topics = get_matter_topics(db, matter.id)
    return MatterDetailOut(
        slug=matter.public_slug,
        title=matter.canonical_title,
        short_title=matter.short_title,
        description=matter.description,
        matter_type=matter.matter_type,
        current_status=matter.current_status,
        first_seen_at=matter.first_seen_at,
        last_event_at=matter.last_event_at,
        topics=[TopicOut(key=t.key, scheme=t.scheme, label=t.label) for t in topics],
        identifiers=[
            IdentifierOut(scheme=i.scheme, value=i.value, issuer=i.issuer)
            for i in matter.identifiers
        ],
    )


@router.get("/{slug}/timeline", response_model=list[TimelineEventOut])
def matter_timeline(
    slug: str, db: Annotated[Session, Depends(get_db)]
) -> list[TimelineEventOut]:
    matter = get_matter_by_slug(db, slug)
    if matter is None:
        raise HTTPException(status_code=404, detail="Vorgang nicht gefunden")
    entries = get_matter_timeline(db, matter.id)
    return [
        TimelineEventOut(
            event_id=e.event_id,
            event_type=e.event_type,
            title=e.title,
            status_after=e.status_after,
            published_at=e.published_at,
            occurred_at=e.occurred_at,
            source_url=e.source_url,
        )
        for e in entries
    ]


@router.get("/{slug}/documents", response_model=list[DocumentOut])
def matter_documents(slug: str, db: Annotated[Session, Depends(get_db)]) -> list[DocumentOut]:
    matter = get_matter_by_slug(db, slug)
    if matter is None:
        raise HTTPException(status_code=404, detail="Vorgang nicht gefunden")
    return [
        DocumentOut(
            title=d.title,
            document_type=d.document_type,
            document_number=d.document_number,
            publisher=d.publisher,
            document_date=d.document_date,
            url=d.url,
        )
        for d in get_matter_documents(db, matter.id)
    ]
