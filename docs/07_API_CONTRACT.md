# Oeffentliche API - Entwurf

Basis: `/api/v1`

## Feed

`GET /events`

Parameter:

- `cursor`
- `limit` max 100
- `from`, `to`
- `published_after`
- `category[]`
- `status[]`
- `organization[]`
- `topic[]`
- `matter_type[]`
- `money_min`, `money_max`
- `country`
- `upcoming=true|false`
- `has_money=true|false`
- `quality_flag[]`
- `sort=published|occurred`

Antwort:

```json
{
  "items": [],
  "next_cursor": "...",
  "generated_at": "2026-07-12T08:00:00+02:00",
  "source_status": "healthy"
}
```

## Vorgang

- `GET /matters/{slug}`
- `GET /matters/{slug}/timeline`
- `GET /matters/{slug}/documents`
- `GET /matters/{slug}/money`
- `GET /matters/{slug}/relations`

## Termine

`GET /calendar`

- iCalendar-Ausgabe optional über `Accept: text/calendar`
- Filter wie beim Feed

## Suche

`GET /search?q=`

Ergebnisse gruppiert nach Vorgang, Dokument, Organisation und Person. Kennungen erhalten hoehere Gewichtung als Volltext.

## Quellenstatus

`GET /sources/status`

Öffentlich sichtbare Felder:

- Name
- letzter erfolgreicher Abruf
- letztes neues Element
- erwartete Frequenz
- Status
- bekannte Einschraenkung

Keine internen Fehlermeldungen, Secrets oder Infrastrukturdetails ausgeben.

## Open Data

Später:

- `GET /export/events.ndjson`
- `GET /export/matters.csv`
- `GET /export/calendar.ics`
- Lizenz- und Quellenfelder immer mitliefern

## Fehlerformat

RFC-7807-aehnlich:

```json
{
  "type": "https://bundesmonitor.example/problems/invalid-filter",
  "title": "Ungueltiger Filter",
  "status": 400,
  "detail": "...",
  "request_id": "..."
}
```
