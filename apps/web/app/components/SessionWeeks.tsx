"use client";

import { useEffect, useState } from "react";
import { useLang } from "./LangProvider";
import { BUNDESTAG_SESSIONS_2026, SITZUNGEN_SOURCE } from "@/lib/kennzahlen";

function fmt(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "long" }).format(new Date(iso));
}

export function SessionWeeks() {
  const { t } = useLang();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
  }, []);

  if (now === null) return null;

  const upcoming = BUNDESTAG_SESSIONS_2026.filter(
    (s) => new Date(s.end).getTime() + 86_400_000 > now,
  );

  return (
    <section className="bm-card p-5">
      <h2 className="text-sm font-semibold">{t("sitzung.titel")}</h2>
      {upcoming.length === 0 ? (
        <p className="mt-2 text-xs" style={{ color: "var(--bm-text-muted)" }}>
          {t("sitzung.keine")}
        </p>
      ) : (
        <ul className="mt-3 flex flex-col">
          {/* Ruhige Tabelle: von linksbuendig, Trennstrich zentriert, bis rechtsbuendig. */}
          {upcoming.map((s, i) => (
            <li
              key={s.start}
              className="bm-mono grid items-baseline py-1.5 text-[0.8rem]"
              style={{
                gridTemplateColumns: "1fr auto 1fr",
                borderTop: i > 0 ? "1px solid var(--bm-border)" : undefined,
              }}
            >
              <span className="text-left">{fmt(s.start)}</span>
              <span className="px-3 text-center" style={{ color: "var(--bm-text-muted)" }}>
                –
              </span>
              <span className="text-right">{fmt(s.end)}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs" style={{ color: "var(--bm-text-muted)" }}>
        {t("ui.quelle")}:{" "}
        <a className="bm-link" href={SITZUNGEN_SOURCE.url} rel="noopener noreferrer" target="_blank">
          {SITZUNGEN_SOURCE.label}
        </a>
        . {t("sitzung.hinweis")}
      </p>
    </section>
  );
}
