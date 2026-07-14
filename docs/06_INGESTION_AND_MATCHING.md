# Ingestion, Normalisierung und Verknüpfung

## Pipeline

```text
Scheduler
  -> Fetcher
  -> Raw archive
  -> Source item versioning
  -> Parser
  -> Validator
  -> Entity resolver
  -> Event builder
  -> Search indexing
  -> Cache invalidation
  -> Notifications
```

## Fetch-Regeln

- eindeutiger User-Agent mit Projektname und Kontaktadresse
- Conditional Requests mit ETag und Last-Modified
- exponentieller Backoff plus Jitter
- Quellenspezifisches Rate Limit
- harte Timeouts
- Retry nur bei transienten Fehlern
- 4xx nicht endlos wiederholen
- HTML/PDF-Änderungen per Hash erkennen
- Antworten vor Parserausfuehrung speichern

## DIP-Inkrementallauf

- alle 15 Minuten
- `f.aktualisiert.start = letzter_erfolgreicher_lauf - 30 Minuten`
- cursor-basiert bis Ende paginieren
- maximal konservative Parallelitaet unterhalb der dokumentierten Grenze
- Entitaeten erneut laden, wenn direkt verknüpfte Entitaeten eine Aktualisierung ausloesen
- erst Cursor committen, wenn gesamter Lauf erfolgreich verarbeitet wurde

## Deduplizierung

Stufen:

1. exakte externe Kennung
2. amtliche Dokumentkennung
3. kanonische URL
4. Dokument-Hash
5. Kombination aus Herausgeber, Titel, Datum und Dokumenttyp
6. semantische Ähnlichkeit nur als Kandidat, nie als automatische Wahrheit

## Vorgangsverknuepfung

Hohe Sicherheit:

- DIP-Vorgangs-ID
- BT-/BR-Drucksachennummer aus amtlicher Verlinkung
- ELI/BGBl-Kennung
- Förderkennzeichen
- IATI Identifier
- eForms/TED Notice ID

Mittlere Sicherheit:

- expliziter Querverweis im Dokument
- identische offizielle Kurzbezeichnung plus Institution und Zeitraum

Niedrige Sicherheit:

- nur ähnlicher Titel oder KI-Ähnlichkeit

Niedrige Sicherheit erfordert manuellen Review oder bleibt unverbunden.

## Änderungen und Korrekturen

- neue Quellenversion nie ueberschreiben
- JSON/HTML-Diff speichern
- sichtbares `Korrigiert`-Ereignis nur bei sachlicher Änderung, nicht bei Layoutaenderung
- entfernte Termine als `cancelled` markieren, nicht löschen
- ersetzte Dokumente weiterhin in der Historie anzeigen

## Zeitlogik

- `published_at`: Quelle hat Inhalt veröffentlicht
- `occurred_at`: politisches/administratives Ereignis fand statt
- `discovered_at`: Bundesmonitor hat es erstmals gesehen
- `effective_at`: Rechtswirkung beginnt
- `source_updated_at`: Quelle meldet letzte Änderung

Feed standardmaessig nach `published_at`, damit Nutzer sehen, wann Information öffentlich wurde. Umschalter `nach Ereignisdatum` anbieten.

## Datenqualitaetsflags

- delayed_source
- incomplete_source
- amount_status_unclear
- recipient_not_published
- machine_extracted
- pdf_only
- corrected_source
- stale_source
- matching_needs_review

## Beobachtbarkeit

Metriken:

- Fetch-Latenz und HTTP-Status
- Parserfehlerquote
- neue/geaenderte Einträge pro Lauf
- Source lag
- Queue-Alter
- Dead-Letter-Anzahl
- Anteil unverbundener Ereignisse
- Anteil KI-Zusammenfassungen ohne belegte Claims muss null sein
