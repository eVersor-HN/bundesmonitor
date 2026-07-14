# Datenmodell

## Grundprinzip

Rohquelle, normalisierte Entitaet, langfristiger Vorgang und sichtbares Ereignis sind getrennt.

## Tabellen

### sources

- id UUID
- key unique
- name
- organization_id
- base_url
- source_type: api/rss/html/file
- quality_grade
- polling_seconds
- enabled
- terms_url
- robots_url
- config JSONB

### ingest_runs

- id
- source_id
- started_at
- finished_at
- status
- fetched_count
- created_count
- updated_count
- rejected_count
- error_summary
- cursor_before/after

### source_items

Unveraenderte oder versionierte Quelleneintraege.

- id
- source_id
- external_id
- canonical_url
- content_type
- published_at
- source_updated_at
- discovered_at
- fetched_at
- payload_json
- raw_object_key
- sha256
- http_etag
- http_last_modified
- version_no
- is_current
- supersedes_id

Unique: `(source_id, external_id, sha256)`.

### matters

Langfristiger Vorgang.

- id
- matter_type
- canonical_title
- short_title
- description
- current_status
- jurisdiction
- lead_organization_id
- first_seen_at
- last_event_at
- confidence
- public_slug

### identifiers

- id
- matter_id
- scheme: dip_vorgang, bt_drucksache, br_drucksache, eli, bgbl, banz, foerderkennzeichen, iati, tender_notice
- value
- issuer

Unique: `(scheme, value)`.

### events

Feed-Grundlage.

- id
- matter_id nullable
- event_type
- status_before/status_after
- title
- summary
- occurred_at
- published_at
- discovered_at
- effective_at nullable
- organization_id
- source_item_id
- confidence
- is_correction
- is_cancelled
- metadata JSONB

Sortierung primaer `published_at`, Fallback `occurred_at`, stabiler Tie-Breaker `id`.

### documents

- id
- matter_id
- source_item_id
- document_type
- title
- document_number
- publisher
- document_date
- url
- mime_type
- sha256
- language
- extracted_text_object_key

### organizations

- id
- official_name
- short_name
- organization_type
- parent_id
- official_url
- valid_from/valid_to
- identifiers JSONB

### persons

Nur öffentlich relevante Amtspersonen und Mandatstraeger aus offiziellen Quellen.

- id
- display_name
- official_role
- organization_id
- valid_from/valid_to
- official_profile_url

### money_flows

- id
- matter_id/event_id
- flow_type: budget_plan, budget_actual, commitment, grant, procurement_estimate, award, disbursement, tax_expenditure
- status
- amount
- currency
- amount_min/max nullable
- period_start/end
- payer_organization_id
- recipient_organization_id nullable
- recipient_text nullable
- destination_country/region nullable
- purpose
- source_item_id
- confidence

### votes

- id
- matter_id/event_id
- body
- vote_type
- scheduled_at
- held_at
- yes_count/no_count/abstain_count/not_voting_count
- result
- source_item_id

### vote_positions

Nur wenn amtlich namentlich verfügbar.

- vote_id
- person_id
- position
- source_item_id

### relations

- from_matter_id
- to_matter_id
- relation_type: implements, amends, replaces, related, derived_from, budget_funds, procurement_for
- confidence
- evidence_source_item_id

### topics

Kontrolliertes, versioniertes Vokabular. Mehrfachzuordnung über Join-Tabelle.

### subscriptions

- user_id
- query JSONB
- channel
- cadence
- enabled

### source_health

- source_id
- checked_at
- status
- last_success_at
- last_new_item_at
- lag_seconds
- consecutive_failures
- message

## Ereignistypen MVP

- announced
- scheduled
- published
- submitted
- referred_to_committee
- committee_agenda_added
- hearing_scheduled
- hearing_held
- amendment_published
- vote_scheduled
- vote_held
- adopted_bundestag
- rejected_bundestag
- referred_bundesrat
- adopted_bundesrat
- objected_bundesrat
- mediation_started
- signed
- promulgated
- effective
- cabinet_approved
- press_conference_scheduled
- press_conference_transcript_published
- budget_planned
- budget_actual_reported
- grant_approved
- tender_opened
- tender_corrected
- tender_awarded
- petition_opened
- petition_deadline
- source_corrected
- cancelled

## Geldstatus

- announced
- estimated
- planned
- appropriated
- committed
- approved
- contracted
- awarded
- disbursed
- actual_reported
- cancelled
- unknown

## Suchindex

MVP mit PostgreSQL:

- `tsvector` für Titel, Zusammenfassung, Dokumentnummern, Organisationen
- `pg_trgm` für Tippfehler und Kennungen
- Facetten über normale Indizes
- OpenSearch erst bei nachgewiesenem Bedarf
