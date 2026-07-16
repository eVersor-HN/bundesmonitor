"""DIP-Client: Pagination, Fehlerklassifizierung und Retry gegen echte Fixtures."""

from __future__ import annotations

import httpx
import pytest

from bundesmonitor_core.ingestion.dip.client import (
    ENTITY_VORGANG,
    DipApiError,
    DipClient,
    TransientDipError,
)


def test_iterates_all_pages(dip_transport: httpx.MockTransport) -> None:
    client = DipClient(api_key="test", transport=dip_transport)
    docs = list(client.iter_documents(ENTITY_VORGANG))
    # Seite 1 (100) + Seite 2 (100), danach leere Seite -> Ende.
    assert len(docs) == 200
    ids = [d["id"] for d in docs]
    assert len(set(ids)) == 200  # keine Ueberlappung zwischen den Seiten


def test_empty_result_terminates() -> None:
    def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"numFound": 0, "documents": [], "cursor": "*"})

    client = DipClient(api_key="test", transport=httpx.MockTransport(handler))
    assert list(client.iter_documents(ENTITY_VORGANG)) == []


def test_4xx_raises_permanent() -> None:
    def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(400, json={"code": 400, "message": "Invalid cursor"})

    client = DipClient(api_key="test", transport=httpx.MockTransport(handler))
    with pytest.raises(DipApiError) as exc:
        client.fetch_page(ENTITY_VORGANG)
    assert exc.value.status_code == 400


def test_5xx_retries_then_raises() -> None:
    calls = {"n": 0}

    def handler(_: httpx.Request) -> httpx.Response:
        calls["n"] += 1
        return httpx.Response(503, text="unavailable")

    client = DipClient(api_key="test", max_attempts=3, transport=httpx.MockTransport(handler))
    with pytest.raises(TransientDipError):
        client.fetch_page(ENTITY_VORGANG)
    assert calls["n"] == 3  # es wurde bis max_attempts wiederholt
