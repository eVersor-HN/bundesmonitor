import Link from "next/link";
import { HAUSHALT_2026 } from "@/lib/kennzahlen";

// Geldfluss des Bundeshaushalts: woher das Geld kommt (Einnahmen) und wohin
// es geht (groesste Ausgabenbloecke). Jede Zeile ist klickbar und fuehrt zum
// passenden Detail-Abschnitt. Alle Betraege amtlich belegt.

function fmt(v: number): string {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(v);
}

// Ziel-Detailseite je Posten.
const HREFS: Record<string, string> = {
  Steuereinnahmen: "/geld/steuern",
  "Neue Schulden (Kredite)": "/geld/neue-schulden",
  "Übrige Einnahmen": "/geld/einnahmen",
  "Arbeit & Soziales": "/geld/ressort/11",
  Verteidigung: "/geld/ressort/14",
  "Zinsen (Bundesschuld)": "/geld/ressort/32",
  Verkehr: "/geld/ressort/12",
  "Übrige Ressorts": "/geld/ressorts",
};

function FlowGroup({
  heading,
  items,
  color,
  fallbackHref,
  startDelay = 0,
}: {
  heading: string;
  items: { label: string; value: number }[];
  color: string;
  fallbackHref: string;
  startDelay?: number;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <span className="bm-sect">{heading}</span>
      <ul className="flex flex-col gap-1">
        {items.map((it, i) => (
          <li key={it.label}>
            <Link
              href={HREFS[it.label] ?? fallbackHref}
              className="flex flex-col gap-1 rounded-lg p-1.5 transition-colors hover:bg-[color-mix(in_srgb,var(--bm-accent)_8%,transparent)]"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[0.72rem]">{it.label}</span>
                <span className="shrink-0 whitespace-nowrap">
                  <span className="bm-mono text-[0.72rem] font-semibold" style={{ color }}>
                    {fmt(it.value)}
                  </span>
                  <span aria-hidden="true" className="ml-1 text-[0.66rem]" style={{ color: "var(--bm-text-muted)" }}>
                    ›
                  </span>
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full"
                style={{ background: "var(--bm-surface-2)" }}
              >
                <div
                  className="bm-grow h-full rounded-full"
                  style={{
                    width: `${(it.value / max) * 100}%`,
                    background: color,
                    animationDelay: `${startDelay + i * 90}ms`,
                  }}
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MoneyFlow() {
  const h = HAUSHALT_2026;
  return (
    <section className="bm-card p-4">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[0.82rem] font-semibold">Woher das Geld kommt – wohin es geht</h2>
        <span className="bm-mono text-[0.68rem]" style={{ color: "var(--bm-text-muted)" }}>
          Haushalt {h.year} · {fmt(h.ausgaben)} Mrd €
        </span>
      </div>
      <p className="bm-sub mb-4">
        Beschlossener Bundeshaushalt, Beträge in Milliarden Euro. Soll-Werte – nicht
        gleichzusetzen mit tatsächlich ausgezahltem Geld. Zeile antippen für Details.
      </p>

      <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
        <FlowGroup
          heading="Einnahmen"
          items={h.einnahmen}
          color="var(--bm-status-healthy)"
          fallbackHref="/geld/einnahmen"
        />
        <FlowGroup
          heading="Ausgaben"
          items={h.ausgabenBloecke}
          color="var(--bm-accent)"
          fallbackHref="/geld/ressorts"
          startDelay={250}
        />
      </div>

      <p className="mt-4 text-[0.68rem]" style={{ color: "var(--bm-text-muted)" }}>
        Quelle:{" "}
        <a className="bm-link" href={h.source.url} rel="noopener noreferrer" target="_blank">
          {h.source.label}
        </a>{" "}
        · {h.source.asOf} · Details je Einzelplan:{" "}
        <a className="bm-link" href={h.detailUrl} rel="noopener noreferrer" target="_blank">
          bundeshaushalt.de
        </a>
      </p>
    </section>
  );
}
