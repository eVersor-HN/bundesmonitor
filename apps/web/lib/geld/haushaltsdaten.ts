// Typisierter Zugriff auf die eingebetteten amtlichen Haushaltsdaten 2026
// (alle Einzelplaene mit Kapiteln und groessten Titeln; Quelle bundeshaushalt.de).

import daten from "./einzelplaene.json";

export interface Titel {
  label: string;
  value: number;
}

export interface Kapitel {
  nr: string;
  label: string;
  value: number;
  titel: Titel[];
}

export interface Einzelplan {
  nr: string;
  label: string;
  value: number;
  kapitel: Kapitel[];
}

export interface Haushaltsdaten {
  meta: {
    year: number;
    quota: string;
    source: string;
    sourceUrl: string;
    apiModifyDate: string;
    fetchedAt: string;
  };
  total: number;
  einzelplaene: Einzelplan[];
}

export const HAUSHALT: Haushaltsdaten = daten as Haushaltsdaten;

export function getEinzelplan(nr: string): Einzelplan | undefined {
  return HAUSHALT.einzelplaene.find((e) => e.nr === nr);
}

// Kurzlabel ohne "Bundesministerium fuer/der/des ..."-Praefix.
export function kurzLabel(label: string): string {
  return label
    .replace(/^Bundesministerium (für|der|des) /, "")
    .replace(/^Die Bundesbeauftragte für den /, "")
    .replace(/^Der /, "");
}

// Euro-Betrag lesbar: ab 1 Mrd in Mrd, sonst in Mio.
export function fmtEur(value: number): string {
  if (Math.abs(value) >= 1e9) {
    return `${new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 1e9)} Mrd €`;
  }
  return `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(value / 1e6)} Mio €`;
}
