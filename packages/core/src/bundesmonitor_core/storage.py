"""Roharchiv-Storage (S3-kompatibel, lokal MinIO).

Regel aus CLAUDE.md: Originaldaten werden unveraendert archiviert, bevor sie
normalisiert werden. Der Objektschluessel referenziert Quelle und Inhalts-Hash,
sodass identische Inhalte dedupliziert werden.
"""

from __future__ import annotations

import hashlib
from functools import lru_cache
from typing import TYPE_CHECKING

import boto3
from botocore.client import Config as BotoConfig

from bundesmonitor_core.config import get_settings

if TYPE_CHECKING:
    from mypy_boto3_s3.client import S3Client


@lru_cache
def get_s3_client() -> S3Client:
    settings = get_settings()
    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
        region_name=settings.s3_region,
        config=BotoConfig(signature_version="s3v4"),
    )


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def raw_object_key(source_key: str, digest: str, suffix: str = "json") -> str:
    """Deterministischer, hash-basierter Objektschluessel: dedupliziert automatisch."""
    return f"raw/{source_key}/{digest[:2]}/{digest}.{suffix}"


def ensure_bucket() -> None:
    settings = get_settings()
    client = get_s3_client()
    existing = {b["Name"] for b in client.list_buckets().get("Buckets", [])}
    if settings.s3_bucket not in existing:
        client.create_bucket(Bucket=settings.s3_bucket)


def archive_raw(source_key: str, data: bytes, content_type: str, suffix: str = "json") -> str:
    """Archiviert Rohbytes unveraendert und gibt den Objektschluessel zurueck.

    Idempotent: gleiche Bytes -> gleicher Schluessel -> kein Duplikat.
    """
    settings = get_settings()
    client = get_s3_client()
    digest = sha256_hex(data)
    key = raw_object_key(source_key, digest, suffix)
    client.put_object(
        Bucket=settings.s3_bucket,
        Key=key,
        Body=data,
        ContentType=content_type,
    )
    return key
