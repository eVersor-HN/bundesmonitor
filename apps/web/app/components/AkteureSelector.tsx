"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchTopics } from "@/lib/api";
import type { TopicCount } from "@/lib/types";
import { toggleInParam } from "@/lib/urlfilter";

const PARTY_COLOR: Record<string, string> = {
  "CDU/CSU": "#5b6572",
  AfD: "#1e9de3",
  SPD: "#e3001a",
  Grüne: "#46962b",
  "Die Linke": "#be3075",
  BSW: "#7c3aed",
  FDP: "#d9a600",
};

export function AkteureSelector({ basePath = "/akteure" }: { basePath?: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [parties, setParties] = useState<TopicCount[]>([]);

  useEffect(() => {
    void fetchTopics("partei").then((t) => t && setParties(t));
  }, []);

  const active = sp.getAll("party");
  const max = Math.max(...parties.map((p) => p.matter_count), 1);

  function toggle(key: string) {
    const qs = toggleInParam(sp, "party", key);
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  if (parties.length === 0) {
    // Stabiler Platzhalter waehrend des Ladens (kein Aufpoppen der Balken).
    return (
      <section className="bm-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Vorgänge nach Initiative</h2>
        <ul className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <li
              key={i}
              className="h-6 rounded"
              style={{ background: "var(--bm-surface-2)", opacity: 0.5 }}
            />
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="bm-card p-4">
      <h2 className="mb-3 text-sm font-semibold">Vorgänge nach Initiative</h2>
      <ul className="flex flex-col gap-2">
        {parties.map((p) => {
          const on = active.includes(p.key);
          const color = PARTY_COLOR[p.label] ?? "var(--bm-accent)";
          return (
            <li key={p.key}>
              <button
                type="button"
                onClick={() => toggle(p.key)}
                aria-pressed={on}
                className="flex w-full flex-col gap-1 rounded-lg p-1 text-left transition-colors"
                style={{ background: on ? "color-mix(in srgb, var(--bm-accent) 12%, transparent)" : undefined }}
              >
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium" style={{ color: on ? "var(--bm-accent)" : "inherit" }}>
                    {p.label}
                  </span>
                  <span className="bm-mono text-xs" style={{ color: "var(--bm-text-muted)" }}>
                    {p.matter_count}
                  </span>
                </div>
                <div
                  className="h-2.5 w-full overflow-hidden rounded-full"
                  style={{ background: "var(--bm-surface-2)" }}
                >
                  <div
                    className="bm-grow h-full rounded-full"
                    style={{
                      width: `${Math.max(3, (p.matter_count / max) * 100)}%`,
                      background: color,
                      boxShadow: on ? "var(--bm-glow)" : undefined,
                    }}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
