import Link from "next/link";
import { MoneyFlow } from "@/app/components/MoneyFlow";
import { PageHeader } from "@/app/components/PageHeader";
import { GeldHubTiles } from "@/app/components/GeldHubTiles";
import { T } from "@/app/components/LangProvider";
import { getEinzelplan, kurzLabel } from "@/lib/geld/haushaltsdaten";

// Geld-Hub: Dashboard als Einstieg. Jede Kachel fuehrt zu einer eigenen
// Detailseite; nichts ist anklickbar, was kein Ziel hat.

function fmtMrd(v: number): string {
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v / 1e9);
}

export default function GeldPage() {
  const topRessorts = ["11", "14", "12"]
    .map((nr) => getEinzelplan(nr))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={<T k="title.geld" />}
        sub={<T k="geld.sub" />}
      />

      {/* Schulden (live) + Haushalt (Client-Kacheln) */}
      <GeldHubTiles />

      {/* Wohin geht das Geld */}
      <section className="flex flex-col gap-2">
        <h2 className="bm-sect px-1"><T k="geld.wohin" /></h2>
        <div className="bm-tilegrid">
          {topRessorts.map((e) => (
            <Link key={e.nr} href={`/geld/ressort/${e.nr}`} className="bm-tile">
              <span className="bm-tile__lab"><T k="geld.ressort" /></span>
              <span className="text-[0.8rem] font-semibold">{kurzLabel(e.label)}</span>
              <span className="bm-tile__meta">
                <span className="bm-mono font-semibold whitespace-nowrap" style={{ color: "var(--bm-accent)" }}>
                  {fmtMrd(e.value)}&nbsp;Mrd €
                </span>&nbsp;→
              </span>
            </Link>
          ))}
          <Link href="/geld/ressorts" className="bm-tile">
            <span className="bm-tile__lab"><T k="geld.alleRessorts" /></span>
            <span className="text-[0.8rem] font-semibold"><T k="geld.einzelplaene" /></span>
            <span className="bm-tile__meta" style={{ color: "var(--bm-accent)" }}>
              <T k="geld.liste" />
            </span>
          </Link>
          <Link href="/geld/empfaenger" className="bm-tile bm-tile--span2">
            <span className="bm-tile__lab">Empfänger</span>
            <span className="text-[0.8rem] font-semibold">Wem gibt der Staat Geld?</span>
            <span className="bm-tile__meta" style={{ color: "var(--bm-accent)" }}>
              NGOs, Kultur, Ehrenamt →
            </span>
          </Link>
        </div>
      </section>

      {/* Woher kommt das Geld */}
      <section className="flex flex-col gap-2">
        <h2 className="bm-sect px-1"><T k="geld.woher" /></h2>
        <div className="bm-tilegrid">
          <Link href="/geld/steuern" className="bm-tile">
            <span className="bm-tile__lab"><T k="geld.steuern" /></span>
            <span className="text-[0.8rem] font-semibold"><T k="geld.steuernAlle" /></span>
            <span className="bm-tile__meta" style={{ color: "var(--bm-accent)" }}>
              989,8 Mrd € (2025) →
            </span>
          </Link>
          <Link href="/geld/einnahmen" className="bm-tile">
            <span className="bm-tile__lab"><T k="geld.einnahmen" vars={{ year: 2026 }} /></span>
            <span className="text-[0.8rem] font-semibold"><T k="geld.woraus" /></span>
            <span className="bm-tile__meta" style={{ color: "var(--bm-accent)" }}>
              524,5 Mrd € →
            </span>
          </Link>
        </div>
      </section>

      {/* Kontrolle & Kontext */}
      <section className="flex flex-col gap-2">
        <h2 className="bm-sect px-1"><T k="geld.kontrolleKontext" /></h2>
        <div className="bm-tilegrid">
          <Link href="/geld/plan-ist" className="bm-tile">
            <span className="bm-tile__lab"><T k="geld.kontrolle" /></span>
            <span className="text-[0.8rem] font-semibold"><T k="geld.planIst" /></span>
            <span className="bm-tile__meta" style={{ color: "var(--bm-accent)" }}>
              <T k="geld.planFrage" />
            </span>
          </Link>
          <Link href="/rundfunk" className="bm-tile">
            <span className="bm-tile__lab"><T k="geld.kontext" /></span>
            <span className="text-[0.8rem] font-semibold"><T k="geld.rundfunk" /></span>
            <span className="bm-tile__meta" style={{ color: "var(--bm-accent)" }}>
              <T k="geld.beitragSender" />
            </span>
          </Link>
          <Link href="/akteure/diaeten" className="bm-tile">
            <span className="bm-tile__lab">Bezüge</span>
            <span className="text-[0.8rem] font-semibold">Was Politiker verdienen</span>
            <span className="bm-tile__meta" style={{ color: "var(--bm-accent)" }}>
              Diäten &amp; Amtsbezüge →
            </span>
          </Link>
        </div>
      </section>

      {/* Ueberblick als Grafik (Zeilen fuehren zu den Detailseiten) */}
      <MoneyFlow />
    </div>
  );
}
