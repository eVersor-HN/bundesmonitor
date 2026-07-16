"""RSS-Parser (stdlib). Liest Standardfelder und alle namespaced Metadaten
(z. B. BGBl ``meta:gesta``, ``meta:fundstelle``) als flaches Dict aus.

Kein Netzwerkzugriff; arbeitet auf bereits geladenen Bytes, damit die Abbildung
gegen echte Fixtures testbar ist.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
from email.utils import parsedate_to_datetime
from typing import Any

# defusedxml haertet gegen XXE und Entity-Expansion ("billion laughs"): Feed-Daten
# stammen aus fremden Quellen und werden nie mit der stdlib ElementTree geparst.
from defusedxml.ElementTree import fromstring


@dataclass(frozen=True)
class ParsedFeedItem:
    external_id: str
    title: str
    link: str | None
    summary: str | None
    published_at: datetime | None
    meta: dict[str, str] = field(default_factory=dict)


def _localname(tag: str) -> str:
    return tag.rsplit("}", 1)[-1] if "}" in tag else tag


def parse_pubdate(value: str | None) -> datetime | None:
    if not value:
        return None
    raw = value.strip()
    dt: datetime | None = None
    # RFC-822 (RSS ueblich): "Fri, 10 Jul 2026 11:00:00 GMT"
    try:
        dt = parsedate_to_datetime(raw)
    except (TypeError, ValueError):
        dt = None
    if dt is None:
        # ISO-Datum/-Zeit (z. B. BGBl "2026-07-10")
        try:
            dt = datetime.fromisoformat(raw)
        except ValueError:
            return None
    # Immer zonenbehaftet (UTC), damit die Sortierung mit anderen Quellen stimmt.
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    return dt


def parse_feed(data: bytes) -> list[ParsedFeedItem]:
    root = fromstring(data)
    channel = root.find("channel")
    items_parent = channel if channel is not None else root

    parsed: list[ParsedFeedItem] = []
    for item in items_parent.findall("item"):
        fields: dict[str, str] = {}
        for child in item:
            name = _localname(child.tag)
            text = (child.text or "").strip()
            # guid/link koennen im Attribut isPermaLink etc. stehen; Text reicht hier.
            if text:
                fields[name] = text

        link = fields.get("link")
        guid = fields.get("guid")
        external_id = guid or link or fields.get("title", "")
        if not external_id:
            continue

        # Standardfelder aus dem Meta-Dict entfernen, Rest als meta behalten.
        meta = {
            k: v
            for k, v in fields.items()
            if k not in {"title", "link", "guid", "description", "pubDate"}
        }
        parsed.append(
            ParsedFeedItem(
                external_id=external_id,
                title=fields.get("title", "").strip() or external_id,
                link=link,
                summary=fields.get("description") or None,
                published_at=parse_pubdate(fields.get("pubDate")),
                meta=meta,
            )
        )
    return parsed


def to_payload(item: ParsedFeedItem) -> dict[str, Any]:
    """Kanonische, hashbare Darstellung eines Items fuer Archiv/Deduplizierung."""
    return {
        "external_id": item.external_id,
        "title": item.title,
        "link": item.link,
        "summary": item.summary,
        "published_at": item.published_at.isoformat() if item.published_at else None,
        "meta": item.meta,
    }
