"""Datenbank-Engine und Session-Fabrik (SQLAlchemy 2, synchron)."""

from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager
from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from bundesmonitor_core.config import get_settings


@lru_cache
def get_engine() -> Engine:
    settings = get_settings()
    # connect_timeout ist Postgres-spezifisch; SQLite (No-Docker-Schnellstart)
    # kennt das Argument nicht.
    connect_args: dict[str, int] = {}
    if settings.database_url.startswith("postgresql"):
        connect_args["connect_timeout"] = 3
    return create_engine(
        settings.database_url,
        pool_pre_ping=True,
        future=True,
        connect_args=connect_args,
    )


@lru_cache
def _session_factory() -> sessionmaker[Session]:
    return sessionmaker(bind=get_engine(), expire_on_commit=False, future=True)


@contextmanager
def session_scope() -> Iterator[Session]:
    """Transaktionaler Session-Kontext: commit bei Erfolg, rollback bei Fehler."""
    session = _session_factory()()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_session() -> Session:
    """Einzelne Session (Aufrufer ist fuer close/commit verantwortlich)."""
    return _session_factory()()
