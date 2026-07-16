// Kuratierte, amtlich belegte Kennzahlen. Jede Zahl mit Quelle und Stand.
// Keine erfundenen Werte: Grundzahlen stammen aus amtlichen/offiziellen Quellen,
// Ticker sind klar gekennzeichnete lineare Hochrechnungen.

export interface SourceRef {
  label: string;
  url: string;
  asOf: string;
}

// Beschlossene Neuverschuldung des Bundes 2026 (Nettokreditaufnahme, Kernhaushalt).
// Haushaltsgesetz 2026, beschlossen vom Bundestag am 28.11.2025.
export const DEBT_2026 = {
  amountEur: 97_960_000_000,
  year: 2026,
  title: "Neue Schulden des Bundes 2026",
  note: "Nettokreditaufnahme (Kernhaushalt), linear über das Jahr hochgerechnet.",
  source: {
    label: "Deutscher Bundestag – Haushaltsgesetz 2026 (beschlossen)",
    url: "https://www.bundestag.de/dokumente/textarchiv/2025/kw48-de-haushaltsgesetz-2026-dritte-lesung-1126152",
    asOf: "beschlossen 28.11.2025",
  } satisfies SourceRef,
};

// Schuldenstand des Bundes (Kern- und Extrahaushalte, nicht-öffentlicher Bereich).
export const SCHULDEN_BUND = {
  amountEur: 1_840_600_000_000,
  asOfIso: "2025-12-31",
  asOfLabel: "31.12.2025",
  title: "Schulden des Bundes",
  // Kontext Gesamtstaat (gleicher Stichtag, gleiche Abgrenzung).
  gesamtstaatEur: 2_661_500_000_000,
  laenderEur: 624_600_000_000,
  gemeindenEur: 196_300_000_000,
  source: {
    label: "Statistisches Bundesamt – Öffentliche Schulden, 4. Quartal 2025",
    url: "https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/04/PD26_125_713.html",
    asOf: "Stichtag 31.12.2025",
  } satisfies SourceRef,
};

// Bundeshaushalt 2026 (beschlossen): woher das Geld kommt, wohin es geht. Mrd. Euro.
export const HAUSHALT_2026 = {
  year: 2026,
  ausgaben: 524.54,
  investitionen: 58.35,
  einnahmen: [
    { label: "Steuereinnahmen", value: 387.21 },
    { label: "Neue Schulden (Kredite)", value: 97.96 },
    { label: "Übrige Einnahmen", value: 39.37 },
  ],
  // Groesste Ausgabenbloecke laut Beschluss; "Übrige" ist die Restsumme.
  ausgabenBloecke: [
    { label: "Arbeit & Soziales", value: 197.34 },
    { label: "Verteidigung", value: 82.69 },
    { label: "Zinsen (Bundesschuld)", value: 30.18 },
    { label: "Verkehr", value: 27.9 },
    { label: "Übrige Ressorts", value: 186.43 },
  ],
  source: {
    label: "Deutscher Bundestag – Haushaltsgesetz 2026 (beschlossen)",
    url: "https://www.bundestag.de/dokumente/textarchiv/2025/kw48-de-haushaltsgesetz-2026-dritte-lesung-1126152",
    asOf: "beschlossen 28.11.2025",
  } satisfies SourceRef,
  detailUrl: "https://www.bundeshaushalt.de/",
};

export const FISCAL_FACTS = {
  source: {
    label: "Bundesfinanzministerium / Bundesrechnungshof",
    url: "https://www.bundesfinanzministerium.de/Monatsberichte/Ausgabe/2026/01/Inhalte/Kapitel-2-Analysen/2-1-abschluss-bundeshaushalt-ktf-svik-2025.html",
    asOf: "2025/2026",
  } satisfies SourceRef,
  // Nettokreditaufnahme im Vergleich (Mrd. €)
  nka: [
    { label: "2025 (vorl. Abschluss)", value: 66.9, color: "var(--bm-accent-2)" },
    { label: "2026 (beschlossen)", value: 97.96, color: "var(--bm-accent)" },
  ],
  debtRatio: { label: "Schuldenquote Ende 2025", value: "63,5 % des BIP" },
  planned2029: { label: "Geplante Neuverschuldung 2025–2029", value: "rund 850 Mrd. €" },
};

export interface Party {
  name: string;
  pct: number;
  seats: number;
  color: string;
}

export const ELECTION_2025 = {
  title: "Bundestagswahl",
  date: "23. Februar 2025",
  turnout: 82.5,
  totalSeats: 630,
  source: {
    label: "Die Bundeswahlleiterin (endgültiges Ergebnis)",
    url: "https://www.bundeswahlleiterin.de/info/presse/mitteilungen/bundestagswahl-2025/29_25_endgueltiges-ergebnis.html",
    asOf: "endgültiges Ergebnis",
  } satisfies SourceRef,
  // Zweitstimmen in Prozent, konventionelle Parteifarben.
  parties: [
    { name: "CDU/CSU", pct: 28.5, seats: 208, color: "#5b6572" },
    { name: "AfD", pct: 20.8, seats: 152, color: "#1e9de3" },
    { name: "SPD", pct: 16.4, seats: 120, color: "#e3001a" },
    { name: "Grüne", pct: 11.6, seats: 85, color: "#46962b" },
    { name: "Die Linke", pct: 8.8, seats: 64, color: "#be3075" },
    { name: "BSW", pct: 4.98, seats: 0, color: "#7c3aed" },
    { name: "FDP", pct: 4.3, seats: 0, color: "#d9a600" },
    { name: "Sonstige", pct: 4.4, seats: 1, color: "#9aa4b0" },
  ] satisfies Party[],
};

export interface UpcomingElection {
  date: string; // ISO mit Zeitzone
  name: string;
  location: string; // Bundesland / Ort
}

// Amtliche Wahltermine (Quelle: Die Bundeswahlleiterin, Künftige Wahltermine).
export const UPCOMING_ELECTIONS: UpcomingElection[] = [
  { date: "2026-09-06T08:00:00+02:00", name: "Landtagswahl", location: "Sachsen-Anhalt" },
  { date: "2026-09-20T08:00:00+02:00", name: "Landtagswahl", location: "Mecklenburg-Vorpommern" },
  { date: "2026-09-20T08:00:00+02:00", name: "Abgeordnetenhauswahl", location: "Berlin" },
  { date: "2027-04-18T08:00:00+02:00", name: "Landtagswahl", location: "Saarland" },
  { date: "2027-04-18T08:00:00+02:00", name: "Landtagswahl", location: "Schleswig-Holstein" },
  { date: "2027-04-25T08:00:00+02:00", name: "Landtagswahl", location: "Nordrhein-Westfalen" },
];

export const WAHLTERMINE_SOURCE: SourceRef = {
  label: "Die Bundeswahlleiterin – Künftige Wahltermine",
  url: "https://www.bundeswahlleiterin.de/service/wahltermine.html",
  asOf: "amtliche Termine",
};

export interface SessionWeek {
  start: string; // ISO-Datum (Montag)
  end: string; // ISO-Datum (Freitag)
}

// Sitzungswochen des Bundestages 2026 (Quelle: Deutscher Bundestag, Sitzungskalender).
export const BUNDESTAG_SESSIONS_2026: SessionWeek[] = [
  { start: "2026-09-07", end: "2026-09-11" },
  { start: "2026-09-21", end: "2026-09-25" },
  { start: "2026-10-05", end: "2026-10-09" },
  { start: "2026-10-12", end: "2026-10-16" },
  { start: "2026-11-02", end: "2026-11-06" },
  { start: "2026-11-09", end: "2026-11-13" },
  { start: "2026-11-23", end: "2026-11-27" },
  { start: "2026-12-07", end: "2026-12-11" },
  { start: "2026-12-14", end: "2026-12-18" },
];

export const SITZUNGEN_SOURCE: SourceRef = {
  label: "Deutscher Bundestag – Sitzungskalender 2026",
  url: "https://www.bundestag.de/parlament/plenum/sitzungskalender/bt2026-1084980",
  asOf: "Sitzungswochen 2026",
};

// Bundeshaushalt: Soll (Plan) gegen Ist (vorlaeufiger Abschluss), Mrd. Euro.
// Ist-Zahlen gibt es erst nach Jahresende; neuester Abschluss zuerst.
export const HAUSHALT_PLAN_IST = {
  year: 2025,
  items: [
    { label: "Ausgaben gesamt", soll: 502.6, ist: 493.3 },
    { label: "Neue Schulden (NKA)", soll: 81.8, ist: 66.9 },
  ],
  source: {
    label: "Bundesfinanzministerium – Vorläufiger Abschluss Bundeshaushalt 2025",
    url: "https://www.bundesfinanzministerium.de/Monatsberichte/Ausgabe/2026/01/Inhalte/Kapitel-2-Analysen/2-1-abschluss-bundeshaushalt-ktf-svik-2025.html",
    asOf: "vorläufiger Abschluss, Januar 2026",
  } satisfies SourceRef,
};

export const HAUSHALT_PLAN_IST_2024 = {
  year: 2024,
  items: [
    { label: "Ausgaben gesamt", soll: 476.8, ist: 465.7 },
    { label: "Investive Ausgaben", soll: 70.6, ist: 56.7 },
  ],
  source: {
    label: "Bundesfinanzministerium – Vorläufiger Abschluss Bundeshaushalt 2024",
    url: "https://www.bundesfinanzministerium.de/Monatsberichte/Ausgabe/2025/01/Inhalte/Kapitel-3-Analysen/3-1-vorlaeufiger-abschluss-bundeshaushalt-2024.html",
    asOf: "vorläufiger Abschluss 2024",
  } satisfies SourceRef,
};

export function formatEuro(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
