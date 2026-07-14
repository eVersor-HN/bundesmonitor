"""Parser gegen echte DIP-Vorgangsdaten: Abbildung, Themen, Idempotenz-Schluessel."""

from __future__ import annotations

from typing import Any

from bundesmonitor_core.ingestion.dip.parser import map_matter_type, parse_vorgang, slugify
from dip_fixtures import load_fixture


def _docs() -> list[dict[str, Any]]:
    docs: list[dict[str, Any]] = load_fixture("vorgang_page1.json")["documents"]
    return docs


def test_parses_every_record_without_error() -> None:
    for doc in _docs():
        parsed = parse_vorgang(doc)
        assert parsed.external_id == str(doc["id"])
        assert parsed.canonical_title  # nie leer
        assert parsed.public_slug.endswith(parsed.external_id)


def test_dip_identifier_present_for_all() -> None:
    for doc in _docs():
        parsed = parse_vorgang(doc)
        schemes = {i.scheme for i in parsed.identifiers}
        assert "dip_vorgang" in schemes


def test_topics_extracted_from_official_metadata() -> None:
    # Mindestens ein Vorgang der Fixture hat Sachgebiet oder Deskriptor.
    with_topics = [p for p in (parse_vorgang(d) for d in _docs()) if p.topics]
    assert with_topics
    schemes = {t.scheme for p in with_topics for t in p.topics}
    assert schemes <= {"sachgebiet", "deskriptor", "ort", "partei"}


def test_party_from_initiative() -> None:
    from bundesmonitor_core.ingestion.dip.parser import party_from_initiative

    assert party_from_initiative("Fraktion der CDU/CSU") == "CDU/CSU"
    assert party_from_initiative("SPD") == "SPD"
    assert party_from_initiative("BÜNDNIS 90/DIE GRÜNEN") == "Grüne"
    assert party_from_initiative("Bundesregierung") is None


def test_geographic_deskriptor_becomes_ort() -> None:
    doc = {
        "id": "1",
        "titel": "Test",
        "aktualisiert": "2026-07-10T10:00:00+02:00",
        "datum": "2026-07-10",
        "deskriptor": [
            {"name": "Niedersachsen", "typ": "Geograph. Begriffe"},
            {"name": "Miete", "typ": "Sachbegriffe"},
        ],
    }
    parsed = parse_vorgang(doc)
    schemes = {(t.scheme, t.label) for t in parsed.topics}
    assert ("ort", "Niedersachsen") in schemes
    assert ("deskriptor", "Miete") in schemes


def test_event_dedupe_key_is_version_stable() -> None:
    doc = _docs()[0]
    a = parse_vorgang(doc)
    b = parse_vorgang(dict(doc))
    assert a.event is not None and b.event is not None
    # Gleiche Quellversion -> gleicher dedupe_key (idempotent).
    assert a.event.dedupe_key == b.event.dedupe_key
    assert a.external_id in a.event.dedupe_key


def test_matter_type_mapping() -> None:
    assert map_matter_type("Gesetzgebung") == "gesetzgebung"
    assert map_matter_type("Kleine Anfrage") == "anfrage"
    assert map_matter_type("Wahlprüfungsverfahren") == "wahlpruefung"
    assert map_matter_type(None) == "sonstiges"


def test_slugify_ascii_only() -> None:
    assert slugify("Gesetz über Künstliche Intelligenz") == "gesetz-uber-kunstliche-intelligenz"
