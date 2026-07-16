"""Celery-Task: RSS-Quellen (Bundesregierung, Bundesgesetzblatt) importieren."""

from __future__ import annotations

from typing import Any

from bundesmonitor_core.config import get_settings
from bundesmonitor_core.db import session_scope
from bundesmonitor_core.ingestion.archive import S3RawArchive
from bundesmonitor_core.ingestion.rss.ingest import (
    RSS_SOURCES,
    fetch_feed_bytes,
    run_rss_import,
)
from bundesmonitor_core.storage import ensure_bucket

from bundesmonitor_worker.celery_app import celery_app


def _run_rss() -> dict[str, Any]:
    settings = get_settings()
    ensure_bucket()
    archive = S3RawArchive()
    result: dict[str, Any] = {}
    with session_scope() as session:
        for spec in RSS_SOURCES.values():
            try:
                data = fetch_feed_bytes(spec.url, settings.source_user_agent)
                _, r = run_rss_import(session, spec, data, archive)
                result[spec.key] = {
                    "fetched": r.fetched,
                    "created": r.created,
                    "updated": r.updated,
                }
            except Exception as exc:  # eine Quelle darf nicht die anderen stoppen
                result[spec.key] = {"error": str(exc)}
    return result


@celery_app.task(name="bundesmonitor_worker.tasks.rss.rss_import")
def rss_import() -> dict[str, Any]:
    return _run_rss()
