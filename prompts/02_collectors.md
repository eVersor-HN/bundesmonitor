# Prompt - DIP Collector

Implementiere den DIP-Collector als ersten produktiven Collector.

Pflicht:

- API-Key nur serverseitig
- `f.aktualisiert.start` mit 30 Minuten Ueberlappung
- cursor-basierte Pagination
- Conditional Requests, soweit sinnvoll
- Rohantwort vor Parsing in MinIO archivieren
- SHA-256 und Versionierung in `source_items`
- idempotente Upserts
- Parser für Vorgang, Vorgangsposition und Drucksache
- Verknüpfung über DIP-IDs und Dokumentnummern
- Ereigniserzeugung für Veröffentlichung, Einbringung, Ausschussueberweisung, Beratung und Beschluss, soweit eindeutig aus Quelldaten ableitbar
- keine Ableitung aus reinem Titeltext, wenn strukturierte Felder fehlen
- Unit-, Fixture- und Integrations-Tests
- Metriken und Source Health

Simuliere in Tests:

- leere Antwort
- mehr als eine Cursor-Seite
- wiederholter identischer Lauf
- geaenderter Datensatz
- API-Timeout
- 429/500
- unvollstaendige Referenzen
