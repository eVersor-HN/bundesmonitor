import type { StatPosten } from "@/lib/statistik";
import { StatList } from "./StatList";

// Deutsch/Nichtdeutsch-Aufteilung der Tatverdaechtigen als neutraler Split-Balken
// (Stahlgrau vs. Akzent – keine wertenden Farben), plus aufklappbare
// Untergliederung der NICHTDEUTSCHEN nach Herkunft und Aufenthaltsstatus.
// Zahlen immer sichtbar, damit die Farbe nicht das einzige Signal ist (WCAG).

function fmt(v: number): string {
  return new Intl.NumberFormat("de-DE").format(v);
}

// Prozent mit einer Nachkommastelle (de-DE), damit die Split-Anteile mit den
// Kacheln oben (z. B. 41,8 %) uebereinstimmen.
function pct1(v: number): string {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(v);
}

export function TatverdaechtigeSplit({
  deutsch,
  nichtdeutsch,
  nationalitaeten,
  aufenthalt,
}: {
  deutsch: number;
  nichtdeutsch: number;
  nationalitaeten: StatPosten[];
  aufenthalt: StatPosten[];
}) {
  const total = deutsch + nichtdeutsch;
  const pDe = total > 0 ? (deutsch / total) * 100 : 0;
  const pNd = 100 - pDe;
  return (
    <div className="mt-3">
      <div className="bm-tile__lab mb-1.5">Nach Staatsangehörigkeit</div>
      <div className="flex h-5 overflow-hidden rounded-md border" style={{ borderColor: "var(--bm-border-strong)" }}>
        <div style={{ width: `${pDe}%`, background: "var(--bm-text-muted)" }} />
        <div style={{ width: `${pNd}%`, background: "var(--bm-accent)" }} />
      </div>
      <div className="mt-1.5 flex justify-between text-[0.68rem]">
        <span className="flex items-center gap-1.5" style={{ color: "var(--bm-text-muted)" }}>
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "var(--bm-text-muted)" }} />
          deutsch · <span className="bm-mono">{fmt(deutsch)}</span> ({pct1(pDe)} %)
        </span>
        <span className="flex items-center gap-1.5" style={{ color: "var(--bm-text-muted)" }}>
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "var(--bm-accent)" }} />
          nichtdeutsch · <span className="bm-mono">{fmt(nichtdeutsch)}</span> ({pct1(pNd)} %)
        </span>
      </div>

      <details className="mt-2.5 rounded-lg" style={{ background: "var(--bm-surface-2)" }}>
        <summary className="cursor-pointer list-none p-2.5 text-[0.75rem] font-semibold">
          Nichtdeutsche nach Herkunft <span aria-hidden="true" style={{ color: "var(--bm-accent)" }}>›</span>
        </summary>
        <div className="px-2.5 pb-2.5">
          <StatList items={nationalitaeten} unit="Tatverdächtige" footnote={false} />
          <p className="mt-1.5 text-[0.66rem] leading-relaxed" style={{ color: "var(--bm-text-muted)" }}>
            Die zehn größten Gruppen der {fmt(nichtdeutsch)} nichtdeutschen Tatverdächtigen. Große Gruppen entsprechen
            vor allem großen und im Schnitt jüngeren Bevölkerungsgruppen – keine Aussage über die „Kriminalität“ einer
            Nationalität.
          </p>
        </div>
      </details>

      <details className="mt-2 rounded-lg" style={{ background: "var(--bm-surface-2)" }}>
        <summary className="cursor-pointer list-none p-2.5 text-[0.75rem] font-semibold">
          Nichtdeutsche nach Aufenthaltsstatus <span aria-hidden="true" style={{ color: "var(--bm-accent)" }}>›</span>
        </summary>
        <div className="px-2.5 pb-2.5">
          <StatList items={aufenthalt} unit="Tatverdächtige" footnote={false} />
        </div>
      </details>

      <p className="mt-2 text-[0.64rem] leading-relaxed" style={{ color: "var(--bm-text-muted)" }}>
        Deutsche Tatverdächtige lassen sich nicht nach Migrationshintergrund aufschlüsseln – die PKS erfasst nur die
        Staatsangehörigkeit.
      </p>
    </div>
  );
}
