"""Zugriff auf die gespeicherten echten DIP-Fixtures."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

FIXTURE_DIR = Path(__file__).parent / "fixtures" / "dip"
RSS_DIR = Path(__file__).parent / "fixtures" / "rss"


def load_fixture(name: str) -> dict[str, Any]:
    return json.loads((FIXTURE_DIR / name).read_text(encoding="utf-8"))


def load_rss(name: str) -> bytes:
    return (RSS_DIR / name).read_bytes()
