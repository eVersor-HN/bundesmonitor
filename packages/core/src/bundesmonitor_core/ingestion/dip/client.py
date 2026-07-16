"""HTTP-Client fuer die DIP-API.

Beachtet die dokumentierten Regeln: eindeutiger User-Agent, harte Timeouts,
exponentieller Backoff mit Jitter nur bei transienten Fehlern, keine endlosen
Wiederholungen bei 4xx. Cursor-Pagination bis zum Ende.

Der Transport ist injizierbar, damit Tests gegen gespeicherte Fixtures laufen
koennen (httpx.MockTransport), ohne echte Netzwerkaufrufe.
"""

from __future__ import annotations

from collections.abc import Iterator
from typing import Any

import httpx
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential_jitter,
)


class TransientDipError(RuntimeError):
    """Voruebergehender Fehler (5xx/429/Timeout) - Wiederholung sinnvoll."""


class DipApiError(RuntimeError):
    """Endgueltiger Fehler (z. B. 4xx) - keine Wiederholung."""

    def __init__(self, status_code: int, message: str) -> None:
        super().__init__(f"DIP {status_code}: {message}")
        self.status_code = status_code


# Bekannte Entitaetstypen der DIP-API.
ENTITY_VORGANG = "vorgang"
ENTITY_VORGANGSPOSITION = "vorgangsposition"
ENTITY_DRUCKSACHE = "drucksache"


class DipClient:
    def __init__(
        self,
        api_key: str,
        base_url: str = "https://search.dip.bundestag.de/api/v1",
        user_agent: str = "Bundesmonitor/0.1 (+https://example.invalid/contact)",
        timeout_seconds: float = 30.0,
        max_attempts: int = 4,
        transport: httpx.BaseTransport | None = None,
    ) -> None:
        self._api_key = api_key
        self._max_attempts = max_attempts
        self._client = httpx.Client(
            base_url=base_url.rstrip("/"),
            timeout=timeout_seconds,
            headers={"User-Agent": user_agent, "Accept": "application/json"},
            transport=transport,
        )

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> DipClient:
        return self

    def __exit__(self, *exc: object) -> None:
        self.close()

    def _request_page(self, entity: str, params: dict[str, str]) -> dict[str, Any]:
        query = {**params, "apikey": self._api_key}

        @retry(
            reraise=True,
            retry=retry_if_exception_type((TransientDipError, httpx.TransportError)),
            wait=wait_exponential_jitter(initial=1, max=20),
            stop=stop_after_attempt(self._max_attempts),
        )
        def _do() -> dict[str, Any]:
            resp = self._client.get(f"/{entity}", params=query)
            if resp.status_code >= 500 or resp.status_code == 429:
                raise TransientDipError(f"{entity} -> HTTP {resp.status_code}")
            if resp.status_code >= 400:
                raise DipApiError(resp.status_code, resp.text[:200])
            data: dict[str, Any] = resp.json()
            return data

        return _do()

    def fetch_page(
        self, entity: str, params: dict[str, str] | None = None, cursor: str | None = None
    ) -> dict[str, Any]:
        """Eine einzelne Ergebnisseite (fuer gezielte Abfragen/Tests)."""
        merged = dict(params or {})
        if cursor is not None:
            merged["cursor"] = cursor
        return self._request_page(entity, merged)

    def iter_documents(
        self, entity: str, params: dict[str, str] | None = None
    ) -> Iterator[dict[str, Any]]:
        """Iteriert per Cursor ueber alle Dokumente eines Entitaetstyps.

        Endet, wenn eine Seite leer ist oder der zurueckgegebene Cursor sich
        nicht mehr aendert (DIP-Konvention fuer 'keine weiteren Ergebnisse').
        """
        base = dict(params or {})
        cursor: str | None = None
        while True:
            data = self.fetch_page(entity, base, cursor=cursor)
            documents: list[dict[str, Any]] = data.get("documents", [])
            yield from documents
            new_cursor = data.get("cursor")
            if not documents or new_cursor == cursor or new_cursor is None:
                break
            cursor = new_cursor
