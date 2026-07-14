"""App-Version: server-seitig editierbar, fuer den In-App-Update-Hinweis.

Liefert die aktuell verfuegbare App-Version. Meldet der Endpoint einen
hoeheren ``versionCode`` als die installierte App, zeigt die App einen
Update-Hinweis mit Download-Link. Die Datei ``data/appversion.json`` wird bei
jedem Release aktualisiert (versionCode erhoehen, downloadUrl setzen).
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter

router = APIRouter(prefix="/api/v1", tags=["appversion"])

_DATA_PATH = Path(__file__).parent.parent / "data" / "appversion.json"


@router.get("/appversion")
def appversion() -> dict[str, Any]:
    try:
        with _DATA_PATH.open(encoding="utf-8") as fh:
            data: dict[str, Any] = json.load(fh)
    except (OSError, json.JSONDecodeError):
        return {"versionCode": 0}
    return data
