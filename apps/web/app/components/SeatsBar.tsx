import Link from "next/link";
import { ELECTION_2025 } from "@/lib/kennzahlen";

// Sitzverteilung im Bundestag als kompakte gestapelte Leiste – ganz oben im
// Dashboard. Amtliche Zahlen der Bundeswahlleiterin (Wahl 2025). Tippen führt
// zu den Abgeordneten nach Fraktion.
export function SeatsBar() {
  const seated = ELECTION_2025.parties.filter((p) => p.seats > 0);
  const total = ELECTION_2025.totalSeats;

  return (
    <Link href="/akteure/parteien" className="bm-card bm-card--hover block p-3.5">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="bm-tile__lab">Sitze im Bundestag</span>
        <span className="text-[0.66rem]" style={{ color: "var(--bm-text-muted)" }}>
          {total} Sitze · Wahl 2025 →
        </span>
      </div>
      <div
        className="flex h-4 w-full overflow-hidden rounded-full"
        style={{ gap: "1px" }}
        role="img"
        aria-label={`Sitzverteilung: ${seated.map((p) => `${p.name} ${p.seats}`).join(", ")}`}
      >
        {seated.map((p) => (
          <div
            key={p.name}
            style={{ width: `${(p.seats / total) * 100}%`, minWidth: "3px", background: p.color }}
            title={`${p.name}: ${p.seats}`}
          />
        ))}
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
        {seated.map((p) => (
          <li key={p.name} className="flex items-center gap-1.5 whitespace-nowrap text-[0.72rem]">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: p.color }}
            />
            <span>{p.name}</span>
            <span className="bm-mono font-semibold">{p.seats}</span>
          </li>
        ))}
      </ul>
    </Link>
  );
}
