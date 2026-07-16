export interface BarItem {
  label: string;
  value: number;
  color: string;
  note?: string;
}

// Horizontales Balkendiagramm (div-basiert, responsiv, barrierefrei).
export function BarChart({
  items,
  max,
  unit = "",
  fractionDigits = 1,
}: {
  items: BarItem[];
  max?: number;
  unit?: string;
  fractionDigits?: number;
}) {
  const maxVal = max ?? Math.max(...items.map((i) => i.value), 1);
  const fmt = (v: number) =>
    new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(v);

  return (
    <ul className="flex flex-col gap-3">
      {items.map((it, i) => (
        <li key={it.label} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="font-medium">{it.label}</span>
            <span className="bm-mono text-xs" style={{ color: "var(--bm-text-muted)" }}>
              {fmt(it.value)}
              {unit}
              {it.note ? ` · ${it.note}` : ""}
            </span>
          </div>
          <div
            className="h-2.5 w-full overflow-hidden rounded-full"
            style={{ background: "var(--bm-surface-2)" }}
            role="img"
            aria-label={`${it.label}: ${fmt(it.value)}${unit}`}
          >
            <div
              className="bm-grow h-full rounded-full"
              style={{
                width: `${Math.max(1.5, (it.value / maxVal) * 100)}%`,
                background: it.color,
                boxShadow: "var(--bm-glow)",
                animationDelay: `${i * 70}ms`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
