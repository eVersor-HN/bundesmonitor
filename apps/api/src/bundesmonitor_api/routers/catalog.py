"""Themenkatalog und Quellenstatus."""

from __future__ import annotations

from dataclasses import asdict
from typing import Annotated

from bundesmonitor_core.feed import get_stats, list_topics, source_status
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from bundesmonitor_api.deps import get_db
from bundesmonitor_api.schemas import SourceStatusOut, StatsOut, TopicCountOut

router = APIRouter(prefix="/api/v1", tags=["catalog"])


@router.get("/topics", response_model=list[TopicCountOut])
def topics(
    db: Annotated[Session, Depends(get_db)], scheme: str | None = None
) -> list[TopicCountOut]:
    return [TopicCountOut(**asdict(t)) for t in list_topics(db, scheme)]


@router.get("/sources/status", response_model=list[SourceStatusOut])
def sources_status(db: Annotated[Session, Depends(get_db)]) -> list[SourceStatusOut]:
    return [SourceStatusOut(**asdict(s)) for s in source_status(db)]


@router.get("/stats", response_model=StatsOut)
def stats(db: Annotated[Session, Depends(get_db)]) -> StatsOut:
    return StatsOut(**asdict(get_stats(db)))
