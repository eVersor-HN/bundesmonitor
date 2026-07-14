"""Feed-, Detail-, Themen- und Quellenstatus-Endpunkte gegen eine SQLite-Testdb."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_events_feed_returns_sorted_items_with_source(client: TestClient) -> None:
    resp = client.get("/api/v1/events")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["items"]) == 2
    # Neuestes zuerst (Gesetz B wurde spaeter veroeffentlicht).
    assert body["items"][0]["matter_title"] == "Gesetz B"
    first = body["items"][0]
    assert first["source_url"].startswith("https://dip.bundestag.de/vorgang/")
    assert first["topics"][0]["label"] == "Gesundheit"
    assert body["generated_at"]


def test_events_cursor_pagination(client: TestClient) -> None:
    page1 = client.get("/api/v1/events", params={"limit": 1}).json()
    assert len(page1["items"]) == 1
    assert page1["next_cursor"]

    page2 = client.get(
        "/api/v1/events", params={"limit": 1, "cursor": page1["next_cursor"]}
    ).json()
    assert len(page2["items"]) == 1
    assert page1["items"][0]["event_id"] != page2["items"][0]["event_id"]


def test_topic_filter(client: TestClient) -> None:
    hit = client.get("/api/v1/events", params={"topic": "sachgebiet:gesundheit"}).json()
    assert len(hit["items"]) == 2
    miss = client.get("/api/v1/events", params={"topic": "sachgebiet:existiert-nicht"}).json()
    assert miss["items"] == []


def test_matter_detail_and_404(client: TestClient) -> None:
    ok = client.get("/api/v1/matters/gesetz-a-1")
    assert ok.status_code == 200
    body = ok.json()
    assert body["title"] == "Gesetz A"
    assert any(i["scheme"] == "dip_vorgang" for i in body["identifiers"])

    assert client.get("/api/v1/matters/gibts-nicht").status_code == 404


def test_timeline(client: TestClient) -> None:
    resp = client.get("/api/v1/matters/gesetz-a-1/timeline")
    assert resp.status_code == 200
    entries = resp.json()
    assert len(entries) >= 1
    assert entries[0]["event_type"] == "status_updated"


def test_matter_documents(client: TestClient) -> None:
    resp = client.get("/api/v1/matters/gesetz-a-1/documents")
    assert resp.status_code == 200
    docs = resp.json()
    assert len(docs) == 1
    assert docs[0]["document_number"] == "21/100"
    assert docs[0]["url"].endswith(".pdf")
    assert client.get("/api/v1/matters/gibts-nicht/documents").status_code == 404


def test_topics_catalog(client: TestClient) -> None:
    topics = client.get("/api/v1/topics").json()
    gesundheit = next(t for t in topics if t["key"] == "sachgebiet:gesundheit")
    assert gesundheit["matter_count"] == 2


def test_local_refresh_forbidden_without_self_host(client: TestClient) -> None:
    # Standard: SELF_HOST ist aus -> Refresh-Endpunkt gesperrt.
    resp = client.post("/api/v1/local/refresh", json={"limit": 5})
    assert resp.status_code == 403


def test_sources_status(client: TestClient) -> None:
    sources = client.get("/api/v1/sources/status").json()
    dip = next(s for s in sources if s["key"] == "dip")
    assert dip["status"] == "healthy"
    assert dip["expected_frequency_seconds"] == 900
