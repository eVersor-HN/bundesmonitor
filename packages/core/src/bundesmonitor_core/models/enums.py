"""Kontrolliertes Vokabular.

Auf App-Ebene gepflegt (nicht als native DB-Enums), damit neue Werte ohne
Schema-Migration ergaenzt werden koennen. Die strikte Trennung der Geldstatus
und Verfahrensschritte aus CLAUDE.md wird hier abgebildet.
"""

from __future__ import annotations

from enum import StrEnum


class SourceType(StrEnum):
    API = "api"
    RSS = "rss"
    HTML = "html"
    FILE = "file"


class IngestStatus(StrEnum):
    RUNNING = "running"
    SUCCESS = "success"
    PARTIAL = "partial"
    FAILED = "failed"


class HealthStatus(StrEnum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    DOWN = "down"
    UNKNOWN = "unknown"


class MatterType(StrEnum):
    GESETZGEBUNG = "gesetzgebung"
    ANTRAG = "antrag"
    ANFRAGE = "anfrage"
    BERICHT = "bericht"
    WAHLPRUEFUNG = "wahlpruefung"
    SONSTIGES = "sonstiges"


class IdentifierScheme(StrEnum):
    DIP_VORGANG = "dip_vorgang"
    DIP_VORGANGSPOSITION = "dip_vorgangsposition"
    BT_DRUCKSACHE = "bt_drucksache"
    BR_DRUCKSACHE = "br_drucksache"
    ELI = "eli"
    BGBL = "bgbl"
    BANZ = "banz"
    FOERDERKENNZEICHEN = "foerderkennzeichen"
    IATI = "iati"
    TENDER_NOTICE = "tender_notice"


class EventType(StrEnum):
    """Sichtbare Ereignistypen. Erweiterbar; MVP-Fokus auf DIP-Verfahren."""

    ANNOUNCED = "announced"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    SUBMITTED = "submitted"
    REFERRED_TO_COMMITTEE = "referred_to_committee"
    COMMITTEE_AGENDA_ADDED = "committee_agenda_added"
    HEARING_SCHEDULED = "hearing_scheduled"
    HEARING_HELD = "hearing_held"
    AMENDMENT_PUBLISHED = "amendment_published"
    VOTE_SCHEDULED = "vote_scheduled"
    VOTE_HELD = "vote_held"
    ADOPTED_BUNDESTAG = "adopted_bundestag"
    REJECTED_BUNDESTAG = "rejected_bundestag"
    REFERRED_BUNDESRAT = "referred_bundesrat"
    ADOPTED_BUNDESRAT = "adopted_bundesrat"
    OBJECTED_BUNDESRAT = "objected_bundesrat"
    MEDIATION_STARTED = "mediation_started"
    SIGNED = "signed"
    PROMULGATED = "promulgated"
    EFFECTIVE = "effective"
    CABINET_APPROVED = "cabinet_approved"
    SOURCE_CORRECTED = "source_corrected"
    CANCELLED = "cancelled"
    STATUS_UPDATED = "status_updated"


class DataQualityFlag(StrEnum):
    DELAYED_SOURCE = "delayed_source"
    INCOMPLETE_SOURCE = "incomplete_source"
    AMOUNT_STATUS_UNCLEAR = "amount_status_unclear"
    RECIPIENT_NOT_PUBLISHED = "recipient_not_published"
    MACHINE_EXTRACTED = "machine_extracted"
    PDF_ONLY = "pdf_only"
    CORRECTED_SOURCE = "corrected_source"
    STALE_SOURCE = "stale_source"
    MATCHING_NEEDS_REVIEW = "matching_needs_review"


class Confidence(StrEnum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
