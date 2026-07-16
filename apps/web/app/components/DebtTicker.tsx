"use client";

import { useEffect, useState } from "react";
import { useLive } from "@/app/components/KennzahlenProvider";
import { DEBT_2026, SCHULDEN_BUND, formatEuro } from "@/lib/kennzahlen";

// Live-Schuldenstand des Bundes: amtlicher Stand (Destatis, Stichtag) plus
// die beschlossene Nettokreditaufnahme 2026, linear ueber das Jahr
// hochgerechnet. Klar als Hochrechnung gekennzeichnet. Basis-Zahlen koennen
// vom Server aktualisiert werden (Live-Overlay), Fallback = gebundelte Werte.

const SECONDS_IN_YEAR = 365 * 24 * 60 * 60;
export const DEBT_RATE_PER_SEC = DEBT_2026.amountEur / SECONDS_IN_YEAR;

// Deutsches Stichtagsdatum ("31.12.2025") in ISO ("2025-12-31") umwandeln.
// Das Live-Overlay liefert schuldenAsOf im deutschen Format; die Projektion
// braucht denselben Anker wie der angezeigte Betrag. Nicht parsebare Eingaben
// -> null (Fallback auf den gebundelten Stichtag).
export function germanDateToIso(d: string | null | undefined): string | null {
  if (!d) return null;
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(d.trim());
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

// Optional mit Live-Basis (Schuldenstand), Jahresrate (neue Schulden) und
// Stichtag der Basis (asOf, ISO). Der Projektionsanker MUSS derselbe Stichtag
// sein wie der angezeigte Basisbetrag, sonst wird bei neuerer Live-Zahl doppelt
// gezaehlt.
export function debtNow(
  baseEur = SCHULDEN_BUND.amountEur,
  rateYearEur = DEBT_2026.amountEur,
  asOfIso = SCHULDEN_BUND.asOfIso,
): number {
  const base = new Date(`${asOfIso}T23:59:59+01:00`).getTime() / 1000;
  const now = Date.now() / 1000;
  const elapsed = Math.min(Math.max(now - base, 0), SECONDS_IN_YEAR);
  return baseEur + elapsed * (rateYearEur / SECONDS_IN_YEAR);
}

export function DebtTicker() {
  const live = useLive();
  const baseEur = live?.schuldenBundEur ?? SCHULDEN_BUND.amountEur;
  const rateYearEur = live?.neuverschuldung2026Eur ?? DEBT_2026.amountEur;
  const gesamtEur = live?.schuldenGesamtEur ?? SCHULDEN_BUND.gesamtstaatEur;
  const asOfLabel = live?.schuldenAsOf ?? SCHULDEN_BUND.asOfLabel;
  // Projektionsanker = Stichtag des angezeigten Basisbetrags. Bei Live-Overlay
  // dessen asOf (deutsch -> ISO), sonst der gebundelte Stichtag.
  const asOfIso = germanDateToIso(live?.schuldenAsOf) ?? SCHULDEN_BUND.asOfIso;
  const ratePerSec = rateYearEur / SECONDS_IN_YEAR;
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAmount(debtNow(baseEur, rateYearEur, asOfIso));
    if (reduce) return;
    // Im Hintergrund (Tab/App verdeckt) nicht neu rechnen/setzen; beim
    // Zurueckkehren sofort auffrischen (visibilitychange).
    const tick = () => {
      if (!document.hidden) setAmount(debtNow(baseEur, rateYearEur, asOfIso));
    };
    const id = window.setInterval(tick, 80);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [baseEur, rateYearEur, asOfIso]);

  return (
    <section
      className="bm-card bm-card--roomy relative overflow-hidden"
      style={{ borderColor: "color-mix(in srgb, var(--bm-accent) 40%, var(--bm-border))" }}
    >
      <div className="relative flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[0.82rem] font-semibold">{SCHULDEN_BUND.title}</h2>
          <span className="bm-chip" style={{ color: "var(--bm-accent)" }}>
            <span className="bm-mono text-[0.62rem] tracking-wide">LIVE · HOCHRECHNUNG</span>
          </span>
        </div>
        <p
          className="bm-mono bm-glow-text text-[clamp(1.6rem,6.5vw,2.45rem)] font-bold leading-tight"
          style={{ color: "var(--bm-accent)" }}
        >
          {amount === null ? "…" : formatEuro(amount)}
        </p>
        <p className="text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
          Amtlicher Stand {formatEuro(baseEur)} ({asOfLabel}) + beschlossene neue Schulden 2026 (
          {formatEuro(rateYearEur)}), linear ≈ {formatEuro(ratePerSec, 0)}/Sekunde.
        </p>
        <p className="text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
          Ganz Deutschland (Bund + Länder + Gemeinden): {formatEuro(gesamtEur)} ({asOfLabel}).
        </p>
        <a
          className="bm-link mt-1 w-fit text-[0.7rem]"
          href={SCHULDEN_BUND.source.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          Quelle: {SCHULDEN_BUND.source.label}
        </a>
      </div>
    </section>
  );
}
