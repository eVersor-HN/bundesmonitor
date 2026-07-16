"""FastAPI-Abhaengigkeiten (Dependency Injection)."""

from __future__ import annotations

from collections.abc import Iterator

from bundesmonitor_core.db import get_session
from sqlalchemy.orm import Session


def get_db() -> Iterator[Session]:
    db = get_session()
    try:
        yield db
    finally:
        db.close()
