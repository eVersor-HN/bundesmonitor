# Sicherheit, Recht und Barrierefreiheit

## Sicherheit

- Secrets nur über Environment/Secret Manager
- keine API-Keys in Logs oder Client-Bundles
- SSRF-Schutz im Fetcher: Allowlist pro Quelle, private IP-Bereiche blockieren
- Dateityp und Dateigroesse prüfen
- PDFs/Office-Dateien isoliert verarbeiten
- HTML sanitizen; kein fremdes JavaScript ausführen
- Adminbereich mit starker Authentifizierung und Audit Log
- Rate Limits für oeffentliche API
- regelmaessige Dependency- und Container-Scans
- Backups und Wiederherstellung testen

## Datenschutz

- ohne Login nutzbar
- für Merklisten lokal speichern, bevor Konto verlangt wird
- minimale Telemetrie, keine Werbetracker
- IP-Adressen nicht dauerhaft speichern
- Benachrichtigungen mit klarer Einwilligung
- oeffentliche Personendaten nur im sachlichen Amts-/Mandatskontext

## Quellen- und Nutzungsrecht

- primaer Metadaten, kurze eigene Zusammenfassungen und Links anzeigen
- amtliche Dokumente nur entsprechend geltender Nutzungsbedingungen archivieren/weitergeben
- pro Quelle Lizenz/Nutzungsstatus dokumentieren
- bei unklaren Rechten intern archivieren, aber nicht zwingend spiegeln
- Originalquelle als rechtlich maßgeblich kennzeichnen
- kein offizielles Erscheinungsbild oder Hoheitszeichen vortaeuschen

## Transparenzhinweis in der App

```text
Bundesmonitor ist kein Angebot der Bundesregierung oder des Deutschen Bundestages. Die Anwendung bereitet öffentlich zugaengliche Quellen automatisiert auf. Rechtlich und inhaltlich maßgeblich sind ausschließlich die verlinkten Originalveroeffentlichungen. Trotz laufender Kontrollen kann die Darstellung unvollständig oder zeitverzoegert sein.
```

## Barrierefreiheit

Ziel: WCAG 2.2 AA und Orientierung an BITV 2.0.

Testmatrix:

- Tastatur ohne Maus
- NVDA + Firefox/Chrome unter Windows
- VoiceOver + Safari auf iOS/macOS
- 200 Prozent Zoom
- hoher Kontrast
- reduzierte Bewegung
- schmale Viewports ab 320 px
- deutsche Leichte-Sprache-Erklärungen für zentrale Verfahrensbegriffe später

## Impressum und redaktionelle Verantwortung

Vor oeffentlichem Start rechtlich prüfen:

- Anbieterkennzeichnung
- Datenschutzinformation
- redaktionelle Verantwortlichkeit
- Haftungshinweise
- Lizenz der eigenen API
- Verwendung von Zitaten und Dokumentvorschaubildern
- Push-/E-Mail-Einwilligungen
