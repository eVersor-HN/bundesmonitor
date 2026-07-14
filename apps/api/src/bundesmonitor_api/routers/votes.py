"""Namentliche Abstimmungen: Liste (mit Fraktions-Aggregat) und Einzelstimmen."""

from __future__ import annotations

import uuid
from typing import Annotated, Any

from bundesmonitor_core.models import Matter, RollCallVote
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from bundesmonitor_api.deps import get_db

router = APIRouter(prefix="/api/v1", tags=["votes"])


class VoteOut(BaseModel):
    id: str
    vote_date: str | None
    title: str
    wahlperiode: int
    sitzung: int
    abstimm_nr: int
    totals: dict[str, int]
    by_fraktion: list[dict[str, Any]]
    matter_slug: str | None
    xlsx_url: str | None
    pdf_url: str | None


class VoteDetailOut(VoteOut):
    einzelstimmen: list[dict[str, str]]


def _to_out(vote: RollCallVote, slug: str | None) -> VoteOut:
    return VoteOut(
        id=str(vote.id),
        vote_date=vote.vote_date.isoformat() if vote.vote_date else None,
        title=vote.title,
        wahlperiode=vote.wahlperiode,
        sitzung=vote.sitzung,
        abstimm_nr=vote.abstimm_nr,
        totals=vote.totals,
        by_fraktion=vote.by_fraktion,
        matter_slug=slug,
        xlsx_url=vote.xlsx_url,
        pdf_url=vote.pdf_url,
    )


@router.get("/votes", response_model=list[VoteOut])
def list_votes(
    db: Annotated[Session, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    matter_slug: str | None = None,
) -> list[VoteOut]:
    stmt = (
        select(RollCallVote, Matter.public_slug)
        .join(Matter, Matter.id == RollCallVote.matter_id, isouter=True)
        .order_by(
            RollCallVote.vote_date.desc().nulls_last(),
            RollCallVote.sitzung.desc(),
            RollCallVote.abstimm_nr.desc(),
        )
        .limit(limit)
    )
    if matter_slug is not None:
        stmt = stmt.where(Matter.public_slug == matter_slug)
    rows = db.execute(stmt).all()
    return [_to_out(vote, slug) for vote, slug in rows]


@router.get("/votes/{vote_id}", response_model=VoteDetailOut)
def vote_detail(vote_id: str, db: Annotated[Session, Depends(get_db)]) -> VoteDetailOut:
    try:
        key = uuid.UUID(vote_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Abstimmung nicht gefunden.") from exc
    row = db.execute(
        select(RollCallVote, Matter.public_slug)
        .join(Matter, Matter.id == RollCallVote.matter_id, isouter=True)
        .where(RollCallVote.id == key)
    ).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Abstimmung nicht gefunden.")
    vote, slug = row
    base = _to_out(vote, slug)
    return VoteDetailOut(**base.model_dump(), einzelstimmen=vote.einzelstimmen or [])
