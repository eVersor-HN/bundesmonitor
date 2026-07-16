import type { StatPosten } from "@/lib/statistik";

// Balkenliste fuer Statistiken: absolute Zahl (falls belegt) + Veraenderung
// mit Richtungspfeil. Aufklappbare Erklaerung je Posten (ⓘ). Neutrale Farben:
// Richtung wird nicht bewertet, nur beschrieben (mehr/weniger als Vorjahr).

function fmt(v: number): string {
  return new Intl.NumberFormat("de-DE").format(v);
}

const ARROW = { up: "▲", down: "▼", flat: "▬" };

export function StatList({
  items,
  unit = "Fälle",
  footnote = true,
}: {
  items: StatPosten[];
  unit?: string;
  footnote?: boolean;
}) {
  const max = Math.max(...items.map((i) => i.value ?? 0), 1);
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((it, i) => (
        <li key={it.label}>
          <details className={it.hint ? "" : "pointer-events-none"}>
            <summary className="flex cursor-pointer list-none flex-col gap-1 rounded-lg p-1.5 transition-colors hover:bg-[color-mix(in_srgb,var(--bm-accent)_7%,transparent)]">
              <div className="flex items-baseline justify-between gap-2">
                <span className="flex min-w-0 items-baseline gap-1.5 text-[0.78rem]">
                  <span className="leading-snug">{it.label}</span>
                  {it.hint && (
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-[0.62rem]"
                      style={{ color: "var(--bm-accent)" }}
                    >
                      ⓘ
                    </span>
                  )}
                </span>
                <span className="flex shrink-0 items-baseline gap-2 whitespace-nowrap">
                  {it.value !== undefined && (
                    <span className="bm-mono text-[0.76rem] font-semibold">
                      {it.ca ? "≈ " : ""}
                      {fmt(it.value)}
                    </span>
                  )}
                  {it.change && (
                    <span
                      className="bm-mono text-[0.68rem]"
                      style={{ color: "var(--bm-text-muted)" }}
                    >
                      {it.dir ? `${ARROW[it.dir]} ` : ""}
                      {it.change}
                    </span>
                  )}
                </span>
              </div>
              {it.value !== undefined && (
                <div
                  className="h-1.5 overflow-hidden rounded-full"
                  style={{ background: "var(--bm-surface-2)" }}
                >
                  <div
                    className="bm-grow h-full rounded-full"
                    style={{
                      width: `${(it.value / max) * 100}%`,
                      background: it.rest ? "var(--bm-text-muted)" : "var(--bm-accent)",
                      animationDelay: `${i * 70}ms`,
                    }}
                  />
                </div>
              )}
            </summary>
            {it.hint && (
              <p className="px-1.5 pb-1 pt-0.5 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
                {it.hint}
              </p>
            )}
          </details>
        </li>
      ))}
      {footnote && (
        <li className="px-1.5 pt-1 text-[0.62rem]" style={{ color: "var(--bm-text-muted)" }}>
          Balkenlänge = absolute Zahl ({unit}); „–“ = amtlich nicht einzeln ausgewiesen.
        </li>
      )}
    </ul>
  );
}
