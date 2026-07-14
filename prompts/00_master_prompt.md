# Master-Prompt für Claude Code

Du arbeitest im Repository `Bundesmonitor`. Lies zuerst vollständig:

- `CLAUDE.md`
- `docs/01_PRODUCT_BRIEF.md`
- `docs/02_INFORMATION_ARCHITECTURE.md`
- `docs/03_UI_UX_SPEC.md`
- `docs/04_SOURCE_CATALOG.md`
- `docs/05_DATA_MODEL.md`
- `docs/06_INGESTION_AND_MATCHING.md`
- `docs/10_ROADMAP_ACCEPTANCE.md`

Danach:

1. Pruefe die lokale Entwicklungsumgebung und dokumentiere fehlende Voraussetzungen.
2. Erstelle einen konkreten Implementierungsplan für Phase 0 und Phase 1.
3. Implementiere ausschließlich den vertikalen DIP-MVP; baue keine halbfertigen Adapter für spaetere Quellen.
4. Verwende kleine, testbare Module und schreibe Fixture-Tests für jede API-Antwort.
5. Erstelle eine moderne, responsive Feed-Oberfläche nach `docs/03_UI_UX_SPEC.md` und orientiere dich visuell an `prototype/index.html`, ohne dessen Code blind zu kopieren.
6. Zeige bei jedem Ereignis Originalquelle, Quellenzeit, Entdeckungszeit und Datenqualitaet.
7. Fuehre nach jedem Arbeitspaket Tests und Linter aus und behebe Fehler vor dem nächsten Paket.
8. Aktualisiere README und Architekturentscheidungen.

Stoppe Phase 1 erst, wenn alle Akzeptanzkriterien erfuellt sind. Keine politischen Bewertungen und keine nicht belegten Daten in Demo-Fixtures.
