"""Health-Endpunkte: Liveness ist immer ok; Readiness meldet DB-Ausfall als 503."""

from __future__ import annotations

from fastapi.testclient import TestClient

from bundesmonitor_api.main import app

client = TestClient(app)


def test_liveness_ok() -> None:
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_root_metadata() -> None:
    resp = client.get("/")
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "Bundesmonitor API"
    assert body["health"] == "/health"


def test_readiness_reports_db_state() -> None:
    # Ohne laufende DB liefert Readiness 503; mit DB 200. Beide Faelle sind valide,
    # aber der 'database'-Check muss immer vorhanden sein.
    resp = client.get("/health/ready")
    assert resp.status_code in (200, 503)
    assert "database" in resp.json()
