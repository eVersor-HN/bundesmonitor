"""Der RSS-Import-Task ist registriert und im Beat-Zeitplan verankert."""

from __future__ import annotations

import bundesmonitor_worker.tasks.rss  # noqa: F401  (registriert den Task)
from bundesmonitor_worker.celery_app import celery_app

TASK_NAME = "bundesmonitor_worker.tasks.rss.rss_import"


def test_rss_task_registered() -> None:
    assert TASK_NAME in celery_app.tasks


def test_rss_task_in_beat_schedule() -> None:
    schedule = celery_app.conf.beat_schedule
    entry = next((e for e in schedule.values() if e["task"] == TASK_NAME), None)
    assert entry is not None
    assert entry["schedule"] == 300.0
