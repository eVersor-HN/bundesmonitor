"""Feed-Endpunkt: chronologischer Gesamtfeed mit Cursor-Pagination und Filtern."""

from __future__ import annotations

from dataclasses import asdict
from datetime import UTC, datetime
from typing import Annotated

from bundesmonitor_core.feed import DEFAULT_LIMIT, MAX_LIMIT, FeedFilters, query_feed
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from bundesmonitor_api.deps import get_db
from bundesmonitor_api.schemas import FeedItemOut, FeedResponse

router = APIRouter(prefix="/api/v1", tags=["feed"])


@router.get("/events", response_model=FeedResponse)
def events(
    db: Annotated[Session, Depends(get_db)],
    cursor: str | None = None,
    limit: Annotated[int, Query(ge=1, le=MAX_LIMIT)] = DEFAULT_LIMIT,
    topic: Annotated[list[str], Query()] = [],  # noqa: B006  (FastAPI-Query-Default)
    party: Annotated[list[str], Query()] = [],  # noqa: B006
    bundesland: Annotated[list[str], Query()] = [],  # noqa: B006
    matter_type: Annotated[list[str], Query()] = [],  # noqa: B006
    status: Annotated[list[str], Query()] = [],  # noqa: B006
    q: str | None = None,
) -> FeedResponse:
    filters = FeedFilters(
        topic_keys=tuple(topic),
        party_keys=tuple(party),
        ort_keys=tuple(bundesland),
        matter_types=tuple(matter_type),
        statuses=tuple(status),
        text=q,
    )
    page = query_feed(db, filters, cursor, limit)
    return FeedResponse(
        items=[FeedItemOut(**asdict(item)) for item in page.items],
        next_cursor=page.next_cursor,
        generated_at=datetime.now(UTC),
    )
