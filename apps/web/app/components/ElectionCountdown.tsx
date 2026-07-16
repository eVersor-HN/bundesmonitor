"use client";

import { useEffect, useState } from "react";
import { useLang } from "./LangProvider";
import { UPCOMING_ELECTIONS, WAHLTERMINE_SOURCE } from "@/lib/kennzahlen";

// Kompaktes Datum (So., 06.09.2026) – bricht auf schmalen Displays nicht um.
function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

function Cell({ value, label }: { value: number; label: string }) {
  return (
    <div className="bm-card flex flex-col items-center px-2 py-2">
      <span
        className="bm-mono bm-glow-text text-xl font-bold tabular-nums"
        style={{ color: "var(--bm-accent)" }}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[0.62rem] uppercase tracking-wide" style={{ color: "var(--bm-text-muted)" }}>
        {label}
      </span>
    </div>
  );
}

export function ElectionCountdown() {
  const { t } = useLang();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (now === null) return null;

  const upcoming = UPCOMING_ELECTIONS.map((e) => ({ ...e, ts: new Date(e.date).getTime() }))
    .filter((e) => e.ts > now)
    .sort((a, b) => a.ts - b.ts);

  if (upcoming.length === 0) return null;

  const next = upcoming[0];
  const diff = next.ts - now;
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1000);

  return (
    <section className="flex flex-col gap-3">
      <div
        className="bm-card bm-card--roomy relative overflow-hidden"
        style={{ borderColor: "color-mix(in srgb, var(--bm-accent) 40%, var(--bm-border))" }}
      >
        <div className="relative flex flex-col gap-3">
          <span className="bm-chip w-fit" style={{ color: "var(--bm-accent)" }}>
            <span className="bm-mono tracking-wide">{t("wahl.chip")}</span>
          </span>
          <div>
            {/* Ort als Hauptzeile, Wahlart + Datum kompakt darunter – kein hässlicher Umbruch. */}
            <h2 className="text-base font-semibold leading-snug" style={{ textWrap: "balance" }}>
              {next.location}
            </h2>
            <p className="text-xs" style={{ color: "var(--bm-text-muted)" }}>
              {next.name} · <span className="bm-mono">{fmtDate(next.date)}</span>
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Cell value={days} label={t("wahl.tage")} />
            <Cell value={hours} label={t("wahl.std")} />
            <Cell value={mins} label={t("wahl.min")} />
            <Cell value={secs} label={t("wahl.sek")} />
          </div>
        </div>
      </div>

      {upcoming.length > 1 && (
        <ul className="flex flex-col gap-2">
          {upcoming.slice(1).map((e) => (
            <li
              key={`${e.date}-${e.location}`}
              className="bm-card flex items-center justify-between gap-3"
            >
              {/* Links Ort + Wahlart gestapelt, rechts kompaktes Datum ohne Umbruch. */}
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[0.82rem] font-medium">{e.location}</span>
                <span className="text-[0.66rem]" style={{ color: "var(--bm-text-muted)" }}>
                  {e.name}
                </span>
              </span>
              <span
                className="bm-mono shrink-0 whitespace-nowrap text-[0.7rem]"
                style={{ color: "var(--bm-text-muted)" }}
              >
                {fmtDate(e.date)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs" style={{ color: "var(--bm-text-muted)" }}>
        {t("ui.quelle")}:{" "}
        <a className="bm-link" href={WAHLTERMINE_SOURCE.url} rel="noopener noreferrer" target="_blank">
          {WAHLTERMINE_SOURCE.label}
        </a>
      </p>
    </section>
  );
}
