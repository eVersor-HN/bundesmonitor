// Kennzahlen-Overlay: serverlos aus einer ins APK gebuendelten statischen JSON
// (public/kennzahlen.json). Nicht-brechend - schlaegt das Laden fehl, fallen die
// Seiten auf die inline gebundelten Defaults zurueck. Ueber NEXT_PUBLIC_KENNZAHLEN_URL
// laesst sich optional eine extern gehostete, haeufiger aktualisierte JSON setzen.
// Datenschutz: gecacht wird ausschliesslich lokal (localStorage), kein Konto.

const KENNZAHLEN_URL = process.env.NEXT_PUBLIC_KENNZAHLEN_URL || "/kennzahlen.json";

// Zielform der /api/v1/kennzahlen-Antwort (FLACH, keine Wrapper-Keys).
// WICHTIG: Alle Felder sind optionales Live-Overlay. Konsumenten MUESSEN
// jeden Wert immer mit `?? <gebundelter Default>` absichern, damit Seiten
// ohne erreichbaren Server (oder bei aelterer JSON-Version) korrekt bleiben.
export interface LiveData {
  version: number;         // 2
  generatedAt: string;     // "2026-07-13"
  schuldenBundEur: number;         // 1840600000000
  schuldenAsOf: string;            // "31.12.2025"
  schuldenGesamtEur: number;       // 2661500000000
  neuverschuldung2026Eur: number;  // 97960000000
  haushaltAusgabenMrd: number;     // 524.54
  haushaltYear: number;            // 2026
  kriminalitaetGesamt: number;     // 5837445
  kriminalitaetYear: number;       // 2024
  kriminalitaetChange: string;     // "−1,7 %"
  steuernGesamtMrd: number;        // 989.8
  steuernYear: number;             // 2025
  rundfunkBeitragMonat: number;    // 18.36
  rundfunkErtraegeMrd: number;     // 8.74
  rundfunkYear: number;            // 2024
  bevoelkerung: number;            // 83600000
  bevoelkerungYear: number;        // 2024
  bipChange: string;               // "−0,2 %"
  bipYear: number;                 // 2024
  inflationProzent: number;        // 2.2
  arbeitslosenquoteProzent: number; // 6.3
  arbeitYear: number;              // 2025
}

export const LIVE_KEY = "bm:live";

export function getCachedLive(): LiveData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LIVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LiveData;
    return typeof parsed?.version === "number" ? parsed : null;
  } catch {
    return null;
  }
}

export function setCachedLive(d: LiveData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LIVE_KEY, JSON.stringify(d));
  } catch {
    // localStorage nicht verfuegbar (Privat-Modus o.ae.) - still ignorieren.
  }
}

export async function fetchLive(): Promise<LiveData | null> {
  try {
    const res = await fetch(KENNZAHLEN_URL, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as LiveData;
    if (typeof data?.version !== "number") return null;
    setCachedLive(data);
    return data;
  } catch {
    return null;
  }
}
