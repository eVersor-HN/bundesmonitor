"""Celery-Anwendung und Beat-Zeitplan.

Broker und Result-Backend: Redis. Der Beat-Zeitplan haelt die Poll-Intervalle
der Quellen. In Phase 0 nur ein Heartbeat; DIP-Import kommt in Phase 1 hinzu.
"""

from __future__ import annotations

from bundesmonitor_core.config import get_settings
from celery import Celery

settings = get_settings()

celery_app = Celery(
    "bundesmonitor",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=[
        "bundesmonitor_worker.tasks.health",
        "bundesmonitor_worker.tasks.dip",
        "bundesmonitor_worker.tasks.rss",
        "bundesmonitor_worker.tasks.votes",
    ],
)

celery_app.conf.update(
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,
    task_track_started=True,
    timezone="Europe/Berlin",
    enable_utc=True,
    result_expires=3600,
)

# Beat-Zeitplan: Quellen-Polls und Wartung.
celery_app.conf.beat_schedule = {
    "heartbeat": {
        "task": "bundesmonitor_worker.tasks.health.heartbeat",
        "schedule": 60.0,
    },
    # DIP-Inkrementallauf alle 15 Minuten (Poll-Intervall der Quelle).
    "dip-incremental": {
        "task": "bundesmonitor_worker.tasks.dip.incremental_import",
        "schedule": 900.0,
    },
    # RSS-Quellen (Bundesregierung, BGBl) alle 5 Minuten.
    "rss-import": {
        "task": "bundesmonitor_worker.tasks.rss.rss_import",
        "schedule": 300.0,
    },
    # Namentliche Abstimmungen stuendlich (Plenartage sind selten).
    "votes-import": {
        "task": "bundesmonitor_worker.tasks.votes.votes_import",
        "schedule": 3600.0,
    },
}
