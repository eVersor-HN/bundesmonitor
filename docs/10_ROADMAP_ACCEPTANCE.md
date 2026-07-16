# Roadmap und Akzeptanzkriterien

## Phase 0 - Repository und Infrastruktur

Lieferumfang:

- Monorepo
- Docker Compose
- Postgres, Redis, MinIO
- FastAPI Healthcheck
- Next.js Grundlayout
- Alembic Migrationen
- CI mit Lint, Typprüfung und Tests

Akzeptanz:

- ein Befehl startet lokale Umgebung
- Web, API und Worker melden gesund
- keine Secrets im Repository

## Phase 1 - Vertikaler DIP-MVP

Lieferumfang:

- DIP-API-Client
- inkrementeller Import für Vorgange, Vorgangspositionen und Drucksachen
- Roharchiv und Versionierung
- normalisierte Vorgange und Ereignisse
- Feed-API
- Feedseite und Detailzeitleiste
- Originalquelle und Datenfrische

Akzeptanz:

- derselbe Lauf erzeugt keine Duplikate
- Cursor-Pagination ist vollständig getestet
- 15-Minuten-Quellenverzoegerung wird in Pollinglogik beruecksichtigt
- ein Vorgang zeigt verknüpfte Drucksachen
- API-Fixtures decken Fehler, leere Seiten und Cursorwechsel ab

## Phase 2 - Aktuelle Termine und amtliche Veröffentlichung

Quellen:

- Bundesregierung RSS
- Regierungspressekonferenz-Mitschriften
- Bundespressekonferenz-Termine
- Bundesrat RSS/Tagesordnung
- Bundesgesetzblatt RSS
- Bundestag Ausschuss-Tagesordnungen

Akzeptanz:

- Terminverschiebung und Absage werden als Änderung erkannt
- Bundesrat-Nachträge erscheinen ohne Doppelkarte
- BGBl-Ereignis kann einen bestehenden Gesetzesvorgang über Kennungen verknüpfen

## Phase 3 - Abstimmungen und Beteiligung

- namentliche Abstimmungen XLSX
- oeffentliche Anhoerungen
- Petitionen
- Wahltermine

Akzeptanz:

- Abstimmungsergebnis und Namenslisten werden getrennt gespeichert
- nicht namentliche Abstimmungen werden nicht mit erfundenen Einzelpositionen versehen
- Mitzeichnungsfrist besitzt Zeitzone und Status

## Phase 4 - Geld

- Bundeshaushalt
- Förderkatalog
- BMZ/IATI
- Vergaben
- Subventionsberichte

Akzeptanz:

- jeder Betrag besitzt `flow_type` und Status
- geplante und tatsächliche Werte werden separat angezeigt
- Förderkatalog zeigt Unvollständigkeits-/60-Tage-Hinweis
- Vergabeereignisse unterscheiden Bekanntmachung und Zuschlag

## Phase 5 - Kontrolle

- Lobbyregister API V2
- Bundesrechnungshof
- Bundesanzeiger
- Ministeriums- und Behoerdenquellen

## Phase 6 - Personalisierung

- gespeicherte Filter
- Watchlists
- Web Push/E-Mail
- taegliche Zusammenfassung
- oeffentliche ICS-Feeds

## Phase 7 - Redaktionelle KI

Erst beginnen, wenn:

- Quellenverknuepfung stabil ist
- Rohtextsegmentierung vorhanden ist
- Claim-Evidence-Validierung implementiert ist
- Fallback ohne KI funktioniert

## Release-Gates

Vor Beta:

- Security Review
- Accessibility Audit
- Quellen-/Lizenzmatrix
- Backup-Restore-Test
- Lasttest Feed/API
- Monitoring und Alarmierung
- oeffentliche bekannte-Luecken-Seite

Vor Version 1.0:

- mindestens 30 Tage stabiler Importbetrieb
- dokumentierte Datenqualitaetsmetriken
- kein kritischer offener Datenschutz- oder Sicherheitsbefund
- manuelle Stichprobe von mindestens 500 Ereignissen
