// Oeffentlich-rechtlicher Rundfunk: Finanzen und Struktur.
// Wichtige Einordnung: Der ORR ist Laendersache (Staatsvertraege) und
// beitragsfinanziert – er ist NICHT Teil des Bundeshaushalts. Ausnahme:
// die Deutsche Welle (Auslandssender) wird vom Bund bezahlt.

import type { SourceRef } from "./kennzahlen";
import type { HaushaltPosten } from "./haushalt";

export const RUNDFUNK = {
  beitragMonat: 18.36,
  beitragNote:
    "pro Wohnung, seit August 2021 unverändert. Die KEF empfahl 18,94 € ab 2025 – von den Ländern bislang nicht umgesetzt (Stand Anfang 2026).",
  // Ertraege aus dem Rundfunkbeitrag (Beitragsservice-Jahresbericht 2024).
  ertraege: [
    { year: 2023, value: 9.02 },
    { year: 2024, value: 8.74 },
  ],
  haushalte: 40_516_173,
  befreite: "2,4 Mio Menschen aus sozialen Gründen befreit (Ende 2024)",
  einzugskostenMio: 190.7,
  einzugskostenNote: "2,18 % der Erträge für den Beitragseinzug (Beitragsservice)",
  // Verteilung der Ertraege 2024 (Mrd. Euro).
  verteilung: [
    { label: "ARD (9 Landesrundfunkanstalten)", value: 6.1, ca: true },
    { label: "ZDF", value: 2.2, ca: true },
    {
      label: "Deutschlandradio",
      value: 0.27,
      rest: true,
      hint: "rechnerische Restgröße aus 8,57 Mrd an die Anstalten",
    },
    { label: "Landesmedienanstalten", value: 0.16 },
  ] satisfies HaushaltPosten[],
  personalNote:
    "Gut ein Viertel des Finanzbedarfs 2025–2028 entfällt auf Personalaufwand: 10,3 Mrd € (ohne Altersversorgung).",
  // Gehaelter: Intendanten-Jahresbezuege 2024 (von ARD/ZDF selbst veroeffentlicht).
  intendanten: {
    year: 2024,
    note: "Jahresgehälter laut Transparenz-Veröffentlichungen der Sender (ohne Sachleistungen/Aufwandspauschalen). Auswahl – nicht alle Anstalten veröffentlicht.",
    items: [
      { label: "WDR (bis Ende 2024)", value: 427_900, hint: "Tom Buhrow; Nachfolgerin Katrin Vernau: 348.000 €" },
      { label: "SWR", value: 392_530, hint: "Kai Gniffke, zugleich ARD-Vorsitzender" },
      { label: "ZDF", value: 382_560, hint: "Norbert Himmler, zzgl. 8.617 € Sachbezüge" },
      { label: "NDR", value: 360_371, hint: "Joachim Knuth" },
      { label: "BR", value: 340_267, hint: "Katja Wildermuth" },
      { label: "SR", value: 245_000, hint: "Martin Grasmück" },
      { label: "rbb", value: 220_000, hint: "Ulrike Demmer" },
    ],
    sources: [
      {
        label: "ARD – Transparenz: Gehälter und Vergütungen",
        url: "https://www.ard.de/die-ard/verantwortung/transparenz/",
        asOf: "Berichtsjahr 2024",
      },
      {
        label: "ZDF – Finanzen, Bezüge und Tarifstruktur",
        url: "https://www.zdf.de/unternehmen/organisation/finanzen-bezuege-und-tarifstruktur-100.html",
        asOf: "Berichtsjahr 2024",
      },
    ] satisfies SourceRef[],
  },
  // Personal & Verguetungsniveau (KEF-Feststellungen).
  personal: {
    fakten: [
      "Personalaufwand ARD/ZDF/DRadio: 10,3 Mrd € anerkannter Bedarf für 2025–2028 – ohne Altersversorgung (KEF, 24. Bericht).",
      "Betriebliche Altersversorgung: rund 2,5 Mrd € netto anerkannter Aufwand für 2021–2024 (KEF).",
      "Die KEF stellt bei BR, hr, SR, WDR und ZDF ein überdurchschnittliches Vergütungsniveau fest und fordert Korrekturen.",
      "Das ZDF beschäftigte Ende 2024 4.030 Menschen (2.060 Frauen, 1.969 Männer, 1 divers).",
    ],
    detailNote:
      "Die vollständigen Vergütungstabellen (Tarifgruppen, außertarifliche Verträge, Direktoren-Bezüge) veröffentlichen die Sender selbst – z. B. das ZDF als PDF auf seiner Finanzen-Seite.",
  },
  // Struktur: welche Sender gehoeren wozu.
  struktur: [
    {
      name: "ARD",
      desc: "Verbund von 9 Landesrundfunkanstalten",
      mitglieder: "BR, hr, MDR, NDR, Radio Bremen, rbb, SR, SWR, WDR",
      angebote: "Das Erste, dritte Programme, über 50 Radiowellen",
    },
    {
      name: "ZDF",
      desc: "eigenständige Anstalt der Länder",
      mitglieder: null,
      angebote: "ZDF, ZDFneo, ZDFinfo",
    },
    {
      name: "Deutschlandradio",
      desc: "gemeinsame Körperschaft von ARD und ZDF",
      mitglieder: null,
      angebote: "Deutschlandfunk, Dlf Kultur, Dlf Nova",
    },
    {
      name: "Gemeinschaftsangebote",
      desc: "von ARD und/oder ZDF getragen",
      mitglieder: null,
      angebote: "3sat, ARTE (mit Frankreich), PHOENIX, KiKA, funk",
    },
  ],
  // Deutsche Welle: der einzige Sender aus dem Bundeshaushalt.
  dw: {
    zuschussMio: 395.4,
    note: "Auslandssender; wird nicht aus dem Rundfunkbeitrag, sondern aus dem Kulturetat des Bundes (BKM) bezahlt – beschlossen für 2026.",
    source: {
      label: "Deutscher Bundestag – Etat 2026: Kultur und Medien",
      url: "https://www.bundestag.de/presse/hib/kurzmeldungen-1126844",
      asOf: "beschlossen 2025",
    } satisfies SourceRef,
  },
  sources: [
    {
      label: "Beitragsservice – Jahresbericht 2024",
      url: "https://presse.rundfunkbeitrag.de/pressreleases/beitragsservice-stellt-jahresbericht-2024-vor-beitragsertraege-nach-sondereffekten-des-bundesweiten-meldedatenabgleichs-ruecklaeufig-3390162",
      asOf: "Berichtsjahr 2024",
    },
    {
      label: "KEF – 24. Bericht (Finanzbedarf 2025–2028)",
      url: "https://kef-online.de/fileadmin/kef/Dateien/Berichte/24._KEF-Bericht.pdf",
      asOf: "Februar 2024",
    },
    {
      label: "ARD – Die ARD im Überblick",
      url: "https://www.ard.de/die-ard/",
      asOf: "Struktur",
    },
  ] satisfies SourceRef[],
};
