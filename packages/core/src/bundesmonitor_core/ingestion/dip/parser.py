"""Reine Parser-Funktionen: DIP-Vorgang (Rohdict) -> normalisierte Strukturen.

Kein Datenbank- oder Netzwerkzugriff, damit die Abbildung isoliert gegen echte
Fixtures getestet werden kann. Es werden keine Fakten erfunden: fehlende Felder
bleiben ``None``, der Status wird unveraendert aus ``beratungsstand`` uebernommen.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Any

from bundesmonitor_core.models.enums import EventType, IdentifierScheme, MatterType


@dataclass(frozen=True)
class ParsedIdentifier:
    scheme: str
    value: str
    issuer: str | None = None


@dataclass(frozen=True)
class ParsedTopic:
    scheme: str  # 'sachgebiet' oder 'deskriptor'
    label: str


@dataclass(frozen=True)
class ParsedEvent:
    event_type: str
    title: str
    status_after: str | None
    occurred_at: date | None
    published_at: datetime | None
    dedupe_key: str


@dataclass(frozen=True)
class ParsedVorgang:
    external_id: str
    matter_type: str
    canonical_title: str
    short_title: str | None
    description: str | None
    current_status: str | None
    public_slug: str
    updated_at: datetime | None
    identifiers: list[ParsedIdentifier] = field(default_factory=list)
    topics: list[ParsedTopic] = field(default_factory=list)
    event: ParsedEvent | None = None


# Grobe Abbildung der DIP-Vorgangstypen auf unsere Matter-Typen.
_MATTER_TYPE_MAP: dict[str, MatterType] = {
    "gesetzgebung": MatterType.GESETZGEBUNG,
    "antrag": MatterType.ANTRAG,
    # NFKD faltet 'ue' zu 'u': "Wahlpruefungsverfahren" -> "wahlprufungsverfahren".
    "wahlprufung": MatterType.WAHLPRUEFUNG,
}


def _norm(value: str) -> str:
    return unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().lower()


def map_matter_type(vorgangstyp: str | None) -> str:
    if not vorgangstyp:
        return MatterType.SONSTIGES.value
    key = _norm(vorgangstyp)
    for needle, mt in _MATTER_TYPE_MAP.items():
        if needle in key:
            return mt.value
    if "anfrage" in key:
        return MatterType.ANFRAGE.value
    if "bericht" in key or "unterrichtung" in key:
        return MatterType.BERICHT.value
    if "antrag" in key:
        return MatterType.ANTRAG.value
    return MatterType.SONSTIGES.value


# Muster auf der NFKD-gefalteten Initiative (ue->u). Reihenfolge beachtet Teilstrings.
_PARTY_PATTERNS: list[tuple[str, str]] = [
    ("cdu/csu", "CDU/CSU"),
    ("christlich demokratische", "CDU/CSU"),
    ("christlich-soziale", "CDU/CSU"),
    ("bundnis 90", "Grüne"),
    ("grunen", "Grüne"),
    ("grune", "Grüne"),
    ("sozialdemokratische", "SPD"),
    ("spd", "SPD"),
    ("alternative fur deutschland", "AfD"),
    ("afd", "AfD"),
    ("die linke", "Die Linke"),
    ("freie demokratische", "FDP"),
    ("fdp", "FDP"),
    ("bsw", "BSW"),
]


def party_from_initiative(value: str) -> str | None:
    """Erkennt eine Fraktion/Partei aus einer DIP-Initiative, sonst None."""
    key = _norm(value)
    for needle, party in _PARTY_PATTERNS:
        if needle in key:
            return party
    return None


def slugify(text: str, max_length: int = 60) -> str:
    ascii_text = (
        unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower()
    )
    ascii_text = re.sub(r"[^a-z0-9]+", "-", ascii_text).strip("-")
    return ascii_text[:max_length].strip("-")


def parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def parse_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def parse_vorgang(raw: dict[str, Any]) -> ParsedVorgang:
    external_id = str(raw["id"])
    titel = str(raw.get("titel") or "").strip()
    updated_at = parse_datetime(raw.get("aktualisiert"))
    occurred = parse_date(raw.get("datum"))
    beratungsstand = raw.get("beratungsstand")

    identifiers = [ParsedIdentifier(IdentifierScheme.DIP_VORGANG.value, external_id, "DIP")]
    gesta = raw.get("gesta")
    if gesta:
        identifiers.append(ParsedIdentifier("gesta", str(gesta), "DIP"))

    topics: list[ParsedTopic] = []
    for sg in raw.get("sachgebiet") or []:
        if isinstance(sg, str) and sg.strip():
            topics.append(ParsedTopic("sachgebiet", sg.strip()))
    for desk in raw.get("deskriptor") or []:
        if isinstance(desk, dict):
            name = desk.get("name")
            if isinstance(name, str) and name.strip():
                # Geografische Deskriptoren als eigenes Schema 'ort' (fuer Ortsfilter).
                typ = str(desk.get("typ") or "")
                scheme = "ort" if "eogr" in typ else "deskriptor"
                topics.append(ParsedTopic(scheme, name.strip()))
    # Initiatoren -> Partei-Themen (fuer Parteifilter).
    for ini in raw.get("initiative") or []:
        if isinstance(ini, str):
            party = party_from_initiative(ini)
            if party:
                topics.append(ParsedTopic("partei", party))

    slug = f"{slugify(titel) or 'vorgang'}-{external_id}"

    # Ein Ereignis je Vorgangsversion: idempotent ueber (id, aktualisiert).
    event: ParsedEvent | None = None
    if updated_at is not None:
        event = ParsedEvent(
            event_type=EventType.STATUS_UPDATED.value,
            title=titel or f"Vorgang {external_id}",
            status_after=str(beratungsstand) if beratungsstand else None,
            occurred_at=occurred,
            published_at=updated_at,
            dedupe_key=f"dip:vorgang:{external_id}:{raw.get('aktualisiert')}",
        )

    return ParsedVorgang(
        external_id=external_id,
        matter_type=map_matter_type(raw.get("vorgangstyp")),
        canonical_title=titel or f"Vorgang {external_id}",
        short_title=(titel[:200] if titel else None),
        description=(str(raw["abstract"]) if raw.get("abstract") else None),
        current_status=str(beratungsstand) if beratungsstand else None,
        public_slug=slug,
        updated_at=updated_at,
        identifiers=identifiers,
        topics=topics,
        event=event,
    )


@dataclass(frozen=True)
class ParsedDocument:
    external_id: str
    vorgang_ids: list[str]
    document_type: str | None
    title: str | None
    document_number: str | None
    publisher: str | None
    document_date: date | None
    url: str | None
    mime_type: str | None
    sha256: str | None
    updated_at: datetime | None


@dataclass(frozen=True)
class ParsedPosition:
    external_id: str
    vorgang_id: str | None
    step: str
    title: str
    event_type: str
    occurred_at: date | None
    published_at: datetime | None


def _position_event_type(step: str) -> str:
    key = _norm(step)
    if "verkundung" in key:
        return EventType.PROMULGATED.value
    if "beschlussempfehlung" in key or "ausschuss" in key or "uberweisung" in key:
        return EventType.REFERRED_TO_COMMITTEE.value
    if "abstimmung" in key or "wahl" in key:
        return EventType.VOTE_HELD.value
    if "anfrage" in key or "frage" in key or "antrag" in key:
        return EventType.SUBMITTED.value
    return EventType.STATUS_UPDATED.value


def parse_vorgangsposition(raw: dict[str, Any]) -> ParsedPosition:
    external_id = str(raw["id"])
    vorgang_id = str(raw["vorgang_id"]) if raw.get("vorgang_id") else None
    step = str(raw.get("vorgangsposition") or "").strip() or "Vorgangsschritt"
    return ParsedPosition(
        external_id=external_id,
        vorgang_id=vorgang_id,
        step=step,
        title=str(raw.get("titel") or step).strip(),
        event_type=_position_event_type(step),
        occurred_at=parse_date(raw.get("datum")),
        published_at=parse_datetime(raw.get("aktualisiert")),
    )


def parse_drucksache(raw: dict[str, Any]) -> ParsedDocument:
    external_id = str(raw["id"])
    vorgang_ids = [
        str(vb["id"])
        for vb in raw.get("vorgangsbezug") or []
        if isinstance(vb, dict) and vb.get("id")
    ]
    fundstelle = raw.get("fundstelle") or {}
    pdf_hash = raw.get("pdf_hash")
    # Nur echte SHA-256 (64 Hex) in das sha256-Feld; die DIP-Hashes sind teils MD5.
    sha256 = pdf_hash if isinstance(pdf_hash, str) and len(pdf_hash) == 64 else None
    return ParsedDocument(
        external_id=external_id,
        vorgang_ids=vorgang_ids,
        document_type=raw.get("drucksachetyp"),
        title=raw.get("titel"),
        document_number=raw.get("dokumentnummer"),
        publisher=raw.get("herausgeber"),
        document_date=parse_date(raw.get("datum")),
        url=fundstelle.get("pdf_url") if isinstance(fundstelle, dict) else None,
        mime_type="application/pdf" if fundstelle else None,
        sha256=sha256,
        updated_at=parse_datetime(raw.get("aktualisiert")),
    )
