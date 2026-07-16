# CLAUDE.md - Bundesmonitor

## Rolle

Du entwickelst eine produktionsnahe, quellengestuetzte Civic-Tech-Anwendung für Deutschland. Prioritaeten sind Nachvollziehbarkeit, Neutralitaet, Barrierefreiheit, Datenqualitaet und eine moderne, leicht bedienbare Oberfläche.

## Nicht verhandelbare Regeln

1. Jede sichtbare Tatsachenbehauptung benoetigt mindestens eine Originalquelle.
2. Originaldaten werden unverändert archiviert, bevor sie normalisiert werden.
3. `published_at`, `occurred_at`, `discovered_at`, `updated_at` und `effective_at` sind getrennte Felder.
4. Geldstatus niemals zusammenwerfen: Plan, Soll, Ist, Verpflichtung, Bewilligung, Vergabe und Auszahlung sind verschieden.
5. Keine politische Bewertung, kein Sentiment-Ranking, kein Framing durch Adjektive.
6. KI-Zusammenfassungen sind klar als solche gekennzeichnet und dürfen keine neuen Fakten erzeugen.
7. Bei Unsicherheit `unknown/null` speichern, nicht raten.
8. Originaltitel, Original-URL, Quellenbehoerde, Abrufzeit und Inhalts-Hash speichern.
9. Scraper müssen Rate Limits, robots.txt, Nutzungsbedingungen und Retry-Backoff beachten.
10. Keine Bundesadler-, Ministeriums- oder Partei-Logos kopieren. Eigene neutrale Icons verwenden.
11. WCAG 2.2 AA und deutsche Datums-/Zahlenformate sind Pflicht.
12. Mobile zuerst denken, Desktop aber informationsdicht und effizient gestalten.

## Technischer Zielstack

Monorepo:

- `apps/web`: Next.js, TypeScript, App Router, Tailwind CSS, shadcn/ui, TanStack Query
- `apps/api`: FastAPI, Pydantic, SQLAlchemy 2, Alembic
- `apps/worker`: Celery Worker und Beat
- `packages/contracts`: OpenAPI-generierte TypeScript-Typen
- `packages/ui`: gemeinsame UI-Komponenten und Design-Tokens
- PostgreSQL mit `pg_trgm`; später optional OpenSearch
- Redis für Queue, Locks und Caching
- MinIO lokal, S3-kompatibler Speicher produktiv
- pytest, Ruff, mypy, ESLint, TypeScript strict, Playwright

Verwende jeweils die beim Projektstart aktuelle stabile Version und locke Abhaengigkeiten. Keine Alpha-/Canary-Versionen.

## Entwicklungsreihenfolge

1. Infrastruktur und Datenmodell
2. DIP-Collector
3. Normalisierung und idempotente Upserts
4. Feed-API
5. Feed-Oberfläche
6. Vorgangsdetail mit Ereigniszeitleiste
7. Quellennachweise und Datenfrische
8. Weitere Quellen nacheinander
9. Suche, Merklisten und Benachrichtigungen
10. Redaktionelle KI nur nach stabiler Datenbasis

## Architekturregeln

- Collector laden Rohdaten und schreiben `source_items`.
- Parser erzeugen normalisierte Entitaeten und Ereignisse.
- Resolver verknüpfen Einträge zu `matters`.
- Der Feed liest ausschließlich normalisierte Ereignisse.
- Ein Collector darf keine UI-spezifischen Felder erzeugen.
- Alle Jobs sind idempotent und durch verteilte Locks geschuetzt.
- Jeder Importlauf erzeugt `ingest_runs` und aktualisiert `source_health`.
- Fehlerhafte Einträge gehen in eine Dead-Letter-Queue; der Gesamtlauf darf weiterarbeiten.
- Dokumente werden per SHA-256 dedupliziert.

## Git- und Arbeitsweise

- Kleine Commits mit einer klaren Funktion.
- Vor jedem Commit Tests und Linter für den geaenderten Bereich ausführen.
- Keine großen Refactorings zusammen mit Features.
- Keine TODO-Platzhalter für Sicherheits-, Quellen- oder Datenqualitaetslogik.
- Entscheidungen mit Tragweite in `docs/adr/` als Architecture Decision Record dokumentieren.

## Definition of Done für jede Quelle

- Quelle ist in `sources` konfiguriert.
- Healthcheck, Timeout, Retry und Rate Limit vorhanden.
- Rohantwort wird archiviert.
- Parser besitzt Fixture-Tests.
- Upsert ist idempotent.
- Löschungen/Korrekturen werden erkannt oder als nicht erkennbar dokumentiert.
- Sichtbare Einträge verlinken auf die Originalquelle.
- Zeitstempel und Datenfrische werden korrekt angezeigt.
- Monitoring-Metriken sind vorhanden.

## UI-Grundsatz

Der Feed muss in zehn Sekunden folgende Fragen beantworten:

- Was ist neu?
- Wer ist verantwortlich?
- Welchen Status hat es?
- Geht es um Geld?
- Was passiert als Naechstes?
- Wo ist die Originalquelle?

Keine endlosen Textkarten. Progressive Disclosure verwenden: kurze Karten, ausfuehrliche Detailansicht.
