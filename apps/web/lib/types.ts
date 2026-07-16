// Antworttypen der Bundesmonitor-API (Phase 1). Werden spaeter durch aus dem
// OpenAPI-Schema generierte Typen in @bundesmonitor/contracts ersetzt.

export interface Topic {
  key: string;
  scheme: string;
  label: string;
}

export interface FeedItem {
  event_id: string;
  event_type: string;
  title: string;
  status_after: string | null;
  published_at: string | null;
  occurred_at: string | null;
  discovered_at: string;
  source_name: string | null;
  source_url: string | null;
  matter_slug: string | null;
  matter_title: string | null;
  matter_type: string | null;
  current_status: string | null;
  topics: Topic[];
}

export interface FeedResponse {
  items: FeedItem[];
  next_cursor: string | null;
  generated_at: string;
}

export interface Identifier {
  scheme: string;
  value: string;
  issuer: string | null;
}

export interface MatterDetail {
  slug: string;
  title: string;
  short_title: string | null;
  description: string | null;
  matter_type: string;
  current_status: string | null;
  first_seen_at: string;
  last_event_at: string | null;
  topics: Topic[];
  identifiers: Identifier[];
}

export interface TimelineEvent {
  event_id: string;
  event_type: string;
  title: string;
  status_after: string | null;
  published_at: string | null;
  occurred_at: string | null;
  source_url: string | null;
}

export interface MatterDocument {
  title: string | null;
  document_type: string | null;
  document_number: string | null;
  publisher: string | null;
  document_date: string | null;
  url: string | null;
}

export interface TopicCount {
  key: string;
  scheme: string;
  label: string;
  matter_count: number;
}

export interface Stats {
  matters: number;
  events: number;
  events_7d: number;
  laws_promulgated: number;
  documents: number;
}

export interface SourceStatus {
  key: string;
  name: string;
  status: "healthy" | "degraded" | "down" | "unknown";
  last_success_at: string | null;
  last_new_item_at: string | null;
  expected_frequency_seconds: number;
  known_limitation: string | null;
}

// Namentliche Abstimmung (amtliche XLSX-Daten von bundestag.de).
export interface VoteFraktion {
  fraktion: string;
  ja: number;
  nein: number;
  enthaltung: number;
  ungueltig: number;
  nicht_abgegeben: number;
}

export interface RollCallVote {
  id: string;
  vote_date: string | null;
  title: string;
  wahlperiode: number;
  sitzung: number;
  abstimm_nr: number;
  totals: Record<string, number>;
  by_fraktion: VoteFraktion[];
  matter_slug: string | null;
  xlsx_url: string | null;
  pdf_url: string | null;
}
