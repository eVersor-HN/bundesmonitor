"""Initiales Schema (DIP-MVP-Schnitt).

Baseline-Migration: erzeugt das komplette Schema aus der geteilten
Modell-Metadaten und ist damit garantiert deckungsgleich mit den ORM-Modellen.
Folge-Migrationen werden per ``alembic revision --autogenerate`` erzeugt und
vergleichen dann gegen genau diese Metadaten.

Revision ID: 0001_initial
Revises:
Create Date: 2026-07-12
"""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op
from bundesmonitor_core.models import Base

revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    Base.metadata.create_all(bind=op.get_bind())


def downgrade() -> None:
    Base.metadata.drop_all(bind=op.get_bind())
