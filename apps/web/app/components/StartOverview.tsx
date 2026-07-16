import Link from "next/link";
import { HAUSHALT, fmtEur, kurzLabel } from "@/lib/geld/haushaltsdaten";
import { KRIMINALITAET } from "@/lib/statistik";

// Verdichteter Start-Ueberblick: die zwei Fragen "wohin fliesst das Geld?" und
// "welche Kriminalitaet ist wie hoch?" sofort als rangierte Mini-Balken - ohne
// erst in die Detailseiten zu tippen. Alle Zahlen amtlich (Bundeshaushalt / PKS),
// Quellen auf den verlinkten Detailseiten.

interface BarRow {
  label: string;
  value: number;
  valueLabel: string;
  meta?: string;
  href: string;
}

function BarList({ title, sub, rows, href }: { title: string; sub: string; rows: BarRow[]; href: string }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <section className="bm-card bm-hud relative min-w-0">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="min-w-0 truncate text-[0.82rem] font-semibold">{title}</h2>
        <Link href={href} className="bm-link shrink-0 text-[0.72rem]">
          alle →
        </Link>
      </div>
      <p className="bm-sub mb-3 -mt-2">{sub}</p>
      <ul className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <li key={r.label}>
            <Link href={r.href} className="group block">
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate text-[0.8rem]">{r.label}</span>
                <span className="bm-mono shrink-0 text-[0.8rem] font-semibold" style={{ color: "var(--bm-accent)" }}>
                  {r.valueLabel}
                </span>
              </div>
              <div
                className="mt-1 h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: "var(--bm-surface-2)" }}
              >
                <div
                  className="h-full rounded-full transition-[width]"
                  style={{ width: `${Math.max(3, (r.value / max) * 100)}%`, background: "var(--bm-accent)" }}
                />
              </div>
              {r.meta && (
                <span className="text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
                  {r.meta}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StartOverview() {
  const topRessorts: BarRow[] = [...HAUSHALT.einzelplaene]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((e) => ({
      label: kurzLabel(e.label),
      value: e.value,
      valueLabel: fmtEur(e.value),
      href: `/geld/ressort/${e.nr}`,
    }));

  const topDelikte: BarRow[] = KRIMINALITAET.obergruppen
    .filter((d): d is typeof d & { value: number } => typeof d.value === "number")
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((d) => ({
      label: d.label,
      value: d.value,
      valueLabel: new Intl.NumberFormat("de-DE").format(d.value),
      meta: `${Math.round((d.value / KRIMINALITAET.gesamt) * 100)} % aller Fälle`,
      href: "/zahlen/kriminalitaet",
    }));

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <BarList
        title="Wohin fließt das Geld?"
        sub={`Größte Ressorts im Bundeshaushalt ${HAUSHALT.meta.year}`}
        rows={topRessorts}
        href="/geld/ressorts"
      />
      <BarList
        title="Größte Deliktbereiche"
        sub={`Polizeiliche Kriminalstatistik ${KRIMINALITAET.year}`}
        rows={topDelikte}
        href="/zahlen/kriminalitaet"
      />
    </div>
  );
}
