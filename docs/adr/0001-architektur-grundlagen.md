# ADR 0001: Architektur-Grundlagen des MVP

- Status: akzeptiert
- Datum: 2026-07-12

## Kontext

Phase 0/1 aus `docs/10_ROADMAP_ACCEPTANCE.md` verlangt ein Monorepo mit
`apps/web`, `apps/api`, `apps/worker` und `packages/*` sowie einen vertikalen
DIP-Schnitt. Worker (Schreibpfad) und API (Lesepfad) benoetigen dieselben
Datenmodelle und Teile der Ingestion-Logik.

## Entscheidungen

1. **Geteiltes Python-Paket `packages/core`.** Datenmodell, Konfiguration,
   DB-/Storage-Zugriff und die DIP-Ingestion leben in `bundesmonitor-core`.
   `apps/api` und `apps/worker` haengen davon ab. Vermeidet Cross-App-Importe
   und hält den Feed-Lesepfad frei von Collector-Details. Ergaenzt die in
   `CLAUDE.md` genannten TS-Pakete `packages/contracts` und `packages/ui`.

2. **Celery + Beat ab Phase 0** (statt leichtgewichtigem Scheduler), gemaess
   Spezifikation. Broker/Backend: Redis. Ein Worker-Image dient als Worker und
   als Beat (per abweichendem Command in Compose).

3. **Alembic-Baseline via Metadaten.** Die Initial-Migration erzeugt das Schema
   aus `Base.metadata`, ist damit garantiert deckungsgleich mit den ORM-Modellen
   und offline verifizierbar. Folge-Migrationen entstehen per
   `alembic revision --autogenerate`.

4. **Kontrolliertes Vokabular auf App-Ebene** (StrEnum) statt nativer DB-Enums,
   damit neue Ereignis-/Statuswerte ohne Schema-Migration ergaenzt werden koennen.
   Die strikte Trennung der Geldstatus (Plan/Soll/Ist/Verpflichtung/Bewilligung/
   Vergabe/Auszahlung) bleibt erhalten.

5. **Werkzeuge:** `venv`+pip (kein uv/poetry vorausgesetzt), npm-Workspaces
   (kein pnpm). Ruff, mypy (strict, pro Paket), pytest, ESLint (Next Flat-Config),
   `tsc`, `next build`.

## Konsequenzen

- CI prueft jedes Python-Paket einzeln, damit die `strict`-mypy-Konfiguration je
  `pyproject` greift.
- `packages/contracts`/`packages/ui` sind vorerst Platzhalter; `contracts` wird
  in Phase 1 aus dem OpenAPI-Schema generiert.
- Die lokale Umgebung startet mit einem Befehl: `docker compose up`.
