"""Celery-Task: namentliche Abstimmungen des Bundestages importieren."""

from __future__ import annotations

from typing import Any

from bundesmonitor_core.config import get_settings
from bundesmonitor_core.db import session_scope
from bundesmonitor_core.ingestion.archive import S3RawArchive
from bundesmonitor_core.ingestion.votes.ingest import run_votes_import
from bundesmonitor_core.storage import ensure_bucket

from bundesmonitor_worker.celery_app import celery_app


def _run_votes() -> dict[str, Any]:
    settings = get_settings()
    ensure_bucket()
    archive = S3RawArchive()
    with session_scope() as session:
        _, r = run_votes_import(session, archive, settings.source_user_agent, limit=30)
        return {
            "fetched": r.fetched,
            "created": r.created,
            "updated": r.updated,
            "rejected": r.rejected,
        }


@celery_app.task(name="bundesmonitor_worker.tasks.votes.votes_import")
def votes_import() -> dict[str, Any]:
    return _run_votes()
