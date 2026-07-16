"""Gemeinsame Test-Fixtures: SQLite-Session und ein DIP-MockTransport.

Der MockTransport liefert die echten, gespeicherten DIP-Antworten aus und
bildet die Cursor-Pagination nach (Seite 1 -> Seite 2 -> leer).
"""

from __future__ import annotations

from collections.abc import Iterator

import httpx
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from bundesmonitor_core.models import Base
from dip_fixtures import load_fixture


@pytest.fixture
def session() -> Iterator[Session]:
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    db = factory()
    try:
        yield db
    finally:
        db.close()
        engine.dispose()


@pytest.fixture
def dip_transport() -> httpx.MockTransport:
    page1 = load_fixture("vorgang_page1.json")
    page2 = load_fixture("vorgang_page2.json")
    empty = load_fixture("vorgang_empty.json")
    drucksache1 = load_fixture("drucksache_page1.json")
    cursor1 = page1["cursor"]

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.params.get("apikey"), "apikey fehlt"
        cursor = request.url.params.get("cursor")
        if request.url.path.endswith("/drucksache"):
            # Eine Drucksachen-Seite, danach leer.
            return httpx.Response(200, json=drucksache1 if cursor is None else empty)
        if cursor is None:
            return httpx.Response(200, json=page1)
        if cursor == cursor1:
            return httpx.Response(200, json=page2)
        return httpx.Response(200, json=empty)

    return httpx.MockTransport(handler)
