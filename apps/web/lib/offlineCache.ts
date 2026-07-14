// Generischer localStorage-Cache fuer die stale-while-revalidate-Strategie.
// Ziel: zuletzt erfolgreich geladene API-Antworten offline weiter anzeigen.
//
// Der Cache ist bewusst simpel (localStorage, JSON) und SSR-sicher: bei
// fehlendem window (Server-Rendering/statischer Export) passiert nichts.
// Alle Zugriffe sind in try/catch gekapselt, damit ein defekter/voller
// Speicher niemals die App bricht.

const PREFIX = "bm:cache:";

export interface CacheEntry<T> {
  data: T;
  ts: number; // Date.now() zum Zeitpunkt des erfolgreichen Schreibens
}

// Speichert data unter "bm:cache:"+key zusammen mit einem Zeitstempel.
export function writeCache(key: string, data: unknown): void {
  if (typeof window === "undefined") return; // SSR: kein localStorage
  try {
    const entry: CacheEntry<unknown> = { data, ts: Date.now() };
    window.localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // z. B. QuotaExceededError oder deaktivierter Speicher: still ignorieren.
  }
}

// Liest den Cache-Eintrag zu key. Gibt null zurueck, wenn nichts vorhanden
// oder der Eintrag nicht parsebar ist.
export function readCache<T>(key: string): CacheEntry<T> | null {
  if (typeof window === "undefined") return null; // SSR: kein localStorage
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (parsed && typeof parsed.ts === "number" && "data" in parsed) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
