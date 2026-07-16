"""Live-Kennzahlen: serverseitig editierbare Quelle der Wahrheit.

Liefert genau ein flaches JSON-Objekt (Vertrag ``LiveData``). Die Werte
stammen aus der editierbaren Datei ``data/kennzahlen.json``. Bei fehlender
oder defekter Datei wird ein leeres Fallback-Objekt mit ``version 0``
zurueckgegeben, damit der Client den Ausfall erkennen kann.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter

router = APIRouter(prefix="/api/v1", tags=["kennzahlen"])

_DATA_PATH = Path(__file__).parent.parent / "data" / "kennzahlen.json"


@router.get("/kennzahlen")
def kennzahlen() -> dict[str, Any]:
    try:
        with _DATA_PATH.open(encoding="utf-8") as fh:
            data: dict[str, Any] = json.load(fh)
    except (OSError, json.JSONDecodeError):
        return {"version": 0}
    return data
