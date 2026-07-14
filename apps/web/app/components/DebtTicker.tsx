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

// Optional mit Live-Basis (Schuldenstand) und Jahresrate (neue Schulden).
export function debtNow(baseEur = SCHULDEN_BUND.amountEur, rateYearEur = DEBT_2026.amountEur): number {
  const base = new Date(`${SCHULDEN_BUND.asOfIso}T23:59:59+01:00`).getTime() / 1000;
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
  const ratePerSec = rateYearEur / SECONDS_IN_YEAR;
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAmount(debtNow(baseEur, rateYearEur));
    if (reduce) return;
    const id = window.setInterval(() => setAmount(debtNow(baseEur, rateYearEur)), 80);
    return () => window.clearInterval(id);
  }, [baseEur, rateYearEur]);

  return (
    <section
      className="bm-card relative overflow-hidden p-4"
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
