"use client";

import { useEffect, useState } from "react";
import { fetchHealth, fetchSources } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { SourceStatus } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  healthy: "aktuell",
  degraded: "eingeschränkt",
  down: "ausgefallen",
  unknown: "unbekannt",
};

function statusColor(status: string): string {
  if (status === "healthy") return "var(--bm-status-healthy)";
  if (status === "degraded") return "var(--bm-status-degraded)";
  if (status === "down") return "var(--bm-status-down)";
  return "var(--bm-status-unknown)";
}

function StatusDot({ status }: { status: string }) {
  const color = statusColor(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.66rem] font-medium"
      style={{ color, border: `1px solid ${color}` }}
    >
      <span
        aria-hidden="true"
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: color }}
      />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export default function StatusPage() {
  const [reachable, setReachable] = useState(false);
  const [sources, setSources] = useState<SourceStatus[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      const ready = await fetchHealth("/health/ready");
      const srcs = await fetchSources();
      if (!active) return;
      setReachable(ready.reachable);
      setSources(srcs);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="bm-h1">Quellenstatus</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--bm-text-muted)" }}>
          Woher die App ihre Daten bezieht und ob der Abruf funktioniert. Interne
          Fehlermeldungen werden hier bewusst nicht angezeigt.
        </p>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--bm-text-muted)" }}>
          Lädt…
        </p>
      ) : (
        <>
          <section
            className="flex items-center justify-between gap-3 rounded-lg border p-3.5"
            style={{ borderColor: "var(--bm-border)", background: "var(--bm-surface)" }}
          >
            <div>
              <p className="text-sm font-medium">DIP-Verbindung</p>
              <p className="text-xs" style={{ color: "var(--bm-text-muted)" }}>
                {reachable ? "Direktabruf funktioniert" : "aktuell nicht erreichbar"}
              </p>
            </div>
            <StatusDot status={reachable ? "healthy" : "down"} />
          </section>

          {sources === null || sources.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--bm-text-muted)" }}>
              Keine Quellen erfasst.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {sources.map((s) => (
                <li
                  key={s.key}
                  className="flex flex-col gap-1.5 rounded-lg border p-3.5"
                  style={{ borderColor: "var(--bm-border)", background: "var(--bm-surface)" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{s.name}</p>
                    <StatusDot status={s.status} />
                  </div>
                  <p className="text-xs" style={{ color: "var(--bm-text-muted)" }}>
                    {s.last_success_at
                      ? `Letzter Abruf: ${formatDateTime(s.last_success_at)}`
                      : "Direktabruf bei Nutzung"}
                    {s.expected_frequency_seconds > 0
                      ? ` · erwartet alle ${Math.round(s.expected_frequency_seconds / 60)} min`
                      : ""}
                  </p>
                  {s.known_limitation && (
                    <p className="text-xs" style={{ color: "var(--bm-status-degraded)" }}>
                      {s.known_limitation}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
