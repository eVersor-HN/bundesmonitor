"use client";

import { useLive } from "@/app/components/KennzahlenProvider";
import { PageHeader } from "@/app/components/PageHeader";
import { SourceLine } from "@/app/components/PostenListe";
import { StatList } from "@/app/components/StatList";
import { T } from "@/app/components/LangProvider";
import { BEVOELKERUNG as B } from "@/lib/statistik";

function n(v: number): string {
  return new Intl.NumberFormat("de-DE").format(v);
}

// Erklaerungen, damit man beliebig tief gehen kann.
const BEGRIFFE = [
  {
    label: "Wanderungssaldo",
    text: "Zuzüge nach Deutschland minus Fortzüge, über alle Staatsangehörigkeiten. Ein positiver Saldo bedeutet: mehr Menschen kommen, als gehen.",
  },
  {
    label: "Geburtendefizit",
    text: "Wenn in einem Jahr mehr Menschen sterben als geboren werden. Die Differenz heißt Sterbeüberschuss – 2024 rund +330.000.",
  },
  {
    label: "Geburtenrate (TFR)",
    text: "Durchschnittliche Kinderzahl je Frau. Für eine stabile Bevölkerung ohne Zuwanderung wären etwa 2,1 nötig – 2024 lag sie bei 1,35.",
  },
  {
    label: "Bevölkerungsvorausberechnung",
    text: "Modellrechnung des Statistischen Bundesamts, wie sich die Bevölkerung unter Annahmen zu Geburten, Sterblichkeit und Wanderung entwickeln könnte – keine Vorhersage.",
  },
];

export default function BevoelkerungPage() {
  const live = useLive();
  const year = live?.bevoelkerungYear ?? B.year;
  const einwohner = live?.bevoelkerung ?? B.einwohner;
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={<T k="zahlen.bevoelkerung" />}
        sub={`Wie viele Menschen leben in Deutschland, und wie verändert sich das? Stand ${year}.`}
      />

      {/* Kopf */}
      <section className="bm-card p-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="bm-tile__lab">Einwohner {year}</div>
            <div className="bm-mono text-xl font-bold" style={{ color: "var(--bm-accent)" }}>
              {n(einwohner)}
            </div>
            <div className="text-[0.66rem]" style={{ color: "var(--bm-text-muted)" }}>
              {B.einwohnerNote}
            </div>
          </div>
          <div className="text-right">
            <div className="bm-tile__lab">Wachstum</div>
            <div className="bm-mono text-sm font-semibold" style={{ color: "var(--bm-status-healthy)" }}>
              +{B.wachstumProzent} %
            </div>
            <div className="text-[0.66rem]" style={{ color: "var(--bm-text-muted)" }}>
              +{n(B.wachstumAbs)} Personen
            </div>
          </div>
        </div>
      </section>

      {/* Woraus sich das Wachstum ergibt */}
      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-[0.82rem] font-semibold">Woraus sich die Veränderung ergibt</h2>
        <p className="bm-sub mb-3">Geborene, Gestorbene und Wanderung – Zeile mit ⓘ antippen.</p>
        <StatList items={B.posten} unit="Personen" />
        <p className="mt-2 text-[0.72rem] leading-relaxed" style={{ color: "var(--bm-text-muted)" }}>
          {B.geburtenNote}
        </p>
      </section>

      {/* Geburtenrate */}
      <section className="bm-card p-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[0.82rem] font-semibold">Geburtenrate</h2>
          <span className="bm-mono text-lg font-bold" style={{ color: "var(--bm-accent)" }}>
            {new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2 }).format(B.geburtenrate)}
          </span>
        </div>
        <p className="bm-sub mt-1">Kinder je Frau ({B.year}). Zum Bestandserhalt ohne Zuwanderung wären rund 2,1 nötig.</p>
      </section>

      {/* Begriffe */}
      <section className="bm-card p-3.5">
        <h2 className="mb-2 text-[0.82rem] font-semibold">Begriffe – tiefer einsteigen</h2>
        <ul className="flex flex-col gap-1.5">
          {BEGRIFFE.map((b) => (
            <li key={b.label}>
              <details>
                <summary className="flex cursor-pointer list-none items-baseline gap-1.5 rounded-lg p-1.5 text-[0.78rem] transition-colors hover:bg-[color-mix(in_srgb,var(--bm-accent)_7%,transparent)]">
                  <span>{b.label}</span>
                  <span aria-hidden="true" className="text-[0.62rem]" style={{ color: "var(--bm-accent)" }}>
                    ⓘ
                  </span>
                </summary>
                <p className="px-1.5 pb-1 pt-0.5 text-[0.72rem] leading-relaxed" style={{ color: "var(--bm-text-muted)" }}>
                  {b.text}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </section>

      <SourceLine sources={[B.source]} />

    </div>
  );
}
