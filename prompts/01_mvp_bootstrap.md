# Prompt - Repository und MVP bootstrap

Erstelle die Monorepo-Struktur gemäß CLAUDE.md.

Anforderungen:

- pnpm Workspace für Web und gemeinsame TypeScript-Pakete
- Python-Projekte mit `uv`
- Docker Compose für Postgres, Redis und MinIO
- FastAPI mit `/health/live` und `/health/ready`
- Next.js Grundlayout mit Seitenleiste, Topbar und responsive Navigation
- SQLAlchemy-Modelle und Alembic-Migrationen für sources, ingest_runs, source_items, organizations, matters, identifiers, events und documents
- strukturierte Logs mit Request-/Run-ID
- CI für Ruff, mypy, pytest, ESLint, TypeScript und Playwright-Smoke-Test
- `.env.example` verwenden, keine echten Keys

Erstelle danach einen Seed-Datensatz nur für UI-Entwicklung. Kennzeichne ihn eindeutig als Demo und verhindere, dass er in Produktion geladen wird.
