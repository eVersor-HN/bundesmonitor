"use client";

import { useLive } from "@/app/components/KennzahlenProvider";
import { PageHeader } from "@/app/components/PageHeader";
import { SourceLine } from "@/app/components/PostenListe";
import { T } from "@/app/components/LangProvider";
import { WIRTSCHAFT as W } from "@/lib/statistik";

function n(v: number): string {
  return new Intl.NumberFormat("de-DE").format(v);
}

// Kennzahl-Karte mit aufklappbarer Erklaerung.
function Kennzahl({
  titel,
  wert,
  sub,
  erklaerung,
  farbe = "var(--bm-accent)",
}: {
  titel: string;
  wert: string;
  sub: string;
  erklaerung: string;
  farbe?: string;
}) {
  return (
    <section className="bm-card p-3.5">
      <details>
        <summary className="flex cursor-pointer list-none flex-col gap-0.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="flex items-baseline gap-1.5 text-[0.82rem] font-semibold">
              {titel}
              <span aria-hidden="true" className="text-[0.62rem]" style={{ color: "var(--bm-accent)" }}>
                ⓘ
              </span>
            </span>
            <span className="bm-mono text-lg font-bold" style={{ color: farbe }}>
              {wert}
            </span>
          </div>
          <span className="bm-sub">{sub}</span>
        </summary>
        <p className="mt-2 rounded-lg p-2.5 text-[0.72rem] leading-relaxed" style={{ background: "var(--bm-surface-2)" }}>
          {erklaerung}
        </p>
      </details>
    </section>
  );
}

export default function WirtschaftPage() {
  const live = useLive();
  const bipYear = live?.bipYear ?? W.bipYear;
  const bipChange = live?.bipChange ?? W.bipChange;
  const inflationProzent = live?.inflationProzent ?? W.inflationProzent;
  const arbeitslosenquoteProzent = live?.arbeitslosenquoteProzent ?? W.arbeitslosenquoteProzent;
  const arbeitYear = live?.arbeitYear ?? W.arbeitYear;
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={<T k="zahlen.wirtschaft" />}
        sub="Die großen Konjunktur-Kennzahlen – jede Karte antippen für die Erklärung, wie sie gemessen wird."
      />

      <Kennzahl
        titel={`Wirtschaftsleistung (BIP) ${bipYear}`}
        wert={bipChange}
        sub={W.bipNote}
        farbe="var(--bm-status-down)"
        erklaerung={`Das Bruttoinlandsprodukt ist der Wert aller Waren und Dienstleistungen, die in einem Jahr im Land erwirtschaftet werden. „Real“ heißt: um Preissteigerungen bereinigt, also die echte Mengenentwicklung. Ein Minus bedeutet, dass die Wirtschaft geschrumpft ist. Für ${W.arbeitYear === 2025 ? "2025" : "das Folgejahr"} wird wieder ein leichtes Plus von ${W.bip2025Change} erwartet.`}
      />

      <Kennzahl
        titel={`Inflation ${W.inflationYear}`}
        wert={`${new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1 }).format(inflationProzent)} %`}
        sub={W.inflationNote}
        erklaerung="Die Inflationsrate misst, wie stark die Verbraucherpreise gegenüber dem Vorjahr gestiegen sind – auf Basis eines Warenkorbs typischer Ausgaben (Miete, Lebensmittel, Energie, Dienstleistungen). 2 % gelten in der Eurozone als Zielwert für stabile Preise."
      />

      <Kennzahl
        titel={`Arbeitslosigkeit ${arbeitYear}`}
        wert={`${new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1 }).format(arbeitslosenquoteProzent)} %`}
        sub={`${n(W.arbeitslose)} Menschen · ${W.arbeitsloseChange} · ${W.arbeitNote}`}
        erklaerung="Als arbeitslos zählt, wer bei der Bundesagentur für Arbeit gemeldet, ohne Job und dem Arbeitsmarkt sofort verfügbar ist. Die Quote setzt das ins Verhältnis zu allen Erwerbspersonen. Nicht enthalten sind z. B. Menschen in Weiterbildung oder kurzfristig kranke Arbeitslose (sie zählen zur „Unterbeschäftigung“, die höher liegt)."
      />

      <SourceLine sources={W.sources} />

    </div>
  );
}
