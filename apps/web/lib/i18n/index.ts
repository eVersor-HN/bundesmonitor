// Mehrsprachigkeit der Oberflaeche: eine Woerterbuch-Datei je Sprache.
// Amtliche Inhalte (Vorgangstitel, Kapitel-/Quellennamen) bleiben deutsch.
// Platzhalter {name} werden von translate() ersetzt; fehlende Keys fallen
// auf Deutsch zurueck.

import { AR } from "./ar";
import { DE, type Dict } from "./de";
import { EN } from "./en";
import { IT } from "./it";
import { KU } from "./ku";
import { PL } from "./pl";
import { RO } from "./ro";
import { RU } from "./ru";
import { TR } from "./tr";
import { UK } from "./uk";

export type Lang = "de" | "en" | "tr" | "ar" | "ru" | "pl" | "uk" | "ro" | "it" | "ku";

export const LANGS: { code: Lang; label: string; rtl?: boolean }[] = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "English" },
  { code: "tr", label: "Türkçe" },
  { code: "ar", label: "العربية", rtl: true },
  { code: "ru", label: "Русский" },
  { code: "pl", label: "Polski" },
  { code: "uk", label: "Українська" },
  { code: "ro", label: "Română" },
  { code: "it", label: "Italiano" },
  { code: "ku", label: "Kurdî" },
];

const T: Record<Lang, Dict> = {
  de: DE,
  en: EN,
  tr: TR,
  ar: AR,
  ru: RU,
  pl: PL,
  uk: UK,
  ro: RO,
  it: IT,
  ku: KU,
};

export type TranslateVars = Record<string, string | number>;

export function translate(lang: Lang, key: string, vars?: TranslateVars): string {
  let text = T[lang]?.[key] ?? DE[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

export function isRtl(lang: Lang): boolean {
  return LANGS.find((l) => l.code === lang)?.rtl ?? false;
}

export function getStoredLang(): Lang {
  if (typeof window === "undefined") return "de";
  const v = window.localStorage.getItem("bm:lang");
  return (LANGS.some((l) => l.code === v) ? v : "de") as Lang;
}

export function applyLang(lang: Lang): void {
  window.localStorage.setItem("bm:lang", lang);
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", isRtl(lang) ? "rtl" : "ltr");
}
