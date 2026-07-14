"""Inkrementeller DIP-Import: Rohbytes archivieren, versionieren, normalisieren.

Ablauf je Dokument:
1. Kanonische Bytes hashen (Deduplizierung ueber sha256).
2. Rohbytes archivieren, ``source_items``-Version schreiben/aktualisieren.
3. Vorgang zu ``matters`` normalisieren, Identifikatoren/Themen verknuepfen.
4. Idempotentes Ereignis (dedupe_key) erzeugen.

Alle Schritte sind idempotent: derselbe Lauf erzeugt keine Duplikate.
"""

from __future__ import annotations

import json
import re
from collections.abc import Iterable
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from bundesmonitor_core.ingestion.archive import RawArchive
from bundesmonitor_core.ingestion.dip.client import (
    ENTITY_DRUCKSACHE,
    ENTITY_VORGANG,
    ENTITY_VORGANGSPOSITION,
    DipClient,
)
from bundesmonitor_core.ingestion.dip.parser import (
    ParsedDocument,
    ParsedTopic,
    ParsedVorgang,
    parse_datetime,
    parse_drucksache,
    parse_vorgang,
    parse_vorgangsposition,
    slugify,
)
from bundesmonitor_core.models import (
    Document,
    Event,
    Identifier,
    IngestRun,
    Matter,
    MatterTopic,
    Source,
    SourceItem,
    Topic,
)
from bundesmonitor_core.models.enums import IngestStatus, SourceType
from bundesmonitor_core.storage import sha256_hex

DIP_SOURCE_KEY = "dip"

# Die DIP-Website ist eine SPA mit Routen der Form /vorgang/<titel-slug>/<id>.
# Ohne Slug-Segment matcht die Route nicht und die Seite meldet "nicht
# gefunden" - der Slug selbst ist beliebig, entscheidend ist die ID.
_SLUG_RE = re.compile(r"[^a-z0-9]+")


def _dip_slug(titel: str | None) -> str:
    text = (titel or "").lower()
    for src, dst in (("ä", "ae"), ("ö", "oe"), ("ü", "ue"), ("ß", "ss")):
        text = text.replace(src, dst)
    return _SLUG_RE.sub("-", text).strip("-")[:80] or "vorgang"


def dip_web_vorgang_url(vorgang_id: str, titel: str | None) -> str:
    return f"https://dip.bundestag.de/vorgang/{_dip_slug(titel)}/{vorgang_id}"


def dip_web_drucksache_url(drucksache_id: str, titel: str | None) -> str:
    return f"https://dip.bundestag.de/drucksache/{_dip_slug(titel)}/{drucksache_id}"


def _now() -> datetime:
    return datetime.now(UTC)


def _canonical_bytes(doc: dict[str, Any]) -> bytes:
    return json.dumps(doc, sort_keys=True, ensure_ascii=False).encode("utf-8")


@dataclass
class IngestResult:
    fetched: int = 0
    created: int = 0
    updated: int = 0
    unchanged: int = 0
    rejected: int = 0
    events_created: int = 0
    documents_linked: int = 0
    errors: list[str] = field(default_factory=list)


def get_or_create_dip_source(session: Session, base_url: str) -> Source:
    source = session.scalar(select(Source).where(Source.key == DIP_SOURCE_KEY))
    if source is None:
        source = Source(
            key=DIP_SOURCE_KEY,
            name="DIP Bundestag/Bundesrat",
            base_url=base_url,
            source_type=SourceType.API.value,
            quality_grade="A",
            polling_seconds=900,
            enabled=True,
        )
        session.add(source)
        session.flush()
    return source


def _upsert_source_item(
    session: Session,
    source: Source,
    external_id: str,
    canonical_url: str,
    doc: dict[str, Any],
    archive: RawArchive,
    now: datetime,
) -> tuple[SourceItem | None, str]:
    if not external_id:
        return None, "rejected"

    data = _canonical_bytes(doc)
    digest = sha256_hex(data)

    # Exakt diese Version bereits vorhanden? -> unveraendert (Deduplizierung).
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
    published = doc.get("aktualisiert")

    item = SourceItem(
        source_id=source.id,
        external_id=external_id,
        canonical_url=canonical_url,
        content_type="application/json",
        published_at=parse_datetime(published),
        source_updated_at=parse_datetime(published),
        discovered_at=now,
        fetched_at=now,
        payload_json=doc,
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
        item.version_no = current.version_no + 1
        item.supersedes_id = current.id
        session.add(item)
        session.flush()
        return item, "updated"

    session.add(item)
    session.flush()
    return item, "created"


def _get_or_create_topic(session: Session, topic: ParsedTopic) -> Topic:
    key = f"{topic.scheme}:{slugify(topic.label)}"
    existing = session.scalar(select(Topic).where(Topic.key == key))
    if existing is not None:
        return existing
    created = Topic(key=key, label=topic.label, scheme=topic.scheme)
    session.add(created)
    session.flush()
    return created


def _upsert_matter(session: Session, parsed: ParsedVorgang, source_item: SourceItem) -> Matter:
    dip_ident = session.scalar(
        select(Identifier).where(
            Identifier.scheme == "dip_vorgang", Identifier.value == parsed.external_id
        )
    )
    if dip_ident is not None:
        matter = session.get(Matter, dip_ident.matter_id)
        assert matter is not None
        matter.canonical_title = parsed.canonical_title
        matter.short_title = parsed.short_title
        matter.description = parsed.description
        matter.current_status = parsed.current_status
        matter.matter_type = parsed.matter_type
    else:
        matter = Matter(
            matter_type=parsed.matter_type,
            canonical_title=parsed.canonical_title,
            short_title=parsed.short_title,
            description=parsed.description,
            current_status=parsed.current_status,
            jurisdiction="bund",
            first_seen_at=source_item.discovered_at,
            public_slug=parsed.public_slug,
        )
        session.add(matter)
        session.flush()

    existing_idents = session.scalars(
        select(Identifier).where(Identifier.matter_id == matter.id)
    )
    existing_ident_values = {i.value for i in existing_idents}
    for ident in parsed.identifiers:
        if ident.value not in existing_ident_values:
            session.add(
                Identifier(
                    matter_id=matter.id,
                    scheme=ident.scheme,
                    value=ident.value,
                    issuer=ident.issuer,
                )
            )

    linked_topic_ids = {
        mt.topic_id
        for mt in session.scalars(select(MatterTopic).where(MatterTopic.matter_id == matter.id))
    }
    for parsed_topic in parsed.topics:
        topic = _get_or_create_topic(session, parsed_topic)
        if topic.id not in linked_topic_ids:
            session.add(MatterTopic(matter_id=matter.id, topic_id=topic.id, origin="official"))
            linked_topic_ids.add(topic.id)

    session.flush()
    return matter


def _upsert_event(
    session: Session, parsed: ParsedVorgang, matter: Matter, source_item: SourceItem, now: datetime
) -> bool:
    if parsed.event is None:
        return False
    ev = parsed.event
    existing = session.scalar(select(Event).where(Event.dedupe_key == ev.dedupe_key))
    if existing is not None:
        return False
    occurred = (
        datetime.combine(ev.occurred_at, datetime.min.time(), tzinfo=UTC)
        if ev.occurred_at is not None
        else None
    )
    session.add(
        Event(
            matter_id=matter.id,
            event_type=ev.event_type,
            status_after=ev.status_after,
            title=ev.title,
            occurred_at=occurred,
            published_at=ev.published_at,
            discovered_at=now,
            source_item_id=source_item.id,
            dedupe_key=ev.dedupe_key,
        )
    )
    if ev.published_at is not None and (
        matter.last_event_at is None or ev.published_at > matter.last_event_at
    ):
        matter.last_event_at = ev.published_at
    session.flush()
    return True


def ingest_document(
    session: Session, source: Source, doc: dict[str, Any], archive: RawArchive
) -> str:
    """Verarbeitet ein einzelnes DIP-Vorgangsdokument. Gibt das Ergebnis zurueck."""
    now = _now()
    raw_id = str(doc.get("id") or "").strip()
    if not raw_id:
        return "rejected"
    # external_id wird nach Entitaetstyp namespaced, damit gleiche numerische IDs
    # von Vorgaengen und Drucksachen nicht als Versionen desselben Items kollidieren.
    item, outcome = _upsert_source_item(
        session,
        source,
        f"vorgang:{raw_id}",
        dip_web_vorgang_url(raw_id, doc.get("titel")),
        doc,
        archive,
        now,
    )
    if item is None:
        return "rejected"
    if outcome == "unchanged":
        return "unchanged"
    parsed = parse_vorgang(doc)
    matter = _upsert_matter(session, parsed, item)
    _upsert_event(session, parsed, matter, item, now)
    return outcome


def _upsert_document(session: Session, parsed: ParsedDocument, source_item: SourceItem) -> int:
    """Verknuepft eine Drucksache als Dokument mit allen referenzierten, bereits
    vorhandenen Vorgaengen. Idempotent ueber (matter_id, url)."""
    linked = 0
    for vorgang_id in parsed.vorgang_ids:
        ident = session.scalar(
            select(Identifier).where(
                Identifier.scheme == "dip_vorgang", Identifier.value == vorgang_id
            )
        )
        if ident is None:
            continue  # Vorgang (noch) nicht vorhanden -> nicht verknuepfbar
        existing = None
        if parsed.url is not None:
            existing = session.scalar(
                select(Document).where(
                    Document.matter_id == ident.matter_id, Document.url == parsed.url
                )
            )
        if existing is not None:
            existing.title = parsed.title
            existing.document_type = parsed.document_type
            existing.document_number = parsed.document_number
            continue
        session.add(
            Document(
                matter_id=ident.matter_id,
                source_item_id=source_item.id,
                document_type=parsed.document_type,
                title=parsed.title,
                document_number=parsed.document_number,
                publisher=parsed.publisher,
                document_date=parsed.document_date,
                url=parsed.url,
                mime_type=parsed.mime_type,
                sha256=parsed.sha256,
                language="de",
            )
        )
        linked += 1
    session.flush()
    return linked


def ingest_drucksache(
    session: Session, source: Source, doc: dict[str, Any], archive: RawArchive
) -> str:
    """Verarbeitet eine DIP-Drucksache: archivieren, versionieren, als Dokument
    mit den referenzierten Vorgaengen verknuepfen."""
    now = _now()
    raw_id = str(doc.get("id") or "").strip()
    if not raw_id:
        return "rejected"
    item, outcome = _upsert_source_item(
        session,
        source,
        f"drucksache:{raw_id}",
        dip_web_drucksache_url(raw_id, doc.get("titel")),
        doc,
        archive,
        now,
    )
    if item is None:
        return "rejected"
    if outcome == "unchanged":
        return "unchanged"
    parsed = parse_drucksache(doc)
    _upsert_document(session, parsed, item)
    return outcome


def ingest_vorgangsposition(
    session: Session, source: Source, doc: dict[str, Any], archive: RawArchive
) -> str:
    """Eine Vorgangsposition = ein Verfahrensschritt. Wird als Ereignis mit dem
    zugehoerigen Vorgang verknuepft (Grundlage der Vorgangsreise)."""
    now = _now()
    raw_id = str(doc.get("id") or "").strip()
    vorgang_id = str(doc.get("vorgang_id") or "").strip()
    if not raw_id or not vorgang_id:
        return "rejected"
    item, outcome = _upsert_source_item(
        session,
        source,
        f"vorgangsposition:{raw_id}",
        dip_web_vorgang_url(vorgang_id, doc.get("titel")),
        doc,
        archive,
        now,
    )
    if item is None:
        return "rejected"
    if outcome == "unchanged":
        return "unchanged"

    parsed = parse_vorgangsposition(doc)
    ident = session.scalar(
        select(Identifier).where(
            Identifier.scheme == "dip_vorgang", Identifier.value == vorgang_id
        )
    )
    if ident is None:
        return outcome  # Vorgang (noch) nicht vorhanden -> nur Quellitem

    dedupe_key = f"dip:vp:{raw_id}:{doc.get('aktualisiert')}"
    if session.scalar(select(Event).where(Event.dedupe_key == dedupe_key)) is None:
        occurred = (
            datetime.combine(parsed.occurred_at, datetime.min.time(), tzinfo=UTC)
            if parsed.occurred_at is not None
            else None
        )
        matter = session.get(Matter, ident.matter_id)
        session.add(
            Event(
                matter_id=ident.matter_id,
                event_type=parsed.event_type,
                title=parsed.step,
                summary=parsed.title if parsed.title != parsed.step else None,
                occurred_at=occurred,
                published_at=parsed.published_at,
                discovered_at=now,
                source_item_id=item.id,
                dedupe_key=dedupe_key,
            )
        )
        if (
            matter is not None
            and parsed.published_at is not None
            and (matter.last_event_at is None or parsed.published_at > matter.last_event_at)
        ):
            matter.last_event_at = parsed.published_at
        session.flush()
    return outcome


def run_vorgangsposition_import(
    session: Session,
    client: DipClient,
    archive: RawArchive,
    base_url: str,
    updated_since: datetime | None = None,
    limit: int | None = None,
    vorgang_ids: list[str] | None = None,
) -> tuple[IngestRun, IngestResult]:
    """Importiert Vorgangspositionen und verknuepft sie mit vorhandenen Vorgaengen.

    Mit ``vorgang_ids`` werden gezielt die Positionen dieser Vorgaenge geholt
    (Backfill je Vorgang -> vollstaendige Vorgangsreise). Ohne die Liste wird der
    globale, nach Aktualisierung sortierte Feed genutzt.
    """
    source = get_or_create_dip_source(session, base_url)
    run = IngestRun(source_id=source.id, started_at=_now(), status=IngestStatus.RUNNING.value)
    session.add(run)
    session.flush()

    result = IngestResult()

    def _documents() -> Iterable[dict[str, Any]]:
        if vorgang_ids:
            for vid in vorgang_ids:
                yield from client.iter_documents(ENTITY_VORGANGSPOSITION, {"f.vorgang": vid})
        else:
            params: dict[str, str] = {}
            if updated_since is not None:
                params["f.aktualisiert.start"] = updated_since.replace(microsecond=0).isoformat()
            yield from client.iter_documents(ENTITY_VORGANGSPOSITION, params)

    try:
        for doc in _documents():
            result.fetched += 1
            try:
                outcome = ingest_vorgangsposition(session, source, doc, archive)
            except Exception as exc:
                result.rejected += 1
                result.errors.append(f"{doc.get('id')}: {exc}")
                continue
            if outcome == "created":
                result.created += 1
            elif outcome == "updated":
                result.updated += 1
            elif outcome == "unchanged":
                result.unchanged += 1
            elif outcome == "rejected":
                result.rejected += 1
            if limit is not None and result.fetched >= limit:
                break
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


def run_incremental_import(
    session: Session,
    client: DipClient,
    archive: RawArchive,
    base_url: str,
    updated_since: datetime | None = None,
    limit: int | None = None,
    extra_params: dict[str, str] | None = None,
) -> tuple[IngestRun, IngestResult]:
    """Fuehrt einen inkrementellen Import der Vorgaenge aus.

    Der Cursor wird erst nach erfolgreicher Verarbeitung des gesamten Laufs
    ueber ``finished_at``/``status`` festgeschrieben. ``extra_params`` erlaubt
    z. B. eine Filterung nach Vorgangstyp.
    """
    source = get_or_create_dip_source(session, base_url)
    run = IngestRun(source_id=source.id, started_at=_now(), status=IngestStatus.RUNNING.value)
    session.add(run)
    session.flush()

    result = IngestResult()
    params: dict[str, str] = dict(extra_params or {})
    if updated_since is not None:
        params["f.aktualisiert.start"] = updated_since.replace(microsecond=0).isoformat()

    try:
        for doc in client.iter_documents(ENTITY_VORGANG, params):
            result.fetched += 1
            try:
                outcome = ingest_document(session, source, doc, archive)
            except Exception as exc:  # Ein fehlerhaftes Dokument stoppt nicht den Lauf.
                result.rejected += 1
                result.errors.append(f"{doc.get('id')}: {exc}")
                continue
            if outcome == "created":
                result.created += 1
            elif outcome == "updated":
                result.updated += 1
            elif outcome == "unchanged":
                result.unchanged += 1
            elif outcome == "rejected":
                result.rejected += 1
            if limit is not None and result.fetched >= limit:
                break

        run.status = (
            IngestStatus.SUCCESS.value if not result.errors else IngestStatus.PARTIAL.value
        )
    except Exception as exc:
        run.status = IngestStatus.FAILED.value
        result.errors.append(str(exc))
        raise
    finally:
        run.finished_at = _now()
        run.fetched_count = result.fetched
        run.created_count = result.created
        run.updated_count = result.updated
        run.rejected_count = result.rejected
        run.error_summary = "; ".join(result.errors[:5]) if result.errors else None
        session.flush()

    return run, result


def run_drucksache_import(
    session: Session,
    client: DipClient,
    archive: RawArchive,
    base_url: str,
    updated_since: datetime | None = None,
    limit: int | None = None,
) -> tuple[IngestRun, IngestResult]:
    """Importiert Drucksachen und verknuepft sie als Dokumente mit vorhandenen
    Vorgaengen. Sollte nach dem Vorgangsimport laufen, damit die Matters existieren."""
    source = get_or_create_dip_source(session, base_url)
    run = IngestRun(source_id=source.id, started_at=_now(), status=IngestStatus.RUNNING.value)
    session.add(run)
    session.flush()

    result = IngestResult()
    params: dict[str, str] = {}
    if updated_since is not None:
        params["f.aktualisiert.start"] = updated_since.replace(microsecond=0).isoformat()

    docs_before = session.scalar(select(func.count()).select_from(Document)) or 0
    try:
        for doc in client.iter_documents(ENTITY_DRUCKSACHE, params):
            result.fetched += 1
            try:
                outcome = ingest_drucksache(session, source, doc, archive)
            except Exception as exc:
                result.rejected += 1
                result.errors.append(f"{doc.get('id')}: {exc}")
                continue
            if outcome == "created":
                result.created += 1
            elif outcome == "updated":
                result.updated += 1
            elif outcome == "unchanged":
                result.unchanged += 1
            elif outcome == "rejected":
                result.rejected += 1
            if limit is not None and result.fetched >= limit:
                break
        run.status = (
            IngestStatus.SUCCESS.value if not result.errors else IngestStatus.PARTIAL.value
        )
    except Exception as exc:
        run.status = IngestStatus.FAILED.value
        result.errors.append(str(exc))
        raise
    finally:
        docs_after = session.scalar(select(func.count()).select_from(Document)) or 0
        result.documents_linked = docs_after - docs_before
        run.finished_at = _now()
        run.fetched_count = result.fetched
        run.created_count = result.created
        run.updated_count = result.updated
        run.rejected_count = result.rejected
        run.error_summary = "; ".join(result.errors[:5]) if result.errors else None
        session.flush()

    return run, result
