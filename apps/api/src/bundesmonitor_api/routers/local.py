"""Lokaler Selbstbetrieb: DIP-Import per App ausloesen.

Nur aktiv, wenn ``SELF_HOST`` gesetzt ist. In oeffentlichen Deployments bleibt
der Endpunkt gesperrt (403), damit keine unauthentifizierte Schreiblast entsteht.
"""

from __future__ import annotations

from typing import Annotated

from bundesmonitor_core.config import get_settings
from bundesmonitor_core.ingestion.archive import InMemoryRawArchive
from bundesmonitor_core.ingestion.dip.client import DipClient
from bundesmonitor_core.ingestion.dip.ingest import (
    run_drucksache_import,
    run_incremental_import,
)
from bundesmonitor_core.ingestion.votes.ingest import run_votes_import
from bundesmonitor_core.models import Base
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from bundesmonitor_api.deps import get_db

router = APIRouter(prefix="/api/v1/local", tags=["local"])


class RefreshRequest(BaseModel):
    dip_api_key: str | None = None
    limit: int = 100


class RefreshResponse(BaseModel):
    vorgaenge_created: int
    drucksachen_created: int
    documents_linked: int
    abstimmungen_created: int


@router.post("/refresh", response_model=RefreshResponse)
def refresh(body: RefreshRequest, db: Annotated[Session, Depends(get_db)]) -> RefreshResponse:
    settings = get_settings()
    if not settings.self_host:
        raise HTTPException(status_code=403, detail="Selbstbetrieb nicht aktiviert (SELF_HOST).")

    key = (body.dip_api_key or settings.dip_api_key or "").strip()
    if not key:
        raise HTTPException(status_code=400, detail="Kein DIP-API-Schluessel angegeben.")

    limit = max(1, min(body.limit, 500))
    # Schema sicherstellen (SQLite-Schnellstart ohne Alembic).
    Base.metadata.create_all(db.get_bind())

    archive = InMemoryRawArchive()
    client = DipClient(
        api_key=key, base_url=settings.dip_base_url, user_agent=settings.source_user_agent
    )
    _, v = run_incremental_import(db, client, archive, settings.dip_base_url, limit=limit)
    client2 = DipClient(
        api_key=key, base_url=settings.dip_base_url, user_agent=settings.source_user_agent
    )
    _, d = run_drucksache_import(db, client2, archive, settings.dip_base_url, limit=limit)
    # Namentliche Abstimmungen (bundestag.de, kein API-Schluessel noetig).
    _, a = run_votes_import(db, archive, settings.source_user_agent, limit=min(limit, 30))
    db.commit()
    return RefreshResponse(
        vorgaenge_created=v.created,
        drucksachen_created=d.created,
        documents_linked=d.documents_linked,
        abstimmungen_created=a.created,
    )
