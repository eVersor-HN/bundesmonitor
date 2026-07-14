export interface PlanIstItem {
  label: string;
  soll: number;
  ist: number;
}

function fmt(v: number): string {
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v);
}

// Vergleich Plan (Soll) gegen Ist – je zwei Balken, ohne Wertung.
export function PlanIstChart({ items, unit = "" }: { items: PlanIstItem[]; unit?: string }) {
  const max = Math.max(...items.flatMap((i) => [i.soll, i.ist]), 1);
  return (
    <ul className="flex flex-col gap-5">
      {items.map((it) => {
        const diff = it.ist - it.soll;
        return (
          <li key={it.label} className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{it.label}</span>
            <Bar label="Plan" value={it.soll} max={max} unit={unit} color="var(--bm-text-muted)" />
            <Bar label="Ist" value={it.ist} max={max} unit={unit} color="var(--bm-accent)" />
            <span className="bm-mono text-xs" style={{ color: "var(--bm-text-muted)" }}>
              Abweichung: {diff >= 0 ? "+" : ""}
              {fmt(diff)}
              {unit}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function Bar({
  label,
  value,
  max,
  unit,
  color,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
        {label}
      </span>
      <div
        className="h-3 flex-1 overflow-hidden rounded-full"
        style={{ background: "var(--bm-surface-2)" }}
      >
        <div className="bm-grow h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
      <span className="bm-mono w-20 text-right text-xs">
        {fmt(value)}
        {unit}
      </span>
    </div>
  );
}
