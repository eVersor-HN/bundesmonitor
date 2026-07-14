"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { debtNow } from "@/app/components/DebtTicker";
import { useLive } from "@/app/components/KennzahlenProvider";
import { useLang } from "@/app/components/LangProvider";
import { DEBT_2026, HAUSHALT_2026, SCHULDEN_BUND, formatEuro } from "@/lib/kennzahlen";

// Obere Kacheln des Geld-Hubs: Live-Schuldenstand + neue Schulden + Haushalt.
// Zahlen kommen bevorzugt vom Server (Live-Overlay), sonst gebundelt.

function fmtMrd(v: number): string {
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v);
}

export function GeldHubTiles() {
  const { t } = useLang();
  const live = useLive();
  const baseEur = live?.schuldenBundEur ?? SCHULDEN_BUND.amountEur;
  const rateYearEur = live?.neuverschuldung2026Eur ?? DEBT_2026.amountEur;
  const ausgaben = live?.haushaltAusgabenMrd ?? HAUSHALT_2026.ausgaben;
  const haushaltYear = live?.haushaltYear ?? HAUSHALT_2026.year;
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
    <section className="bm-tilegrid" aria-label="Schulden und Haushalt">
      <Link href="/geld/schulden" className="bm-tile bm-tile--hero bm-tile--span2">
        <span className="bm-tile__lab">{t("dash.schulden")}</span>
        <span className="bm-tile__big" style={{ fontSize: "clamp(1.2rem,5.6vw,1.7rem)", margin: "0.2rem 0" }}>
          {amount === null ? "…" : formatEuro(amount)}
        </span>
        <span className="bm-tile__meta">{t("geld.schuldenMeta")}</span>
      </Link>

      <Link href="/geld/neue-schulden" className="bm-tile">
        <span className="bm-tile__lab">{t("geld.neueSchulden", { year: DEBT_2026.year })}</span>
        <span className="bm-tile__big" style={{ fontSize: "1.12rem", marginTop: "0.3rem", color: "var(--bm-accent)" }}>
          {fmtMrd(rateYearEur / 1e9)} Mrd €
        </span>
        <span className="bm-tile__meta">{t("geld.wofuer")}</span>
      </Link>

      <Link href="/geld/ressorts" className="bm-tile">
        <span className="bm-tile__lab">{t("geld.ausgaben", { year: haushaltYear })}</span>
        <span className="bm-tile__big" style={{ fontSize: "1.12rem", marginTop: "0.3rem", color: "var(--bm-accent)" }}>
          {fmtMrd(ausgaben)} Mrd €
        </span>
        <span className="bm-tile__meta">{t("geld.wohinKurz")}</span>
      </Link>
    </section>
  );
}
