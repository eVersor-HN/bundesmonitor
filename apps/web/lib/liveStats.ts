import { fetchWithTimeout } from "./api";
import { KRIMINALITAET } from "./statistik";

// Live-Kriminalitätsdaten: die App holt die jährlich per GitHub Action erzeugte
// stats.json aus demselben Gist wie den DIP-Schlüssel. Ist sie erreichbar und
// valide, ersetzt sie die eingebauten Zahlen; sonst bleibt der (im APK
// gebündelte) Stand aus statistik.ts als Fallback. So aktualisiert sich die
// Seite ohne neue App-Version, sobald das BKA eine neue PKS veröffentlicht.
const STATS_URL =
  process.env.NEXT_PUBLIC_STATS_URL ||
  "https://gist.githubusercontent.com/eVersor-HN/6c22721add6106ec69d572f9d33e68a7/raw/bundesmonitor-stats.json";

export type Kriminalitaet = typeof KRIMINALITAET;

export async function fetchLiveKriminalitaet(): Promise<Partial<Kriminalitaet> | null> {
  try {
    const res = await fetchWithTimeout(STATS_URL, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { kriminalitaet?: Partial<Kriminalitaet> };
    const k = data?.kriminalitaet;
    // Minimale Plausibilitätsprüfung, bevor wir eingebaute Werte ersetzen.
    if (
      !k ||
      typeof k.gesamt !== "number" ||
      !Array.isArray(k.obergruppen) ||
      k.obergruppen.length < 5
    ) {
      return null;
    }
    return k;
  } catch {
    return null;
  }
}

// Live-Zahlen ueber die eingebauten legen; redaktionelle Texte (Notizen,
// Hinweise, Vorjahresvergleich) bleiben aus dem Fallback erhalten.
export function mergeKriminalitaet(base: Kriminalitaet, live: Partial<Kriminalitaet> | null): Kriminalitaet {
  if (!live) return base;
  return {
    ...base,
    ...live,
    tatverdaechtige: { ...base.tatverdaechtige, ...(live.tatverdaechtige ?? {}) },
  } as Kriminalitaet;
}
