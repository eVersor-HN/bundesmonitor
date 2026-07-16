"use client";

import { useEffect, useState } from "react";
import { useLang } from "./LangProvider";
import { BUNDESTAG_SESSIONS_2026, SITZUNGEN_SOURCE } from "@/lib/kennzahlen";

// Tag und Monat getrennt formatieren, damit die Zahlen in einer eigenen Spalte
// exakt untereinander stehen koennen (Monatsnamen sind unterschiedlich breit).
const dayFmt = new Intl.DateTimeFormat("de-DE", { day: "2-digit" });
const monthFmt = new Intl.DateTimeFormat("de-DE", { month: "long" });
const fmtDay = (iso: string) => dayFmt.format(new Date(iso));
const fmtMonth = (iso: string) => monthFmt.format(new Date(iso));

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
    <section className="bm-card bm-card--roomy">
      <h2 className="text-sm font-semibold">{t("sitzung.titel")}</h2>
      {upcoming.length === 0 ? (
        <p className="mt-2 text-xs" style={{ color: "var(--bm-text-muted)" }}>
          {t("sitzung.keine")}
        </p>
      ) : (
        // Ein einziges Grid ueber alle Zeilen (li = display:contents), damit die
        // Tag-Zahlen auf beiden Seiten exakt in einer Spalte fluchten: Tag
        // rechtsbuendig + tabular-nums, Monat linksbuendig, Strich mittig.
        <ul
          className="mt-3 bm-mono grid items-baseline text-[0.8rem] tabular-nums"
          style={{
            gridTemplateColumns: "max-content max-content max-content max-content max-content",
            justifyContent: "start",
          }}
        >
          {upcoming.map((s, i) => {
            const border = i > 0 ? "1px solid var(--bm-border)" : undefined;
            const muted = { color: "var(--bm-text-muted)" };
            return (
              <li key={s.start} className="contents">
                <span className="py-1.5 pr-1 text-right" style={{ borderTop: border }}>
                  {fmtDay(s.start)}.
                </span>
                <span className="py-1.5 pr-3 text-left" style={{ borderTop: border }}>
                  {fmtMonth(s.start)}
                </span>
                <span className="py-1.5 px-1 text-center" style={{ borderTop: border, ...muted }}>
                  –
                </span>
                <span className="py-1.5 pr-1 text-right" style={{ borderTop: border }}>
                  {fmtDay(s.end)}.
                </span>
                <span className="py-1.5 text-left" style={{ borderTop: border }}>
                  {fmtMonth(s.end)}
                </span>
              </li>
            );
          })}
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
