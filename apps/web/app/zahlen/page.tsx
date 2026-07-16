"use client";

import Link from "next/link";
import { PageHeader } from "@/app/components/PageHeader";
import { useLive } from "@/app/components/KennzahlenProvider";
import { T } from "@/app/components/LangProvider";
import { BEVOELKERUNG, KRIMINALITAET, WIRTSCHAFT } from "@/lib/statistik";

// Zahlen-Hub: Statistiken aller Art als Einstieg, jede Kachel -> Detailseite.
// Headline-Zahlen kommen bevorzugt vom Server (Live-Overlay), sonst gebundelt.

function fmtMio(v: number): string {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(v / 1e6);
}

export default function ZahlenPage() {
  const live = useLive();
  const krimGesamt = live?.kriminalitaetGesamt ?? KRIMINALITAET.gesamt;
  const krimYear = live?.kriminalitaetYear ?? KRIMINALITAET.year;
  const krimChange = live?.kriminalitaetChange ?? KRIMINALITAET.gesamtChange;
  const einwohner = live?.bevoelkerung ?? BEVOELKERUNG.einwohner;
  const bevYear = live?.bevoelkerungYear ?? BEVOELKERUNG.year;
  const alq = live?.arbeitslosenquoteProzent ?? WIRTSCHAFT.arbeitslosenquoteProzent;
  const arbeitYear = live?.arbeitYear ?? WIRTSCHAFT.arbeitYear;
  const bipChange = live?.bipChange ?? WIRTSCHAFT.bipChange;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={<T k="nav.zahlen" />} sub={<T k="zahlen.sub" />} />

      <section className="flex flex-col gap-2">
        <h2 className="bm-sect px-1">
          <T k="zahlen.sicherheit" />
        </h2>
        <div className="bm-tilegrid">
          <Link href="/zahlen/kriminalitaet" className="bm-tile bm-tile--hero bm-tile--span2">
            <span className="bm-tile__lab">
              <T k="zahlen.kriminalitaet" /> · {krimYear}
            </span>
            <span className="bm-tile__big" style={{ fontSize: "clamp(1.3rem, 3.6vw + 0.55rem, 2.1rem)", margin: "0.2rem 0" }}>
              {fmtMio(krimGesamt)} Mio
            </span>
            <span className="bm-tile__meta">
              erfasste Straftaten · {krimChange} · Aufklärung{" "}
              {new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(KRIMINALITAET.aufklaerungProzent)} % →
            </span>
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="bm-sect px-1">
          <T k="zahlen.gesellschaft" />
        </h2>
        <div className="bm-tilegrid">
          <Link href="/zahlen/bevoelkerung" className="bm-tile">
            <span className="bm-tile__lab">
              <T k="zahlen.bevoelkerung" />
            </span>
            <span className="bm-tile__big" style={{ fontSize: "1.12rem", marginTop: "0.3rem", color: "var(--bm-accent)" }}>
              {fmtMio(einwohner)} Mio
            </span>
            <span className="bm-tile__meta">Einwohner {bevYear} →</span>
          </Link>
          <Link href="/zahlen/wirtschaft" className="bm-tile">
            <span className="bm-tile__lab">
              <T k="zahlen.wirtschaft" />
            </span>
            <span className="bm-tile__big" style={{ fontSize: "1.12rem", marginTop: "0.3rem", color: "var(--bm-accent)" }}>
              {new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(alq)} %
            </span>
            <span className="bm-tile__meta">
              Arbeitslosenquote {arbeitYear} · BIP {bipChange} →
            </span>
          </Link>
          <Link href="/zahlen/laender" className="bm-tile bm-tile--span2">
            <span className="bm-tile__lab">Bundesländer</span>
            <span className="text-[0.82rem] font-semibold">Alle 16 Länder im Vergleich →</span>
            <span className="bm-tile__meta">Einwohner, Regierung, Schulden je Land</span>
          </Link>
        </div>
      </section>

      <p className="px-1 text-[0.68rem]" style={{ color: "var(--bm-text-muted)" }}>
        <T k="zahlen.hinweis" />
      </p>
    </div>
  );
}
