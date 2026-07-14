"""Celery-Task: inkrementeller DIP-Import.

Bestimmt das Startdatum aus dem letzten erfolgreichen Lauf minus Ueberlappung
(Regel: 15-Minuten-Quellenverzoegerung beruecksichtigen). Beim allerersten Lauf
wird ein begrenztes Zeitfenster geladen, kein vollstaendiger Backfill.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from bundesmonitor_core.config import get_settings
from bundesmonitor_core.db import session_scope
from bundesmonitor_core.ingestion.archive import S3RawArchive
from bundesmonitor_core.ingestion.dip.client import DipClient
from bundesmonitor_core.ingestion.dip.ingest import (
    get_or_create_dip_source,
    run_drucksache_import,
    run_incremental_import,
    run_vorgangsposition_import,
)
from bundesmonitor_core.models import IngestRun
from bundesmonitor_core.models.enums import IngestStatus
from bundesmonitor_core.storage import ensure_bucket
from sqlalchemy import select

from bundesmonitor_worker.celery_app import celery_app

OVERLAP = timedelta(minutes=30)
INITIAL_WINDOW = timedelta(days=2)


def _run_import() -> dict[str, Any]:
    settings = get_settings()
    ensure_bucket()

    client = DipClient(
        api_key=settings.dip_api_key,
        base_url=settings.dip_base_url,
        user_agent=settings.source_user_agent,
    )
    archive = S3RawArchive()

    with session_scope() as session:
        source = get_or_create_dip_source(session, settings.dip_base_url)
        last = session.scalar(
            select(IngestRun)
            .where(
                IngestRun.source_id == source.id,
                IngestRun.status == IngestStatus.SUCCESS.value,
            )
            .order_by(IngestRun.finished_at.desc().nulls_last())
            .limit(1)
        )
        if last is not None and last.finished_at is not None:
            updated_since = last.finished_at - OVERLAP
        else:
            updated_since = datetime.now(UTC) - INITIAL_WINDOW

        # Zuerst Vorgaenge (Feed-Grundlage), dann Drucksachen (verknuepfen Dokumente
        # mit den nun vorhandenen Vorgaengen).
        v_run, v_result = run_incremental_import(
            session, client, archive, settings.dip_base_url, updated_since=updated_since
        )
        d_run, d_result = run_drucksache_import(
            session, client, archive, settings.dip_base_url, updated_since=updated_since
        )
        p_run, p_result = run_vorgangsposition_import(
            session, client, archive, settings.dip_base_url, updated_since=updated_since
        )
        return {
            "vorgaenge": {
                "status": v_run.status,
                "fetched": v_result.fetched,
                "created": v_result.created,
                "updated": v_result.updated,
                "unchanged": v_result.unchanged,
                "rejected": v_result.rejected,
            },
            "drucksachen": {
                "status": d_run.status,
                "fetched": d_result.fetched,
                "created": d_result.created,
                "documents_linked": d_result.documents_linked,
                "rejected": d_result.rejected,
            },
            "vorgangspositionen": {
                "status": p_run.status,
                "fetched": p_result.fetched,
                "created": p_result.created,
                "rejected": p_result.rejected,
            },
        }


@celery_app.task(name="bundesmonitor_worker.tasks.dip.incremental_import")
def incremental_import() -> dict[str, Any]:
    return _run_import()
