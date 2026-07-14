// Detaildaten zum Bundeshaushalt 2026 und zu den Sondervermoegen.
// Nur amtlich belegte Betraege; rechnerische Restgroessen sind als solche
// gekennzeichnet (Regel: bei Unsicherheit nicht raten).

import type { SourceRef } from "./kennzahlen";

export interface HaushaltPosten {
  label: string;
  value: number; // Mrd. Euro
  hint?: string;
  ca?: boolean; // "rund"-Angabe der Quelle
  rest?: boolean; // rechnerische Restgroesse
}

const BESCHLUSS_SOURCE: SourceRef = {
  label: "Deutscher Bundestag – Haushaltsgesetz 2026 (beschlossen)",
  url: "https://www.bundestag.de/dokumente/textarchiv/2025/kw48-de-haushaltsgesetz-2026-dritte-lesung-1126152",
  asOf: "beschlossen 28.11.2025",
};

const BEREINIGUNG_SOURCE: SourceRef = {
  label: "Deutscher Bundestag – Bereinigungssitzung Haushaltsausschuss",
  url: "https://www.bundestag.de/dokumente/textarchiv/2025/kw46-pa-haushalt-bereinigung-1126856",
  asOf: "14.11.2025",
};

// Ausgaben nach Einzelplaenen – die amtlich einzeln belegten Etats.
export const EINZELPLAENE_2026 = {
  year: 2026,
  totalAusgaben: 524.54,
  items: [
    {
      label: "Arbeit & Soziales",
      value: 197.34,
      hint: "größter Etat: u. a. Zuschüsse zur Rentenversicherung, Grundsicherung, Arbeitsmarkt",
    },
    {
      label: "Verteidigung",
      value: 82.69,
      hint: "Bundeswehr; zusätzlich läuft das Sondervermögen von 2022 (100 Mrd €)",
    },
    {
      label: "Bundesschuld (Zinsen)",
      value: 30.18,
      hint: "Zinsen auf bestehende Schulden – kein Gestaltungsspielraum",
    },
    {
      label: "Verkehr",
      value: 27.9,
      hint: "Schiene, Bundesfernstraßen, Wasserstraßen – Details unten",
    },
    {
      label: "Bundeskanzleramt (inkl. Kultur & Medien)",
      value: 5.0,
      ca: true,
      hint: "darin Kulturetat 2,57 Mrd € und Deutsche Welle 395,4 Mio €",
    },
    { label: "Digitales & Staatsmodernisierung", value: 1.36, hint: "neues Ministerium" },
    { label: "Deutscher Bundestag", value: 1.28, hint: "Parlament, Verwaltung, Abgeordnete" },
    {
      label: "Weitere Einzelpläne",
      value: 178.79,
      rest: true,
      hint: "u. a. Gesundheit, Bildung & Forschung, Inneres, Finanzen, Auswärtiges, Familie, Entwicklung – alle im Detail auf bundeshaushalt.de",
    },
  ] satisfies HaushaltPosten[],
  source: BESCHLUSS_SOURCE,
  source2: BEREINIGUNG_SOURCE,
  detailUrl: "https://www.bundeshaushalt.de/",
};

// Einnahmen im Detail.
export const EINNAHMEN_2026 = {
  year: 2026,
  total: 524.54,
  items: [
    {
      label: "Steuereinnahmen",
      value: 387.21,
      hint: "u. a. Anteile an Einkommen-, Umsatz- und Körperschaftsteuer, Energiesteuer",
    },
    {
      label: "Neue Schulden (Nettokreditaufnahme)",
      value: 97.96,
      hint: "Kredite am Kapitalmarkt – Erklärung unten",
    },
    {
      label: "Verwaltungseinnahmen",
      value: 22.87,
      hint: "Gebühren, Entgelte, Erlöse und Gewinnabführungen",
    },
    { label: "Münzeinnahmen", value: 0.15, hint: "Ausgabe von Münzen (Prägegewinn)" },
    {
      label: "Übrige Einnahmen",
      value: 16.35,
      rest: true,
      hint: "rechnerische Restgröße, u. a. Darlehensrückflüsse und sonstige Zuflüsse",
    },
  ] satisfies HaushaltPosten[],
  source: {
    label: "Das Parlament – Der Bundeshaushalt 2026",
    url: "https://www.das-parlament.de/wirtschaft/haushalt/das-ist-der-bundeshaushalt-2026",
    asOf: "beschlossen 28.11.2025",
  } satisfies SourceRef,
};

// Wofuer werden die neuen Schulden aufgenommen?
export const SCHULDEN_ZWECK = {
  kernNka: 97.96,
  erklaerung:
    "Kredite im Kernhaushalt sind rechtlich nicht zweckgebunden: Sie schließen die Lücke zwischen den beschlossenen Ausgaben (524,54 Mrd €) und den übrigen Einnahmen. Daneben nimmt der Bund zusätzliche Kredite über Sondervermögen auf – diese sind zweckgebunden:",
  sondervermoegen: [
    {
      label: "Infrastruktur & Klimaneutralität (SVIK)",
      value: 500,
      hint: "2025–2036; davon 300 Mrd Bund-Infrastruktur, 100 Mrd Länder & Kommunen, 100 Mrd Klima- und Transformationsfonds",
    },
    {
      label: "Bundeswehr-Sondervermögen",
      value: 100,
      hint: "2022 per Grundgesetzänderung errichtet, wird schrittweise ausgegeben",
    },
  ] satisfies HaushaltPosten[],
  sources: [
    {
      label: "Bundesfinanzministerium – Sondervermögen Infrastruktur und Klimaneutralität",
      url: "https://www.bundesfinanzministerium.de/Web/DE/Themen/Oeffentliche_Finanzen/SVIK/sondervermoegen-infrastruktur-klimaneutralitaet.html",
      asOf: "Gesetz 2025",
    },
    {
      label: "Deutscher Bundestag – Die Sondervermögen des Bundes",
      url: "https://www.bundestag.de/dokumente/textarchiv/sondervermoegen-doku-1106000",
      asOf: "Überblick",
    },
  ] satisfies SourceRef[],
};

// Verkehrsetat 2026 im Detail (Einzelplan 12).
export const VERKEHR_2026 = {
  kern: 27.9,
  svik: 21.25,
  posten: [
    {
      label: "Schienenwege der Bahn (Baukostenzuschüsse)",
      value: 16.3,
      hint: "Erhalt und Modernisierung des Schienennetzes (2025: 7,62 Mrd)",
    },
    {
      label: "Bundesfernstraßen",
      value: 10.83,
      hint: "Autobahnen und Bundesstraßen: Bau, Erhalt, Betrieb",
    },
    {
      label: "Digitale Zugsicherung ERTMS",
      value: 2.45,
      hint: "europäisches Zugbeeinflussungssystem (2025: 1,59 Mrd)",
    },
  ] satisfies HaushaltPosten[],
  note: "Die Posten werden teils aus dem Kernhaushalt, teils aus dem Sondervermögen finanziert und sind daher nicht einfach addierbar.",
  source: {
    label: "Deutscher Bundestag – Verkehrsetat 2026 beschlossen",
    url: "https://www.bundestag.de/dokumente/textarchiv/2025/kw48-de-verkehr-1126076",
    asOf: "beschlossen 27.11.2025",
  } satisfies SourceRef,
};
