// Zentrale Zuordnung von Partei-/Fraktionsnamen zu den themebaren Partei-CSS-
// Tokens (--bm-party-*). Einzige Quelle der Wahrheit (ADR 0003): Parteifarben
// dienen ausschliesslich der neutralen Identifikation, sind hell/dunkel
// angepasst und werden nur als Akzent verwendet (Punkt, Balken, Rahmen,
// Chip-Hintergrund) – nie als kleiner Fliesstext auf hellem Grund.

export type ParteiToken =
  | "spd"
  | "cdu"
  | "csu"
  | "gruene"
  | "fdp"
  | "afd"
  | "linke"
  | "fraktionslos";

// Normalisiert einen beliebigen Partei-/Fraktionsnamen auf einen Token-Schluessel.
// Unbekannte Gruppen (z. B. BSW, Sonstige) fallen neutral auf "fraktionslos".
export function partyTokenKey(key: string): ParteiToken {
  const k = key.toLowerCase().trim();
  if (k.includes("spd") || k.includes("sozialdemokrat")) return "spd";
  // Kombinierte Unionsfraktion zuerst -> neutrales CDU-Grau.
  if (k.includes("cdu/csu") || k.includes("union")) return "cdu";
  if (k.includes("csu")) return "csu";
  if (k.includes("cdu") || k.includes("christlich")) return "cdu";
  if (
    k.includes("grüne") ||
    k.includes("gruene") ||
    k.includes("grune") ||
    k.includes("bündnis") ||
    k.includes("bundnis")
  )
    return "gruene";
  if (k.includes("fdp") || k.includes("freie demokrat")) return "fdp";
  if (k.includes("afd") || k.includes("alternative")) return "afd";
  if (k.includes("linke")) return "linke";
  return "fraktionslos";
}

// Liefert den CSS-Token als `var(--bm-party-…)` fuer Farb-Akzente.
export function partyColorVar(key: string): string {
  return `var(--bm-party-${partyTokenKey(key)})`;
}
