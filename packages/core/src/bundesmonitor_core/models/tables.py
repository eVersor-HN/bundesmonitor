"""ORM-Tabellen fuer den DIP-MVP-Schnitt.

Bildet die getrennten Ebenen aus docs/05_DATA_MODEL.md ab: Rohquelle
(source_items) -> normalisierte Entitaet/Vorgang (matters) -> sichtbares
Ereignis (events). Geld/Votes/Personen folgen in spaeteren Phasen.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any

from sqlalchemy import (
    JSON,
    BigInteger,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB as PGJSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from bundesmonitor_core.models.base import Base, TimestampMixin, uuid_pk

# Portabler JSON-Typ: JSONB unter PostgreSQL (produktiv), generisches JSON sonst
# (z. B. SQLite im Test). So laeuft die volle Ingestion auch ohne Postgres.
JSONB = JSON().with_variant(PGJSONB(), "postgresql")


class Organization(Base, TimestampMixin):
    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = uuid_pk()
    official_name: Mapped[str] = mapped_column(String(500), nullable=False)
    short_name: Mapped[str | None] = mapped_column(String(120))
    organization_type: Mapped[str | None] = mapped_column(String(80))
    parent_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("organizations.id"))
    official_url: Mapped[str | None] = mapped_column(String(1000))
    valid_from: Mapped[date | None] = mapped_column(Date)
    valid_to: Mapped[date | None] = mapped_column(Date)
    identifiers: Mapped[dict[str, Any] | None] = mapped_column(JSONB)

    __table_args__ = (UniqueConstraint("official_name", name="uq_org_official_name"),)


class Source(Base, TimestampMixin):
    __tablename__ = "sources"

    id: Mapped[uuid.UUID] = uuid_pk()
    key: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    organization_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("organizations.id"))
    base_url: Mapped[str | None] = mapped_column(String(1000))
    source_type: Mapped[str] = mapped_column(String(20), nullable=False)
    quality_grade: Mapped[str | None] = mapped_column(String(4))
    polling_seconds: Mapped[int] = mapped_column(Integer, default=900, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    terms_url: Mapped[str | None] = mapped_column(String(1000))
    robots_url: Mapped[str | None] = mapped_column(String(1000))
    config: Mapped[dict[str, Any] | None] = mapped_column(JSONB)


class IngestRun(Base):
    __tablename__ = "ingest_runs"

    id: Mapped[uuid.UUID] = uuid_pk()
    source_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sources.id"), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    fetched_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    updated_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    rejected_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_summary: Mapped[str | None] = mapped_column(Text)
    cursor_before: Mapped[str | None] = mapped_column(Text)
    cursor_after: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (Index("ix_ingest_runs_source_started", "source_id", "started_at"),)


class SourceItem(Base):
    """Unveraenderter, versionierter Quelleneintrag."""

    __tablename__ = "source_items"

    id: Mapped[uuid.UUID] = uuid_pk()
    source_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sources.id"), nullable=False)
    external_id: Mapped[str] = mapped_column(String(200), nullable=False)
    canonical_url: Mapped[str | None] = mapped_column(String(1000))
    content_type: Mapped[str | None] = mapped_column(String(120))
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    source_updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    discovered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    payload_json: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    raw_object_key: Mapped[str | None] = mapped_column(String(500))
    sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    http_etag: Mapped[str | None] = mapped_column(String(200))
    http_last_modified: Mapped[str | None] = mapped_column(String(120))
    version_no: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_current: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    supersedes_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("source_items.id"))

    __table_args__ = (
        UniqueConstraint("source_id", "external_id", "sha256", name="uq_source_item_identity"),
        Index("ix_source_items_current", "source_id", "external_id", "is_current"),
    )


class Matter(Base, TimestampMixin):
    """Langfristiger Vorgang."""

    __tablename__ = "matters"

    id: Mapped[uuid.UUID] = uuid_pk()
    matter_type: Mapped[str] = mapped_column(String(40), nullable=False)
    canonical_title: Mapped[str] = mapped_column(Text, nullable=False)
    short_title: Mapped[str | None] = mapped_column(String(400))
    description: Mapped[str | None] = mapped_column(Text)
    current_status: Mapped[str | None] = mapped_column(String(120))
    jurisdiction: Mapped[str | None] = mapped_column(String(40), default="bund")
    lead_organization_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("organizations.id")
    )
    first_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    last_event_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    confidence: Mapped[str] = mapped_column(String(10), default="high", nullable=False)
    public_slug: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)

    identifiers: Mapped[list[Identifier]] = relationship(
        back_populates="matter", cascade="all, delete-orphan"
    )
    events: Mapped[list[Event]] = relationship(back_populates="matter")

    __table_args__ = (Index("ix_matters_last_event", "last_event_at"),)


class Identifier(Base):
    __tablename__ = "identifiers"

    id: Mapped[uuid.UUID] = uuid_pk()
    matter_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("matters.id", ondelete="CASCADE"), nullable=False
    )
    scheme: Mapped[str] = mapped_column(String(40), nullable=False)
    value: Mapped[str] = mapped_column(String(200), nullable=False)
    issuer: Mapped[str | None] = mapped_column(String(120))

    matter: Mapped[Matter] = relationship(back_populates="identifiers")

    __table_args__ = (UniqueConstraint("scheme", "value", name="uq_identifier_scheme_value"),)


class Event(Base):
    """Feed-Grundlage: zeitlich bestimmte Aenderung an einem Vorgang."""

    __tablename__ = "events"

    id: Mapped[uuid.UUID] = uuid_pk()
    matter_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("matters.id"))
    event_type: Mapped[str] = mapped_column(String(60), nullable=False)
    status_before: Mapped[str | None] = mapped_column(String(120))
    status_after: Mapped[str | None] = mapped_column(String(120))
    title: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[str | None] = mapped_column(Text)
    occurred_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    discovered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    effective_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    organization_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("organizations.id"))
    source_item_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("source_items.id"), nullable=False
    )
    confidence: Mapped[str] = mapped_column(String(10), default="high", nullable=False)
    is_correction: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_cancelled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # Deterministischer Fingerabdruck fuer idempotente Upserts (siehe event_builder).
    dedupe_key: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    event_metadata: Mapped[dict[str, Any] | None] = mapped_column("metadata", JSONB)

    matter: Mapped[Matter | None] = relationship(back_populates="events")

    __table_args__ = (
        # Feed-Sortierung: primaer published_at desc, stabiler Tie-Breaker id.
        Index("ix_events_feed", "published_at", "id"),
        Index("ix_events_matter", "matter_id"),
    )


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = uuid_pk()
    matter_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("matters.id"))
    source_item_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("source_items.id"))
    document_type: Mapped[str | None] = mapped_column(String(80))
    title: Mapped[str | None] = mapped_column(Text)
    document_number: Mapped[str | None] = mapped_column(String(120))
    publisher: Mapped[str | None] = mapped_column(String(200))
    document_date: Mapped[date | None] = mapped_column(Date)
    url: Mapped[str | None] = mapped_column(String(1000))
    mime_type: Mapped[str | None] = mapped_column(String(120))
    sha256: Mapped[str | None] = mapped_column(String(64))
    language: Mapped[str | None] = mapped_column(String(8), default="de")
    extracted_text_object_key: Mapped[str | None] = mapped_column(String(500))

    __table_args__ = (Index("ix_documents_matter", "matter_id"),)


class Topic(Base, TimestampMixin):
    """Kontrolliertes, versioniertes Vokabular.

    scheme: 'sachgebiet' und 'deskriptor' spiegeln amtliche DIP-Metadaten;
    'curated' sind Bundesmonitor-Themen (z. B. 'Digitales & KI'), die als Regel
    ueber amtliche Begriffe definiert und klar als kuratiert gekennzeichnet sind.
    """

    __tablename__ = "topics"

    id: Mapped[uuid.UUID] = uuid_pk()
    key: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    label: Mapped[str] = mapped_column(String(200), nullable=False)
    scheme: Mapped[str] = mapped_column(String(20), nullable=False)
    parent_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("topics.id"))
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class MatterTopic(Base):
    __tablename__ = "matter_topics"

    matter_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("matters.id", ondelete="CASCADE"), primary_key=True
    )
    topic_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("topics.id", ondelete="CASCADE"), primary_key=True
    )
    # 'official' (aus DIP) oder 'curated' (Bundesmonitor-Regel)
    origin: Mapped[str] = mapped_column(String(20), default="official", nullable=False)
    confidence: Mapped[str] = mapped_column(String(10), default="high", nullable=False)


class RollCallVote(Base, TimestampMixin):
    """Namentliche Abstimmung im Bundestag.

    Quelle: bundestag.de (amtliche XLSX-Einzelergebnisse). Gespeichert werden
    Gesamtsummen, Aggregat je Fraktion und die Einzelstimmen aller
    Abgeordneten; das Roh-XLSX liegt versioniert im Archiv (source_items).
    Es wird bewusst KEIN "angenommen/abgelehnt" abgeleitet – nur die Zahlen
    (Mehrheitserfordernisse variieren; Interpretation waere Raterei).
    """

    __tablename__ = "roll_call_votes"

    id: Mapped[uuid.UUID] = uuid_pk()
    wahlperiode: Mapped[int] = mapped_column(Integer, nullable=False)
    sitzung: Mapped[int] = mapped_column(Integer, nullable=False)
    abstimm_nr: Mapped[int] = mapped_column(Integer, nullable=False)
    vote_date: Mapped[date | None] = mapped_column(Date)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    page_url: Mapped[str | None] = mapped_column(String(1000))
    xlsx_url: Mapped[str | None] = mapped_column(String(1000))
    pdf_url: Mapped[str | None] = mapped_column(String(1000))
    # {"ja": n, "nein": n, "enthaltung": n, "ungueltig": n, "nicht_abgegeben": n}
    totals: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    # [{"fraktion": str, "ja": n, "nein": n, "enthaltung": n, "nicht_abgegeben": n}]
    by_fraktion: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, nullable=False)
    # [{"name": str, "fraktion": str, "stimme": "ja"|"nein"|"enthaltung"|...}]
    einzelstimmen: Mapped[list[dict[str, Any]] | None] = mapped_column(JSONB)
    matter_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("matters.id"))
    source_item_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("source_items.id"), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("wahlperiode", "sitzung", "abstimm_nr", name="uq_roll_call_identity"),
        Index("ix_roll_call_date", "vote_date"),
        Index("ix_roll_call_matter", "matter_id"),
    )


class SourceHealth(Base):
    __tablename__ = "source_health"

    id: Mapped[uuid.UUID] = uuid_pk()
    source_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sources.id"), nullable=False)
    checked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    last_success_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_new_item_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    lag_seconds: Mapped[int | None] = mapped_column(BigInteger)
    consecutive_failures: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    message: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (Index("ix_source_health_source_checked", "source_id", "checked_at"),)
