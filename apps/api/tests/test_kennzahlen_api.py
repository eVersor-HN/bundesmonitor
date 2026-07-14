"""Kennzahlen-Endpoint: liefert das flache Live-Daten-Objekt (Vertrag LiveData)."""

from __future__ import annotations

from fastapi.testclient import TestClient

from bundesmonitor_api.main import app

client = TestClient(app)


def test_kennzahlen_returns_contract() -> None:
    resp = client.get("/api/v1/kennzahlen")
    assert resp.status_code == 200
    body = resp.json()
    assert body["version"] == 2
    assert body["schuldenBundEur"] == 1840600000000
