"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LiveDebtAmount } from "@/app/components/LiveDebtAmount";
import { useLive } from "@/app/components/KennzahlenProvider";
import { useLang } from "@/app/components/LangProvider";
import {
  BUNDESTAG_SESSIONS_2026,
  DEBT_2026,
  HAUSHALT_2026,
  SCHULDEN_BUND,
  UPCOMING_ELECTIONS,
  formatEuro,
} from "@/lib/kennzahlen";
import { KRIMINALITAET, WIRTSCHAFT } from "@/lib/statistik";

// Signal-Dashboard: die Fragen zuerst, die sich alle stellen.
// Wie viele Schulden? Wie viel neu? Wie viel gibt der Bund aus? Was steht an?
// Und: was passiert in meinem Bundesland? Jede Zahl amtlich belegt.

function fmtMrd(v: number): string {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(v);
}

// ISO-Kalenderwoche.
function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
}

function daysUntil(iso: string, now: number): number {
  return Math.ceil((new Date(iso).getTime() - now) / 86_400_000);
}

const BIG = "clamp(1.24rem, 3.9vw, 1.42rem)";

export function Dashboard() {
  const { t } = useLang();
  const live = useLive();
  const baseEur = live?.schuldenBundEur ?? SCHULDEN_BUND.amountEur;
  const rateYearEur = live?.neuverschuldung2026Eur ?? DEBT_2026.amountEur;
  const ausgaben = live?.haushaltAusgabenMrd ?? HAUSHALT_2026.ausgaben;
  const haushaltYear = live?.haushaltYear ?? HAUSHALT_2026.year;
  const krimGesamt = live?.kriminalitaetGesamt ?? KRIMINALITAET.gesamt;
  const krimYear = live?.kriminalitaetYear ?? KRIMINALITAET.year;
  const krimChange = live?.kriminalitaetChange ?? KRIMINALITAET.gesamtChange;
  const inflation = live?.inflationProzent ?? WIRTSCHAFT.inflationProzent;
  const arbeitslos = live?.arbeitslosenquoteProzent ?? WIRTSCHAFT.arbeitslosenquoteProzent;
  const bipChange = live?.bipChange ?? WIRTSCHAFT.bipChange;
  const pct = (v: number) =>
    `${new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v)} %`;
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
  }, []);

  const nextSession = BUNDESTAG_SESSIONS_2026.find(
    (s) => now !== null && new Date(s.end).getTime() + 86_400_000 > now,
  );
  const sessionKw = nextSession ? isoWeek(new Date(nextSession.start)) : null;
  const sessionIn = nextSession && now !== null ? daysUntil(nextSession.start, now) : null;

  const nextElection = UPCOMING_ELECTIONS.find(
    (e) => now !== null && new Date(e.date).getTime() > now,
  );
  const electionIn = nextElection && now !== null ? daysUntil(nextElection.date, now) : null;

  const tiles = "bm-tile bm-hud bm-fadeup";
  const delay = (i: number) => ({ animationDelay: `${i * 55}ms` }) as const;

  return (
    <div className="flex flex-col gap-2">
      <section className="bm-tilegrid" aria-label="Überblick">
        {/* Hero: Schuldenstand des Bundes, live */}
        <Link
          href="/geld/schulden"
          className={`${tiles} bm-tile--hero bm-tile--span2`}
          style={delay(0)}
        >
          <span className="bm-tile__lab bm-live">{t("dash.schulden")}</span>
          <span
            className="bm-tile__big"
            style={{ fontSize: "clamp(1.5rem, 4vw + 0.6rem, 2.6rem)", margin: "0.2rem 0" }}
          >
            <LiveDebtAmount baseEur={baseEur} rateYearEur={rateYearEur} />
          </span>
          <span className="bm-tile__meta">
            {t("dash.schuldenMeta", {
              stand: live?.schuldenAsOf ?? SCHULDEN_BUND.asOfLabel,
              rate: formatEuro(rateYearEur / (365 * 24 * 60 * 60), 0),
            })}
          </span>
        </Link>

        {/* Haushalt (Einstieg in den Geld-Hub) */}
        <Link href="/geld" className={tiles} style={delay(1)}>
          <span className="bm-tile__lab">{t("dash.haushalt", { year: haushaltYear })}</span>
          <span
            className="bm-tile__big whitespace-nowrap"
            style={{ fontSize: BIG, marginTop: "0.3rem", color: "var(--bm-accent)" }}
          >
            {fmtMrd(ausgaben)}&nbsp;Mrd €
          </span>
          <span className="bm-tile__meta">
            {t("dash.haushaltMeta", { n: fmtMrd(rateYearEur / 1e9) })}
          </span>
        </Link>

        {/* Sitzungswoche (deep-link auf die Termine-Sektion) */}
        <Link href="/anstehend#sitzungen" className={tiles} style={delay(2)}>
          <span className="bm-tile__lab">{t("dash.sitzung")}</span>
          <span className="bm-tile__big" style={{ fontSize: BIG, marginTop: "0.3rem" }}>
            {sessionKw === null ? "–" : `KW ${sessionKw}`}
          </span>
          <span className="bm-tile__meta">
            {sessionIn === null
              ? "Bundestag"
              : sessionIn <= 0
                ? t("dash.laeuft")
                : t("dash.inTagen", { n: sessionIn })}
          </span>
        </Link>

        {/* Naechste Wahl (deep-link auf die Wahl-Sektion) */}
        <Link href="/anstehend#wahl" className={tiles} style={delay(3)}>
          <span className="bm-tile__lab">{t("dash.wahl")}</span>
          <span className="bm-tile__big" style={{ fontSize: BIG, marginTop: "0.3rem" }}>
            {electionIn === null ? "–" : t("dash.tage", { n: electionIn })}
          </span>
          <span className="bm-tile__meta max-w-full truncate">{nextElection ? nextElection.location : "–"}</span>
        </Link>

        {/* Kriminalitaet (Statistik-Einstieg) */}
        <Link href="/zahlen/kriminalitaet" className={tiles} style={delay(4)}>
          <span className="bm-tile__lab">{t("zahlen.kriminalitaet")}</span>
          <span className="bm-tile__big whitespace-nowrap" style={{ fontSize: BIG, marginTop: "0.3rem" }}>
            {new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(krimGesamt / 1e6)}&nbsp;Mio
          </span>
          <span className="bm-tile__meta">
            Straftaten {krimYear} · {krimChange}&nbsp;→
          </span>
        </Link>

        {/* Wirtschaftslage – volle Breite: Preise, Jobs, Wachstum auf einen Blick */}
        <Link
          href="/zahlen/wirtschaft"
          className={`${tiles} bm-tile--span2 bm-tile--left`}
          style={delay(5)}
        >
          <span className="bm-tile__lab">Wirtschaftslage</span>
          <div className="mt-2 grid grid-cols-3 gap-x-2">
            <div className="flex flex-col items-start gap-0.5">
              <span className="bm-tile__meta">Inflation</span>
              <span className="bm-tile__big" style={{ fontSize: BIG, color: "var(--bm-accent)" }}>
                {pct(inflation)}
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="bm-tile__meta">BIP real</span>
              <span className="bm-tile__big" style={{ fontSize: BIG }}>
                {bipChange}
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="bm-tile__meta">Arbeitslos</span>
              <span className="bm-tile__big" style={{ fontSize: BIG, color: "var(--bm-accent)" }}>
                {pct(arbeitslos)}
              </span>
            </div>
          </div>
          <span className="bm-tile__meta mt-2">Preise, Jobs &amp; Wachstum&nbsp;→</span>
        </Link>
      </section>
    </div>
  );
}
