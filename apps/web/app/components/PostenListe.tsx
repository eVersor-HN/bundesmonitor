import Link from "next/link";
import type { HaushaltPosten } from "@/lib/haushalt";
import type { SourceRef } from "@/lib/kennzahlen";
import { safeExternalHref } from "@/lib/urls";

// Gemeinsame Bausteine der Geld-Detailseiten: proportionale Balkenlisten
// (optional verlinkt oder mit Info-Aufklapper) und die Quellenzeile unten.
// Klare Affordanzen: nur Zeilen mit "›" sind Links, nur Zeilen mit "ⓘ"
// lassen sich aufklappen – nichts anderes ist anklickbar.

function fmt(v: number): string {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: v !== 0 && Math.abs(v) < 1 ? 2 : 1,
    maximumFractionDigits: v !== 0 && Math.abs(v) < 1 ? 2 : 1,
  }).format(v);
}

function Zeile({
  it,
  max,
  color,
  delayMs,
  chevron = false,
}: {
  it: HaushaltPosten;
  max: number;
  color: string;
  delayMs: number;
  chevron?: boolean;
}) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <span className="flex min-w-0 items-baseline gap-1.5 text-[0.84rem]">
          <span className="leading-snug" style={{ overflowWrap: "break-word" }}>
            {it.label}
          </span>
          {!chevron && it.hint && (
            <span aria-hidden="true" className="shrink-0 text-[0.62rem]" style={{ color: "var(--bm-accent)" }}>
              ⓘ
            </span>
          )}
        </span>
        <span className="shrink-0 whitespace-nowrap">
          <span
            className="bm-mono text-[0.82rem] font-semibold"
            style={{ color: it.rest ? "var(--bm-text-muted)" : color }}
          >
            {it.ca ? "≈ " : ""}
            {it.value === 0 && it.rest ? "–" : fmt(it.value)}
            {it.value === 0 && it.rest ? "" : " Mrd €"}
          </span>
          {chevron && (
            <span aria-hidden="true" className="ml-1 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
              ›
            </span>
          )}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--bm-surface-2)" }}>
        <div
          className="bm-grow h-full rounded-full"
          style={{
            width: `${(Math.max(it.value, 0) / max) * 100}%`,
            background: it.rest ? "var(--bm-text-muted)" : color,
            opacity: it.rest ? 0.55 : 1,
            animationDelay: `${delayMs}ms`,
          }}
        />
      </div>
    </>
  );
}

export function PostenListe({
  items,
  color,
  hrefs,
}: {
  items: HaushaltPosten[];
  color: string;
  // optional: Ziel-Links je Posten-Label -> Zeile wird Link (mit ›)
  hrefs?: Record<string, string>;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((it, i) => {
        const href = hrefs?.[it.label];
        if (href) {
          return (
            <li key={it.label}>
              <Link
                href={href}
                className="flex flex-col gap-1 rounded-lg p-1.5 transition-colors hover:bg-[color-mix(in_srgb,var(--bm-accent)_8%,transparent)]"
              >
                <Zeile it={it} max={max} color={color} delayMs={i * 70} chevron />
              </Link>
              {it.hint && (
                <p className="px-1.5 pt-0.5 text-[0.68rem]" style={{ color: "var(--bm-text-muted)" }}>
                  {it.hint}
                </p>
              )}
            </li>
          );
        }
        if (it.hint) {
          return (
            <li key={it.label}>
              <details className="group">
                <summary className="flex cursor-pointer list-none flex-col gap-1 rounded-lg p-1.5 transition-colors hover:bg-[color-mix(in_srgb,var(--bm-accent)_7%,transparent)]">
                  <Zeile it={it} max={max} color={color} delayMs={i * 70} />
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
            <Zeile it={it} max={max} color={color} delayMs={i * 70} />
          </li>
        );
      })}
    </ul>
  );
}

// Quellenzeile: steht IMMER unten auf der Seite/Karte, nie in den Grafiken.
export function SourceLine({ sources, note }: { sources: SourceRef[]; note?: string }) {
  return (
    <p className="mt-3 text-[0.68rem]" style={{ color: "var(--bm-text-muted)" }}>
      {note ? `${note} · ` : ""}
      Quelle{sources.length > 1 ? "n" : ""}:{" "}
      {sources.map((s, i) => {
        const href = safeExternalHref(s.url);
        return (
          <span key={s.url}>
            {i > 0 && " · "}
            {href ? (
              <a className="bm-link" href={href} rel="noopener noreferrer" target="_blank">
                {s.label}
              </a>
            ) : (
              s.label
            )}{" "}
            ({s.asOf})
          </span>
        );
      })}
    </p>
  );
}
