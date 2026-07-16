# Bundesmonitor - Startpaket für Claude Code

Arbeitsname: **Bundesmonitor**  
Ziel: Ein quellenbasierter, chronologischer Echtzeit-Monitor für Handlungen, Planungen, Entscheidungen, Geldflüsse und Termine des Bundes.

## Das wichtigste zuerst

1. Oeffne dieses Verzeichnis als neues Git-Repository.
2. Gib Claude Code zuerst `CLAUDE.md` und danach `prompts/00_master_prompt.md`.
3. Lasse Claude **nur Phase 1** umsetzen. Kein Big-Bang-Import aller Quellen.
4. Starte mit einem vertikalen Schnitt: DIP-API -> Datenbank -> Feed -> Detailseite -> Originalquelle.
5. Danach RSS der Bundesregierung, Bundesrat, Bundesgesetzblatt und BPK-Termine ergänzen.

## Zielbild

Die Anwendung soll nicht wie ein Behoerdenportal wirken. Sie soll so leicht lesbar sein wie eine moderne Nachrichten-App, aber jede Aussage auf eine amtliche Primaerquelle zurueckfuehren.

Der zentrale Unterschied zu Nachrichten:

- Ein Thema wird als **Vorgang** geführt.
- Jede Änderung wird als **Ereignis** gespeichert.
- Dokumente, Abstimmungen, Termine und Geldbetraege werden diesem Vorgang zugeordnet.
- Nutzer sehen eine nachvollziehbare Zeitleiste statt isolierter Meldungen.

## Empfohlener Startbefehl

```text
Lies CLAUDE.md und prompts/00_master_prompt.md vollständig. Erstelle danach die Monorepo-Struktur, Docker-Umgebung, Datenbankmigrationen und einen vertikalen MVP-Schnitt mit DIP als erster Quelle. Arbeite in kleinen, testbaren Commits und halte die Akzeptanzkriterien aus docs/10_ROADMAP_ACCEPTANCE.md ein.
```

## Paketinhalt

- `CLAUDE.md`: dauerhafte Arbeitsanweisung für Claude Code
- `docs/`: Produkt-, Architektur-, UI-, Daten- und Quellenkonzept
- `config/sources.yaml`: priorisierte Quellenliste
- `prompts/`: fertige Arbeitsauftraege für einzelne Entwicklungsphasen
- `prototype/index.html`: visuelles Zielbild ohne Buildsystem
- `.env.example`: benoetigte Konfiguration
- `docker-compose.yml`: lokale Infrastruktur
- `scripts/`: Bootstrap für Windows und Linux/macOS

## Kritische Produktregel

Die App darf niemals folgende Begriffe vermischen:

- geplant
- beantragt
- veranschlagt
- beschlossen
- bewilligt
- beauftragt
- vergeben
- ausgezahlt
- veröffentlicht
- in Kraft

Wenn der Status nicht sicher aus der Quelle hervorgeht, wird `unklar` angezeigt. Es wird nichts erraten.
