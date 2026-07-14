import Link from "next/link";
import { PageHeader } from "@/app/components/PageHeader";
import { SourceLine } from "@/app/components/PostenListe";
import { T } from "@/app/components/LangProvider";
import { HAUSHALT, fmtEur, kurzLabel } from "@/lib/geld/haushaltsdaten";

// Alle 26 Einzelplaene des Bundeshaushalts, jeder klickbar -> eigene Seite.

export default function RessortsPage() {
  const max = Math.max(...HAUSHALT.einzelplaene.map((e) => e.value));
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={<T k="geld.alleRessorts" />}
        sub={
          <T
            k="ressorts.sub"
            vars={{
              year: HAUSHALT.meta.year,
              total: new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(
                HAUSHALT.total / 1e9,
              ),
            }}
          />
        }
      />

      <section className="bm-card p-3.5">
        <ul className="flex flex-col gap-1">
          {HAUSHALT.einzelplaene.map((e, i) => (
            <li key={e.nr}>
              <Link
                href={`/geld/ressort/${e.nr}`}
                className="flex flex-col gap-1 rounded-lg p-1.5 transition-colors hover:bg-[color-mix(in_srgb,var(--bm-accent)_8%,transparent)]"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="flex min-w-0 items-baseline gap-1.5">
                    <span className="bm-mono shrink-0 text-[0.62rem]" style={{ color: "var(--bm-text-muted)" }}>
                      {e.nr}
                    </span>
                    <span className="text-[0.78rem] leading-snug" style={{ overflowWrap: "break-word" }}>{kurzLabel(e.label)}</span>
                  </span>
                  <span className="shrink-0 whitespace-nowrap">
                    <span className="bm-mono text-[0.72rem] font-semibold" style={{ color: "var(--bm-accent)" }}>
                      {fmtEur(e.value)}
                    </span>
                    <span aria-hidden="true" className="ml-1 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
                      ›
                    </span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--bm-surface-2)" }}>
                  <div
                    className="bm-grow h-full rounded-full"
                    style={{
                      width: `${Math.max((e.value / max) * 100, 0.5)}%`,
                      background: "var(--bm-accent)",
                      animationDelay: `${Math.min(i * 45, 600)}ms`,
                    }}
                  />
                </div>
              </Link>
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

    </div>
  );
}
