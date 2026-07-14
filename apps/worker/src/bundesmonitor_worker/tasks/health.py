"""Heartbeat- und Health-Tasks.

Der Heartbeat bestaetigt, dass Worker und Beat laufen. Die Logik ist als reine
Funktion (``_heartbeat``) implementiert und getrennt vom Celery-Task, damit sie
ohne Broker testbar ist.
"""

from __future__ import annotations

from datetime import UTC, datetime

from bundesmonitor_worker.celery_app import celery_app


def _heartbeat() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "worker",
        "checked_at": datetime.now(UTC).isoformat(),
    }


@celery_app.task(name="bundesmonitor_worker.tasks.health.heartbeat")
def heartbeat() -> dict[str, str]:
    return _heartbeat()
