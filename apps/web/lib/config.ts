// Laufzeit-Konfiguration im Client. Die API-Server-Adresse und ein optionaler
// eigener DIP-Schluessel werden lokal im Browser/der App gespeichert (kein Konto,
// konform zur Datenschutzregel). So kann dieselbe APK/PWA auf jeden Server zeigen.

const KEY_API_BASE = "bm:apiBase";
const KEY_DIP_KEY = "bm:dipKey";
const KEY_DIP_BASE = "bm:dipBase";
const KEY_DIP_SOURCE = "bm:dipKeySource";
const KEY_ONBOARDED = "bm:onboarded";

// Basis-Adresse der DIP-API des Bundestages. In der Regel fest; ueber die
// Einstellungen ueberschreibbar (Testzwecke).
const DEFAULT_DIP_BASE = "https://search.dip.bundestag.de/api/v1";

export function getDipBase(): string {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(KEY_DIP_BASE);
    if (stored) return stored.replace(/\/+$/, "");
  }
  return DEFAULT_DIP_BASE;
}

export function setDipBase(value: string): void {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (trimmed) window.localStorage.setItem(KEY_DIP_BASE, trimmed);
  else window.localStorage.removeItem(KEY_DIP_BASE);
}

// Ob der Erststart-Dialog (Key-Onboarding) bereits abgeschlossen wurde.
export function getOnboarded(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(KEY_ONBOARDED) === "1";
}

export function setOnboarded(done: boolean): void {
  if (done) window.localStorage.setItem(KEY_ONBOARDED, "1");
  else window.localStorage.removeItem(KEY_ONBOARDED);
}

function buildDefault(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000").replace(/\/+$/, "");
}

export function getApiBase(): string {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(KEY_API_BASE);
    if (stored) return stored.replace(/\/+$/, "");
  }
  return buildDefault();
}

export function setApiBase(value: string): void {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (trimmed) window.localStorage.setItem(KEY_API_BASE, trimmed);
  else window.localStorage.removeItem(KEY_API_BASE);
}

// Aktiver DIP-Schluessel (leer, bis das Onboarding den oeffentlichen Schluessel
// live laedt oder der Nutzer einen eigenen eintraegt). Es ist KEIN Schluessel im
// Code/APK eingebettet.
export function getDipKey(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(KEY_DIP_KEY) || "";
}

export type DipKeySource = "public" | "own";

export function getDipKeySource(): DipKeySource | null {
  if (typeof window === "undefined") return null;
  const s = window.localStorage.getItem(KEY_DIP_SOURCE);
  return s === "public" || s === "own" ? s : null;
}

export function hasDipKey(): boolean {
  return !!getDipKey();
}

// Ob der Nutzer einen EIGENEN Schluessel hinterlegt hat (nicht den oeffentlichen).
export function hasOwnDipKey(): boolean {
  return getDipKeySource() === "own";
}

// Eigenen Schluessel setzen/loeschen.
export function setDipKey(value: string): void {
  const trimmed = value.trim();
  if (trimmed) {
    window.localStorage.setItem(KEY_DIP_KEY, trimmed);
    window.localStorage.setItem(KEY_DIP_SOURCE, "own");
  } else {
    window.localStorage.removeItem(KEY_DIP_KEY);
    window.localStorage.removeItem(KEY_DIP_SOURCE);
  }
}

// Automatisch geladenen oeffentlichen Schluessel speichern.
export function setPublicDipKey(value: string): void {
  const trimmed = value.trim();
  if (!trimmed) return;
  window.localStorage.setItem(KEY_DIP_KEY, trimmed);
  window.localStorage.setItem(KEY_DIP_SOURCE, "public");
}

const KEY_REFRESH_MIN = "bm:refreshMin";
const DEFAULT_REFRESH_MIN = 5;

// Aktualisierungsintervall in Minuten (0 = aus).
export function getRefreshMinutes(): number {
  if (typeof window === "undefined") return DEFAULT_REFRESH_MIN;
  const raw = window.localStorage.getItem(KEY_REFRESH_MIN);
  if (raw === null) return DEFAULT_REFRESH_MIN;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_REFRESH_MIN;
}

export function setRefreshMinutes(value: number): void {
  const n = Math.max(0, Math.min(1440, Math.round(value)));
  window.localStorage.setItem(KEY_REFRESH_MIN, String(n));
}

const KEY_NOTIFY = "bm:notify";
const KEY_LAST_SEEN = "bm:lastSeen";

export function getNotify(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY_NOTIFY) === "1";
}

export function setNotify(on: boolean): void {
  window.localStorage.setItem(KEY_NOTIFY, on ? "1" : "0");
}

export function getLastSeen(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(KEY_LAST_SEEN) ?? "";
}

export function setLastSeen(eventId: string): void {
  window.localStorage.setItem(KEY_LAST_SEEN, eventId);
}

// Barrierefreiheit: Textgroesse und Farbenblind-Modus.
const KEY_FONT_SCALE = "bm:fontScale";
const KEY_CVD = "bm:cvd";

export type FontScale = "normal" | "gross" | "sehrgross";

export function getFontScale(): FontScale {
  if (typeof window === "undefined") return "normal";
  const v = window.localStorage.getItem(KEY_FONT_SCALE);
  return v === "gross" || v === "sehrgross" ? v : "normal";
}

export function setFontScale(v: FontScale): void {
  const root = document.documentElement;
  if (v === "normal") {
    window.localStorage.removeItem(KEY_FONT_SCALE);
    root.removeAttribute("data-fontscale");
  } else {
    window.localStorage.setItem(KEY_FONT_SCALE, v);
    root.setAttribute("data-fontscale", v);
  }
}

export function getCvd(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY_CVD) === "1";
}

export function setCvd(on: boolean): void {
  const root = document.documentElement;
  if (on) {
    window.localStorage.setItem(KEY_CVD, "1");
    root.setAttribute("data-cvd", "1");
  } else {
    window.localStorage.removeItem(KEY_CVD);
    root.removeAttribute("data-cvd");
  }
}

// "Mein Bundesland": Personalisierung fuer Dashboard-Kachel und Region-Seite.
// Gespeichert wird der Klarname (entspricht dem ort-Topic-Label) + Topic-Key.
const KEY_LAND = "bm:land";

export interface MyLand {
  name: string;
  topicKey: string | null;
}

export function getLand(): MyLand | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY_LAND);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MyLand;
    return parsed?.name ? parsed : null;
  } catch {
    return null;
  }
}

export function setLand(value: MyLand | null): void {
  if (value === null) window.localStorage.removeItem(KEY_LAND);
  else window.localStorage.setItem(KEY_LAND, JSON.stringify(value));
}

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem("bm:favorites") ?? "[]") as string[];
  } catch {
    return [];
  }
}

// Merkliste: vom Nutzer gemerkte Vorgänge (lokal, kein Konto). Speichert Slug,
// Titel und Typ, damit die Merkliste ohne erneuten Abruf anzeigbar ist.
const KEY_MERK = "bm:merkliste";

export interface MerkItem {
  slug: string;
  title: string;
  type: string | null;
}

export function getMerkliste(): MerkItem[] {
  if (typeof window === "undefined") return [];
  try {
    const arr = JSON.parse(window.localStorage.getItem(KEY_MERK) ?? "[]") as MerkItem[];
    return Array.isArray(arr) ? arr.filter((m) => m && typeof m.slug === "string") : [];
  } catch {
    return [];
  }
}

export function isGemerkt(slug: string): boolean {
  return getMerkliste().some((m) => m.slug === slug);
}

// Fügt hinzu oder entfernt; gibt den neuen Zustand zurück (true = jetzt gemerkt).
export function toggleMerken(item: MerkItem): boolean {
  const list = getMerkliste();
  const exists = list.some((m) => m.slug === item.slug);
  const next = exists ? list.filter((m) => m.slug !== item.slug) : [item, ...list];
  window.localStorage.setItem(KEY_MERK, JSON.stringify(next));
  return !exists;
}
