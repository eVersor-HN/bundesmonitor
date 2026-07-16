"""RSS-Ingestion: Items archivieren, versionieren, als Ereignisse normalisieren.

Bundesregierung-Pressemitteilungen werden zu eigenstaendigen Ereignissen. BGBl-
Eintraege werden ueber die GESTA-Nummer mit einem bereits vorhandenen
Gesetzesvorgang (DIP) verknuepft und reichern dessen Kennungen (ELI/BGBl) an.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from bundesmonitor_core.ingestion.archive import RawArchive
from bundesmonitor_core.ingestion.dip.ingest import IngestResult
from bundesmonitor_core.ingestion.rss.parser import ParsedFeedItem, parse_feed, to_payload
from bundesmonitor_core.models import Event, Identifier, IngestRun, Source, SourceItem
from bundesmonitor_core.models.enums import EventType, IngestStatus, SourceType
from bundesmonitor_core.storage import sha256_hex


@dataclass(frozen=True)
class RssSourceSpec:
    key: str
    name: str
    url: str
    event_type: str
    quality_grade: str = "A"
    poll_seconds: int = 300


RSS_SOURCES: dict[str, RssSourceSpec] = {
    "bundesregierung_press": RssSourceSpec(
        key="bundesregierung_press",
        name="Bundesregierung Pressemitteilungen",
        url="https://www.bundesregierung.de/service/rss/breg-de/1151244/feed.xml",
        event_type=EventType.PUBLISHED.value,
    ),
    "bgbl_1": RssSourceSpec(
        key="bgbl_1",
        name="Bundesgesetzblatt Teil I",
        url="https://www.recht.bund.de/rss/feeds/rss_bgbl-1.xml",
        event_type=EventType.PROMULGATED.value,
    ),
}


def _now() -> datetime:
    return datetime.now(UTC)


def get_or_create_rss_source(session: Session, spec: RssSourceSpec) -> Source:
    source = session.scalar(select(Source).where(Source.key == spec.key))
    if source is None:
        source = Source(
            key=spec.key,
            name=spec.name,
            base_url=spec.url,
            source_type=SourceType.RSS.value,
            quality_grade=spec.quality_grade,
            polling_seconds=spec.poll_seconds,
            enabled=True,
        )
        session.add(source)
        session.flush()
    return source


def fetch_feed_bytes(
    url: str, user_agent: str, timeout: float = 30.0, transport: httpx.BaseTransport | None = None
) -> bytes:
    headers = {"User-Agent": user_agent}
    with httpx.Client(timeout=timeout, headers=headers, transport=transport) as client:
        resp = client.get(url)
        resp.raise_for_status()
        return resp.content


def _upsert_source_item(
    session: Session, source: Source, item: ParsedFeedItem, archive: RawArchive, now: datetime
) -> tuple[SourceItem | None, str]:
    external_id = f"rss:{source.key}:{item.external_id}"
    payload = to_payload(item)
    data = json.dumps(payload, sort_keys=True, ensure_ascii=False).encode("utf-8")
    digest = sha256_hex(data)

    existing = session.scalar(
        select(SourceItem).where(
            SourceItem.source_id == source.id,
            SourceItem.external_id == external_id,
            SourceItem.sha256 == digest,
        )
    )
    if existing is not None:
        return existing, "unchanged"

    raw_key = archive.archive(source.key, data, "application/json", "json")
    new_item = SourceItem(
        source_id=source.id,
        external_id=external_id,
        canonical_url=item.link,
        content_type="application/rss+xml",
        published_at=item.published_at,
        source_updated_at=item.published_at,
        discovered_at=now,
        fetched_at=now,
        payload_json=payload,
        raw_object_key=raw_key,
        sha256=digest,
        version_no=1,
        is_current=True,
    )
    current = session.scalar(
        select(SourceItem).where(
            SourceItem.source_id == source.id,
            SourceItem.external_id == external_id,
            SourceItem.is_current.is_(True),
        )
    )
    if current is not None:
        current.is_current = False
        new_item.version_no = current.version_no + 1
        new_item.supersedes_id = current.id
        session.add(new_item)
        session.flush()
        return new_item, "updated"
    session.add(new_item)
    session.flush()
    return new_item, "created"


def _link_bgbl_to_matter(session: Session, item: ParsedFeedItem) -> Any | None:
    """Verknuepft ein BGBl-Item ueber die GESTA-Nummer mit einem vorhandenen
    Vorgang und ergaenzt dessen Kennungen (ELI/BGBl). Gibt matter_id zurueck."""
    gesta = item.meta.get("gesta")
    if not gesta:
        return None
    ident = session.scalar(
        select(Identifier).where(Identifier.scheme == "gesta", Identifier.value == gesta)
    )
    if ident is None:
        return None
    matter_id = ident.matter_id

    existing_values = {
        i.value
        for i in session.scalars(select(Identifier).where(Identifier.matter_id == matter_id))
    }
    extra: list[tuple[str, str]] = []
    if item.link and "/eli/" in item.link:
        eli = item.link.split("/eli/", 1)[1]
        extra.append(("eli", f"eli/{eli}"))
    fundstelle = item.meta.get("fundstelle")
    if fundstelle:
        extra.append(("bgbl", fundstelle))
    for scheme, value in extra:
        if value not in existing_values:
            session.add(
                Identifier(matter_id=matter_id, scheme=scheme, value=value, issuer="BGBl")
            )
    session.flush()
    return matter_id


def ingest_feed_item(
    session: Session, source: Source, spec: RssSourceSpec, item: ParsedFeedItem, archive: RawArchive
) -> str:
    now = _now()
    src_item, outcome = _upsert_source_item(session, source, item, archive, now)
    if src_item is None:
        return "rejected"
    if outcome == "unchanged":
        return "unchanged"

    matter_id = _link_bgbl_to_matter(session, item) if spec.key == "bgbl_1" else None

    dedupe_key = f"rss:{spec.key}:{item.external_id}:{item.published_at}"
    existing_event = session.scalar(select(Event).where(Event.dedupe_key == dedupe_key))
    if existing_event is None:
        session.add(
            Event(
                matter_id=matter_id,
                event_type=spec.event_type,
                title=item.title,
                summary=item.summary,
                published_at=item.published_at,
                discovered_at=now,
                source_item_id=src_item.id,
                dedupe_key=dedupe_key,
            )
        )
        session.flush()
    return outcome


def run_rss_import(
    session: Session, spec: RssSourceSpec, data: bytes, archive: RawArchive
) -> tuple[IngestRun, IngestResult]:
    source = get_or_create_rss_source(session, spec)
    run = IngestRun(source_id=source.id, started_at=_now(), status=IngestStatus.RUNNING.value)
    session.add(run)
    session.flush()

    result = IngestResult()
    try:
        for item in parse_feed(data):
            result.fetched += 1
            try:
                outcome = ingest_feed_item(session, source, spec, item, archive)
            except Exception as exc:  # ein defektes Item stoppt nicht den Lauf
                result.rejected += 1
                result.errors.append(f"{item.external_id}: {exc}")
                continue
            if outcome == "created":
                result.created += 1
            elif outcome == "updated":
                result.updated += 1
            elif outcome == "unchanged":
                result.unchanged += 1
            elif outcome == "rejected":
                result.rejected += 1
        run.status = (
            IngestStatus.SUCCESS.value if not result.errors else IngestStatus.PARTIAL.value
        )
    finally:
        run.finished_at = _now()
        run.fetched_count = result.fetched
        run.created_count = result.created
        run.updated_count = result.updated
        run.rejected_count = result.rejected
        run.error_summary = "; ".join(result.errors[:5]) if result.errors else None
        session.flush()
    return run, result
