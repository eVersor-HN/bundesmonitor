// Platzhalter. Wird in Phase 1 durch aus dem OpenAPI-Schema der API generierte
// Typen ersetzt (z. B. via openapi-typescript). Bis dahin nur der Basistyp,
// den die Web-App fuer den Quellenstatus nutzt.

export interface SourceStatus {
  name: string;
  last_success_at: string | null;
  last_new_item_at: string | null;
  expected_frequency_seconds: number | null;
  status: "healthy" | "degraded" | "down" | "unknown";
  known_limitation: string | null;
}
