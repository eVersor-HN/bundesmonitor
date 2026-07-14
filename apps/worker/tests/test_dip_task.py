"""Der DIP-Import-Task ist registriert und im Beat-Zeitplan verankert."""

from __future__ import annotations

import bundesmonitor_worker.tasks.dip  # noqa: F401  (registriert den Task)
from bundesmonitor_worker.celery_app import celery_app

TASK_NAME = "bundesmonitor_worker.tasks.dip.incremental_import"


def test_dip_task_registered() -> None:
    assert TASK_NAME in celery_app.tasks


def test_dip_task_in_beat_schedule() -> None:
    schedule = celery_app.conf.beat_schedule
    assert any(entry["task"] == TASK_NAME for entry in schedule.values())
    dip_entry = next(e for e in schedule.values() if e["task"] == TASK_NAME)
    assert dip_entry["schedule"] == 900.0
