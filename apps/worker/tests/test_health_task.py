"""Der Heartbeat liefert einen ok-Status mit Zeitstempel - ohne Broker pruefbar."""

from __future__ import annotations

from datetime import datetime

from bundesmonitor_worker.celery_app import celery_app
from bundesmonitor_worker.tasks.health import _heartbeat, heartbeat


def test_heartbeat_payload() -> None:
    result = _heartbeat()
    assert result["status"] == "ok"
    assert result["service"] == "worker"
    # Zeitstempel ist parsebar
    datetime.fromisoformat(result["checked_at"])


def test_celery_app_registers_task() -> None:
    assert "bundesmonitor_worker.tasks.health.heartbeat" in celery_app.tasks


def test_task_runs_eagerly() -> None:
    celery_app.conf.task_always_eager = True
    try:
        result = heartbeat.apply().get()
    finally:
        celery_app.conf.task_always_eager = False
    assert result["status"] == "ok"
