"""Health- und Readiness-Endpunkte.

- ``/health``  Liveness: prozessintern, ohne externe Abhaengigkeiten.
- ``/health/ready``  Readiness: prueft DB-Erreichbarkeit; 503 wenn nicht bereit.
"""

from __future__ import annotations

from typing import Literal

from bundesmonitor_core.db import get_engine
from fastapi import APIRouter, Response, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "api"}


@router.get("/health/ready")
def ready(response: Response) -> dict[str, str | Literal["ok", "error"]]:
    checks: dict[str, str] = {}
    ok = True
    try:
        with get_engine().connect() as conn:
            conn.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except SQLAlchemyError as exc:
        checks["database"] = f"error: {exc.__class__.__name__}"
        ok = False

    if not ok:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return {"status": "ok" if ok else "error", **checks}
