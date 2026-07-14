import { PageHeader } from "@/app/components/PageHeader";
import { SourceLine } from "@/app/components/PostenListe";
import { DIAETEN, type DiaetenPosten } from "@/lib/diaeten";

// Detailseite: Bezüge von Politiker:innen des Bundes. Neutral, ohne Wertung.
// Eigene Balkenliste in Euro/Monat (die geteilte PostenListe rechnet in Mrd €).

function euro(v: number): string {
  const nachkomma = v % 1 !== 0 ? 2 : 0;
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: nachkomma,
    maximumFractionDigits: 2,
  }).format(v);
}

// Proportionale Balkenliste in Euro pro Monat. Zeilen mit Hinweis (ⓘ) sind
// aufklappbar; nichts anderes ist anklickbar.
function BezuegeListe({ items, color }: { items: DiaetenPosten[]; color: string }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((it, i) => {
        const zeile = (
          <>
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex min-w-0 items-baseline gap-1.5 text-[0.78rem]">
                <span className="leading-snug" style={{ overflowWrap: "anywhere" }}>
                  {it.label}
                </span>
                {it.hint && (
                  <span aria-hidden="true" className="shrink-0 text-[0.62rem]" style={{ color: "var(--bm-accent)" }}>
                    ⓘ
                  </span>
                )}
              </span>
              <span className="shrink-0 whitespace-nowrap bm-mono text-[0.74rem] font-semibold" style={{ color }}>
                {it.ca ? "≈ " : ""}
                {euro(it.value)} €/Monat
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--bm-surface-2)" }}>
              <div
                className="bm-grow h-full rounded-full"
                style={{ width: `${(it.value / max) * 100}%`, background: color, animationDelay: `${i * 70}ms` }}
              />
            </div>
          </>
        );
        if (it.hint) {
          return (
            <li key={it.label}>
              <details className="group">
                <summary className="flex cursor-pointer list-none flex-col gap-1 rounded-lg p-1.5 transition-colors hover:bg-[color-mix(in_srgb,var(--bm-accent)_7%,transparent)]">
                  {zeile}
                </summary>
                <p className="px-1.5 pb-1 pt-0.5 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
                  {it.hint}
                </p>
              </details>
            </li>
          );
        }
        return (
          <li key={it.label} className="flex flex-col gap-1 p-1.5">
            {zeile}
          </li>
        );
      })}
    </ul>
  );
}

export default function DiaetenPage() {
  const d = DIAETEN;
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Bezüge im Bund"
        sub="Was Abgeordnete und Regierungsmitglieder des Bundes monatlich erhalten – belegt aus amtlichen Quellen. Zeile mit ⓘ antippen für Details. Beträge sind brutto vor Steuern, soweit nicht anders vermerkt."
      />

      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-sm font-semibold">Mitglieder des Bundestages (MdB)</h2>
        <p className="mb-3 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
          Die Mitarbeiterpauschale ist Budget für Büropersonal, kein persönliches Einkommen – der lange Balken zeigt
          also nicht das Gehalt des Abgeordneten.
        </p>
        <BezuegeListe items={d.abgeordnete} color="var(--bm-accent)" />
        <SourceLine sources={d.sourcesAbgeordnete} />
      </section>

      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-sm font-semibold">Amtsbezüge der Regierung</h2>
        <p className="mb-3 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
          Gesetzlich als Vielfaches des Grundgehalts der Besoldungsgruppe B 11 bemessen (Bundesministergesetz). Es wird
          keine amtliche Euro-Einzelaufstellung veröffentlicht; die Beträge sind daher gerundet (≈). Regierungsmitglieder,
          die zugleich Abgeordnete sind, erhalten zusätzlich die halbe Abgeordnetenentschädigung.
        </p>
        <BezuegeListe items={d.regierung} color="var(--bm-accent-2)" />
        <SourceLine sources={d.sourcesRegierung} />
      </section>

      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-sm font-semibold">Nach dem Mandat</h2>
        <p className="mb-3 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
          Diese Leistungen lassen sich nicht als fester Monatsbetrag darstellen – hier die gesetzliche Regel.
        </p>
        <ul className="flex flex-col gap-1.5">
          {d.leistungen.map((it) => (
            <li key={it.label}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-2 rounded-lg p-1.5 text-[0.78rem] transition-colors hover:bg-[color-mix(in_srgb,var(--bm-accent)_7%,transparent)]">
                  <span className="flex min-w-0 items-baseline gap-1.5">
                    <span className="leading-snug">{it.label}</span>
                    {it.hint && (
                      <span aria-hidden="true" className="shrink-0 text-[0.62rem]" style={{ color: "var(--bm-accent)" }}>
                        ⓘ
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-right text-[0.72rem] font-semibold" style={{ color: "var(--bm-accent-2)" }}>
                    {it.wert}
                  </span>
                </summary>
                {it.hint && (
                  <p className="px-1.5 pb-1 pt-0.5 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
                    {it.hint}
                  </p>
                )}
              </details>
            </li>
          ))}
        </ul>
        <SourceLine sources={d.sourcesLeistungen} />
      </section>

    </div>
  );
}
