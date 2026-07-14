import Link from "next/link";
import { notFound } from "next/navigation";
import { Begriff } from "@/app/components/Begriff";
import { T } from "@/app/components/LangProvider";
import { PageHeader } from "@/app/components/PageHeader";
import { PostenListe, SourceLine } from "@/app/components/PostenListe";
import { HAUSHALT, fmtEur, getEinzelplan } from "@/lib/geld/haushaltsdaten";
import { VERKEHR_2026 } from "@/lib/haushalt";
import { FISCAL_FACTS } from "@/lib/kennzahlen";
import { RUNDFUNK } from "@/lib/rundfunk";

// Detailseite eines Einzelplans: Kapitel als aufklappbare Balken, darin die
// groessten Einzelposten (Titel) – so tief, wie der Haushalt es hergibt.
// Kuratierte Zusatzbloecke fuer besonders nachgefragte Ressorts.

export function generateStaticParams() {
  return HAUSHALT.einzelplaene.map((e) => ({ nr: e.nr }));
}

export const dynamicParams = false;

function fmtPct(v: number): string {
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v);
}

// Kuratierte Hinweise je Ressort (amtlich belegt an anderer Stelle der App).
function Extra({ nr }: { nr: string }) {
  if (nr === "12") {
    return (
      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-[0.82rem] font-semibold">Große Vorhaben 2026</h2>
        <p className="bm-sub mb-3">
          Zusätzlich zum Kernhaushalt fließen {fmtPct(VERKEHR_2026.svik)} Mrd € aus dem{" "}
          <Begriff k="sondervermoegen">Sondervermögen</Begriff> Infrastruktur in den Verkehr.
        </p>
        <PostenListe items={VERKEHR_2026.posten} color="var(--bm-accent)" />
        <SourceLine sources={[VERKEHR_2026.source]} note={VERKEHR_2026.note} />
      </section>
    );
  }
  if (nr === "14") {
    return (
      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-[0.82rem] font-semibold">Dazu kommt das Sondervermögen</h2>
        <p className="text-[0.76rem] leading-relaxed">
          Neben dem Einzelplan läuft das 2022 per Grundgesetzänderung errichtete{" "}
          <Begriff k="sondervermoegen">Sondervermögen</Begriff> Bundeswehr (100 Mrd €), das
          schrittweise für Beschaffung ausgegeben wird.
        </p>
        <SourceLine
          sources={[
            {
              label: "Deutscher Bundestag – Die Sondervermögen des Bundes",
              url: "https://www.bundestag.de/dokumente/textarchiv/sondervermoegen-doku-1106000",
              asOf: "Überblick",
            },
          ]}
        />
      </section>
    );
  }
  if (nr === "32") {
    return (
      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-[0.82rem] font-semibold">Warum dieser Posten wächst</h2>
        <p className="text-[0.76rem] leading-relaxed">
          Die Bundesschuld enthält vor allem Zinsen auf bestehende Kredite – Geld ohne
          Gestaltungsspielraum. Mit steigender <Begriff k="nettokreditaufnahme">Neuverschuldung</Begriff>{" "}
          wachsen die Zinslasten: {FISCAL_FACTS.planned2029.label}: {FISCAL_FACTS.planned2029.value}.
        </p>
        <SourceLine sources={[FISCAL_FACTS.source]} />
      </section>
    );
  }
  if (nr === "04") {
    return (
      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-[0.82rem] font-semibold">Darin: Kultur, Medien, Deutsche Welle</h2>
        <p className="text-[0.76rem] leading-relaxed">
          Zum Kanzleramts-Einzelplan gehört der Kulturetat (2,57 Mrd € für 2026) – darin auch
          die Deutsche Welle mit {new Intl.NumberFormat("de-DE").format(RUNDFUNK.dw.zuschussMio)}{" "}
          Mio €, der einzige Rundfunksender, den der Bund bezahlt.
        </p>
        <p className="mt-2 text-[0.72rem]" style={{ color: "var(--bm-text-muted)" }}>
          Mehr dazu: <Link className="bm-link" href="/rundfunk">Öffentlich-rechtlicher Rundfunk</Link>
        </p>
        <SourceLine sources={[RUNDFUNK.dw.source]} />
      </section>
    );
  }
  return null;
}

export default async function RessortPage({ params }: { params: Promise<{ nr: string }> }) {
  const { nr } = await params;
  const epl = getEinzelplan(nr);
  if (!epl) notFound();

  const anteil = (epl.value / HAUSHALT.total) * 100;
  const maxKap = Math.max(...epl.kapitel.map((k) => k.value), 1);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={epl.label}
        sub={<T k="ressort.sub" vars={{ nr: epl.nr, year: HAUSHALT.meta.year }} />}
      />

      {/* Kopf: Wert + Anteil */}
      <section className="bm-card p-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="bm-mono text-xl font-bold" style={{ color: "var(--bm-accent)" }}>
            {fmtEur(epl.value)}
          </span>
          <span className="text-[0.72rem]" style={{ color: "var(--bm-text-muted)" }}>
            <T k="ressort.anteil" vars={{ pct: fmtPct(anteil) }} />
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--bm-surface-2)" }}>
          <div
            className="bm-grow h-full rounded-full"
            style={{ width: `${Math.max(anteil, 0.4)}%`, background: "var(--bm-accent)" }}
          />
        </div>
      </section>

      {/* Kapitel mit Titel-Drilldown */}
      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-[0.82rem] font-semibold"><T k="ressort.wofuer" /></h2>
        <p className="bm-sub mb-3">
          <T k="ressort.kapitelTipp" />
        </p>
        <ul className="flex flex-col gap-1.5">
          {epl.kapitel.map((k, i) => (
            <li key={k.nr}>
              <details className="group">
                <summary className="flex cursor-pointer list-none flex-col gap-1 rounded-lg p-1.5 transition-colors hover:bg-[color-mix(in_srgb,var(--bm-accent)_7%,transparent)]">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="flex min-w-0 items-baseline gap-1.5 text-[0.78rem]">
                      <span className="leading-snug" style={{ overflowWrap: "anywhere" }}>
                        {k.label}
                      </span>
                      {k.titel.length > 0 && (
                        <span aria-hidden="true" className="shrink-0 text-[0.62rem]" style={{ color: "var(--bm-accent)" }}>
                          ⓘ
                        </span>
                      )}
                    </span>
                    <span className="bm-mono shrink-0 whitespace-nowrap text-[0.72rem] font-semibold" style={{ color: "var(--bm-accent)" }}>
                      {fmtEur(k.value)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--bm-surface-2)" }}>
                    <div
                      className="bm-grow h-full rounded-full"
                      style={{
                        width: `${Math.max((k.value / maxKap) * 100, 0.5)}%`,
                        background: "var(--bm-accent)",
                        animationDelay: `${Math.min(i * 60, 500)}ms`,
                      }}
                    />
                  </div>
                </summary>
                {k.titel.length > 0 && (
                  <ul className="mb-1 mt-1 flex flex-col gap-1 rounded-lg p-2" style={{ background: "var(--bm-surface-2)" }}>
                    {k.titel.map((t) => (
                      <li key={t.label} className="flex items-baseline justify-between gap-3">
                        <span className="min-w-0 text-[0.7rem]" style={{ overflowWrap: "anywhere" }}>
                          {t.label}
                        </span>
                        <span className="bm-mono shrink-0 text-[0.68rem]" style={{ color: "var(--bm-text-muted)" }}>
                          {fmtEur(t.value)}
                        </span>
                      </li>
                    ))}
                    <li className="pt-1 text-[0.62rem]" style={{ color: "var(--bm-text-muted)" }}>
                      <T k="ressort.topTitel" />
                    </li>
                  </ul>
                )}
              </details>
            </li>
          ))}
        </ul>
        <SourceLine
          sources={[
            {
              label: HAUSHALT.meta.source,
              url: HAUSHALT.meta.sourceUrl,
              asOf: `${HAUSHALT.meta.quota}, Datenstand ${HAUSHALT.meta.apiModifyDate}`,
            },
          ]}
        />
      </section>

      <Extra nr={epl.nr} />

    </div>
  );
}
