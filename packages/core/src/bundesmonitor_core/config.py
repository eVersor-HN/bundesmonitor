"""Zentrale Konfiguration.

Werte kommen primaer aus Umgebungsvariablen (Docker/Secret-Manager). Fuer die
lokale Entwicklung wird zusaetzlich eine ``.env`` im Repository-Wurzelverzeichnis
gelesen, falls vorhanden. Secrets gehoeren niemals ins Repository.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


def _find_repo_env() -> Path | None:
    """Sucht ausgehend vom Modul aufwaerts nach einer .env im Repo-Wurzelverzeichnis."""
    here = Path(__file__).resolve()
    for parent in here.parents:
        candidate = parent / ".env"
        if candidate.is_file():
            return candidate
        if (parent / ".git").exists():
            break
    return None


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_find_repo_env(),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_env: str = "development"
    app_base_url: str = "http://localhost:3000"
    api_base_url: str = "http://localhost:8000"

    database_url: str = (
        "postgresql+psycopg://bundesmonitor:bundesmonitor@localhost:5432/bundesmonitor"
    )
    redis_url: str = "redis://localhost:6379/0"

    # Object storage (MinIO lokal, S3 produktiv)
    s3_endpoint: str = "http://localhost:9000"
    s3_access_key: str = "bundesmonitor"
    s3_secret_key: str = "change-me"
    s3_bucket: str = "bundesmonitor-raw"
    s3_region: str = "eu-central-1"

    # Amtliche Quellen
    dip_api_key: str = ""
    dip_base_url: str = "https://search.dip.bundestag.de/api/v1"
    lobbyregister_api_key: str = ""

    # Fetcher-Identitaet
    source_user_agent: str = "Bundesmonitor/0.1 (+https://example.invalid/contact)"
    source_contact_email: str = ""

    # Selbstbetrieb: erlaubt den lokalen Refresh-Endpunkt (DIP-Import per App).
    # In oeffentlichen Deployments bleibt dies aus.
    self_host: bool = False
    # Optionales Shared Secret fuer den lokalen Refresh-Endpunkt. Ist es gesetzt,
    # duerfen auch Nicht-Loopback-Clients den Import ausloesen, sofern sie den Wert
    # im Header ``X-Local-Token`` mitsenden. Leer = nur Loopback erlaubt.
    local_refresh_token: str = ""

    # Optionale KI (standardmaessig aus)
    ai_summarization_enabled: bool = False

    # Beobachtbarkeit
    otel_exporter_otlp_endpoint: str = ""
    sentry_dsn: str = ""

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() in {"production", "prod"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
