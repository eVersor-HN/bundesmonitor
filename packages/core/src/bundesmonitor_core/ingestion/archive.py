"""Roharchiv-Abstraktion.

Die Ingestion archiviert Rohbytes unveraendert, bevor sie normalisiert werden
(nicht verhandelbare Regel aus CLAUDE.md). Produktiv: S3/MinIO. Im Test: ein
In-Memory-Archiv, damit die Pipeline ohne Objektspeicher laeuft.
"""

from __future__ import annotations

from typing import Protocol

from bundesmonitor_core.storage import archive_raw, raw_object_key, sha256_hex


class RawArchive(Protocol):
    def archive(self, source_key: str, data: bytes, content_type: str, suffix: str) -> str:
        """Archiviert Rohbytes und gibt den Objektschluessel zurueck."""
        ...


class S3RawArchive:
    """Adapter auf den S3/MinIO-Storage."""

    def archive(
        self, source_key: str, data: bytes, content_type: str, suffix: str = "json"
    ) -> str:
        return archive_raw(source_key, data, content_type, suffix)


class InMemoryRawArchive:
    """Deterministisches Archiv fuer Tests: gleiche Bytes -> gleicher Schluessel."""

    def __init__(self) -> None:
        self.objects: dict[str, bytes] = {}

    def archive(
        self, source_key: str, data: bytes, content_type: str, suffix: str = "json"
    ) -> str:
        key = raw_object_key(source_key, sha256_hex(data), suffix)
        self.objects[key] = data
        return key
