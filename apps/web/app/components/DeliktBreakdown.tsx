import type { Deliktgruppe } from "@/lib/statistik";
import { StatList } from "./StatList";

// Aufklappbare Aufteilung der Kriminalitaet: jede amtliche Obergruppe als Karte
// mit Anteilsbalken; antippen zeigt die wichtigsten Unterposten (Fallzahlen aus
// der BKA-Grundtabelle T01). Progressive Disclosure – kurze Uebersicht, Detail
// auf Wunsch. Neutrale Darstellung, keine Wertung.

function fmt(v: number): string {
  return new Intl.NumberFormat("de-DE").format(v);
}

export function DeliktBreakdown({ groups }: { groups: Deliktgruppe[] }) {
  const max = Math.max(...groups.map((g) => g.value), 1);
  return (
    <ul className="flex flex-col gap-2">
      {groups.map((g, i) => (
        <li key={g.label}>
          <details className="bm-card bm-card--flush overflow-hidden">
            <summary className="flex cursor-pointer list-none flex-col gap-1.5 p-3 transition-colors hover:bg-[color-mix(in_srgb,var(--bm-accent)_6%,transparent)]">
              <div className="flex items-baseline justify-between gap-2">
                <span className="flex min-w-0 items-baseline gap-1.5">
                  <span className="text-[0.82rem] font-semibold leading-snug">{g.label}</span>
                  <span aria-hidden="true" className="shrink-0 text-[0.62rem]" style={{ color: "var(--bm-accent)" }}>
                    ⌄
                  </span>
                </span>
                <span className="flex shrink-0 items-baseline gap-2 whitespace-nowrap">
                  <span className="bm-mono text-[0.84rem] font-bold" style={{ color: "var(--bm-accent)" }}>
                    {fmt(g.value)}
                  </span>
                  <span className="bm-mono text-[0.68rem]" style={{ color: "var(--bm-text-muted)" }}>
                    {g.share.toLocaleString("de-DE")}&nbsp;%
                  </span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--bm-surface-2)" }}>
                <div
                  className="bm-grow h-full rounded-full"
                  style={{
                    width: `${(g.value / max) * 100}%`,
                    background: "var(--bm-accent)",
                    animationDelay: `${i * 70}ms`,
                  }}
                />
              </div>
            </summary>
            <div className="border-t px-3 pb-3 pt-2" style={{ borderColor: "var(--bm-border)" }}>
              <p className="bm-sub mb-2 text-[0.68rem]">
                {g.vollstaendig
                  ? "Teilt sich (nahezu vollständig) auf in:"
                  : "Größte Delikte darunter – Auswahl, nicht die komplette Gruppe:"}
              </p>
              <StatList items={g.unterposten} unit="Fälle" footnote={false} />
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
