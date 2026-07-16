// Platzhalter fuer geteilte Design-Tokens und Komponenten. Konkrete Komponenten
// (Feed-Karte, Status-Badge, Zeitleiste) folgen in Phase 1.

export const designTokens = {
  statusColors: {
    healthy: "var(--bm-status-healthy)",
    degraded: "var(--bm-status-degraded)",
    down: "var(--bm-status-down)",
    unknown: "var(--bm-status-unknown)",
  },
} as const;
