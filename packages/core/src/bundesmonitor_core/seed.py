"""Lokaler Seed ohne Docker.

Legt das Schema in der konfigurierten Datenbank an (typisch eine SQLite-Datei
via ``DATABASE_URL=sqlite:///...``) und importiert die DIP-Vorgaenge und
-Drucksachen einmalig, damit die App auf einem Testgeraet echte Daten zeigt.
Kein Postgres/Redis/MinIO noetig; das Roharchiv laeuft im Speicher.

Aufruf:  python -m bundesmonitor_core.seed --limit 200
"""

from __future__ import annotations

import argparse

from sqlalchemy import select

from bundesmonitor_core.config import get_settings
from bundesmonitor_core.db import get_engine, get_session
from bundesmonitor_core.ingestion.archive import InMemoryRawArchive
from bundesmonitor_core.ingestion.dip.client import DipClient
from bundesmonitor_core.ingestion.dip.ingest import (
    run_drucksache_import,
    run_incremental_import,
    run_vorgangsposition_import,
)
from bundesmonitor_core.ingestion.rss.ingest import (
    RSS_SOURCES,
    fetch_feed_bytes,
    run_rss_import,
)
from bundesmonitor_core.models import Base, Identifier, Matter


def main() -> int:
    parser = argparse.ArgumentParser(description="DIP einmalig in die lokale DB laden.")
    parser.add_argument("--limit", type=int, default=200, help="max. Datensaetze je Entitaet")
    args = parser.parse_args()

    settings = get_settings()
    if not settings.dip_api_key:
        print("FEHLER: DIP_API_KEY fehlt in .env")
        return 1

    engine = get_engine()
    print(f"Datenbank: {engine.url}")
    Base.metadata.create_all(engine)

    archive = InMemoryRawArchive()
    session = get_session()
    base = settings.dip_base_url

    def _client() -> DipClient:
        return DipClient(
            api_key=settings.dip_api_key,
            base_url=base,
            user_agent=settings.source_user_agent,
        )

    try:
        # 1. Aktuelle Vorgaenge (Grundlage des Jetzt-Feeds).
        _, v = run_incremental_import(session, _client(), archive, base, limit=args.limit)
        session.commit()

        # 2. Gesetzgebungs-Vorgaenge (mehrstufige Vorgangsreise).
        run_incremental_import(
            session, _client(), archive, base, limit=60,
            extra_params={"f.vorgangstyp": "Gesetzgebung"},
        )
        session.commit()

        # 3. Drucksachen.
        _, d = run_drucksache_import(session, _client(), archive, base, limit=args.limit)
        session.commit()

        # 4. Vorgangspositionen gezielt fuer die Gesetzgebungs-Vorgaenge (volle Reise).
        law_ids = list(
            session.scalars(
                select(Identifier.value)
                .join(Matter, Matter.id == Identifier.matter_id)
                .where(Identifier.scheme == "dip_vorgang", Matter.matter_type == "gesetzgebung")
            )
        )
        _, p = run_vorgangsposition_import(
            session, _client(), archive, base, vorgang_ids=law_ids
        )
        session.commit()

        print(
            f"Vorgaenge: {v.created} neu. "
            f"Drucksachen: {d.created} neu, {d.documents_linked} verknuepft. "
            f"Positionen: {p.created} neu (fuer {len(law_ids)} Gesetze)."
        )

        for spec in RSS_SOURCES.values():
            try:
                data = fetch_feed_bytes(spec.url, settings.source_user_agent)
                _, r = run_rss_import(session, spec, data, archive)
                session.commit()
                print(f"{spec.name}: {r.created} neu, {r.unchanged} unveraendert.")
            except Exception as exc:  # noqa: BLE001
                print(f"{spec.name}: uebersprungen ({exc})")
    finally:
        session.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
