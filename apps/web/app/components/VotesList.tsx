"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchVotes } from "@/lib/api";
import { safeExternalHref } from "@/lib/urls";
import type { RollCallVote, VoteFraktion } from "@/lib/types";
import { useLang } from "./LangProvider";

// Namentliche Abstimmungen: wer hat wie gestimmt – gesamt und je Fraktion.
// Bewusst ohne "angenommen/abgelehnt"-Interpretation: nur die amtlichen
// Zahlen (Mehrheitserfordernisse variieren je nach Vorlage).

const COLORS = {
  ja: "var(--bm-status-healthy)",
  nein: "var(--bm-status-down)",
  enthaltung: "var(--bm-text-muted)",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

function StackBar({ ja, nein, enthaltung }: { ja: number; nein: number; enthaltung: number }) {
  const total = Math.max(ja + nein + enthaltung, 1);
  return (
    <div
      className="h-2 overflow-hidden rounded-full"
      style={{ background: "var(--bm-surface-2)" }}
      aria-hidden="true"
    >
      {/* Ganzer gestapelter Balken laedt links->rechts auf. */}
      <div className="bm-grow flex h-full w-full">
        <span style={{ width: `${(ja / total) * 100}%`, background: COLORS.ja }} />
        <span style={{ width: `${(nein / total) * 100}%`, background: COLORS.nein }} />
        <span
          style={{ width: `${(enthaltung / total) * 100}%`, background: COLORS.enthaltung, opacity: 0.6 }}
        />
      </div>
    </div>
  );
}

function Zahlen({ v }: { v: { ja: number; nein: number; enthaltung: number } }) {
  const { t } = useLang();
  return (
    <span className="bm-mono flex shrink-0 gap-2 text-[0.68rem]">
      <span className="whitespace-nowrap" style={{ color: COLORS.ja }}>
        {v.ja}&nbsp;{t("votes.ja")}
      </span>
      <span className="whitespace-nowrap" style={{ color: COLORS.nein }}>
        {v.nein}&nbsp;{t("votes.nein")}
      </span>
      <span className="whitespace-nowrap" style={{ color: "var(--bm-text-muted)" }}>
        {v.enthaltung}&nbsp;{t("votes.enth")}
      </span>
    </span>
  );
}

function FraktionRow({ f }: { f: VoteFraktion }) {
  return (
    <li className="flex flex-col gap-1 py-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="min-w-0 truncate text-[0.72rem] font-medium">{f.fraktion}</span>
        <Zahlen v={f} />
      </div>
      <StackBar ja={f.ja} nein={f.nein} enthaltung={f.enthaltung} />
    </li>
  );
}

export function VotesList({
  matterSlug,
  limit = 10,
}: {
  matterSlug?: string;
  limit?: number;
}) {
  const { t } = useLang();
  const [votes, setVotes] = useState<RollCallVote[] | null>(null);

  useEffect(() => {
    void fetchVotes(limit, matterSlug).then(setVotes);
  }, [limit, matterSlug]);

  if (votes === null || votes.length === 0) {
    if (matterSlug) return null; // im Vorgangsdetail nichts anzeigen statt Leerbox
    return (
      <p className="bm-sub px-1">{votes === null ? t("ui.laedt") : t("votes.keine")}</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {votes.map((v) => {
        const tot = {
          ja: v.totals.ja ?? 0,
          nein: v.totals.nein ?? 0,
          enthaltung: v.totals.enthaltung ?? 0,
        };
        const xlsxHref = safeExternalHref(v.xlsx_url);
        return (
          <li key={v.id} className="bm-card">
            <details>
              <summary className="flex cursor-pointer list-none flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="bm-mono shrink-0 text-[0.64rem]" style={{ color: "var(--bm-text-muted)" }}>
                    {fmtDate(v.vote_date)}
                  </span>
                  <span
                    aria-hidden="true"
                    className="bm-chip shrink-0 whitespace-nowrap text-[0.66rem]"
                    style={{ color: "var(--bm-accent)", borderColor: "var(--bm-accent)" }}
                  >
                    {t("votes.jeFraktion")} ⓘ
                  </span>
                </div>
                <span className="text-[0.82rem] font-medium leading-snug">{v.title}</span>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <StackBar ja={tot.ja} nein={tot.nein} enthaltung={tot.enthaltung} />
                  </div>
                  <Zahlen v={tot} />
                </div>
              </summary>
              <ul className="mt-2 border-t pt-1" style={{ borderColor: "var(--bm-border)" }}>
                {v.by_fraktion.map((f) => (
                  <FraktionRow key={f.fraktion} f={f} />
                ))}
              </ul>
              <p className="mt-2 flex flex-wrap gap-3 text-[0.66rem]" style={{ color: "var(--bm-text-muted)" }}>
                {v.matter_slug && !matterSlug && (
                  <Link className="bm-link" href={`/vorgang?slug=${encodeURIComponent(v.matter_slug)}`}>
                    {t("votes.zumVorgang")}
                  </Link>
                )}
                {v.xlsx_url &&
                  (xlsxHref ? (
                    <a className="bm-link" href={xlsxHref} rel="noopener noreferrer" target="_blank">
                      {t("votes.einzelstimmen")}
                    </a>
                  ) : (
                    <span>{t("votes.einzelstimmen")}</span>
                  ))}
                <span>
                  {t("votes.meta", { s: v.sitzung, a: v.abstimm_nr })}
                </span>
              </p>
            </details>
          </li>
        );
      })}
    </ul>
  );
}
