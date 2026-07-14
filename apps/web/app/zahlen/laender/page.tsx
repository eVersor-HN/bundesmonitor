"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/components/PageHeader";
import { SourceLine } from "@/app/components/PostenListe";
import {
  LAENDER_DATEN,
  LAENDER_QUELLEN,
  LAENDER_HINWEIS,
  KRIMINALITAET_HINWEIS,
  type LandDaten,
} from "@/lib/laenderdaten";

// Uebersicht der 16 Bundeslaender: Einwohner, Landeshauptstadt, Regierung und
// Schuldenstand. Neutrale Darstellung, jede Zahl amtlich belegt (Quellen unten).
// Sortierbar; aufklappbare Karte je Land fuer Details.

const nf = new Intl.NumberFormat("de-DE");
const euroNf = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function mrd(eur: number): string {
  return `${new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(eur / 1e9)} Mrd €`;
}

type SortKey = "name" | "einwohner" | "schulden" | "proKopf" | "kriminalitaet";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "einwohner", label: "Einwohner" },
  { key: "schulden", label: "Schulden" },
  { key: "proKopf", label: "Schulden/Kopf" },
  { key: "kriminalitaet", label: "Kriminalität je 100.000" },
  { key: "name", label: "Name" },
];

function sortValue(l: LandDaten, key: SortKey): number | string {
  switch (key) {
    case "einwohner":
      return l.einwohner ?? -1;
    case "schulden":
      return l.schuldenEur ?? -1;
    case "proKopf":
      return l.schuldenJeEinwohnerEur ?? -1;
    case "kriminalitaet":
      return l.haeufigkeitszahl ?? -1;
    case "name":
      return l.name;
  }
}

export default function LaenderPage() {
  const [sort, setSort] = useState<SortKey>("einwohner");

  const sorted = useMemo(() => {
    const arr = [...LAENDER_DATEN];
    arr.sort((a, b) => {
      const va = sortValue(a, sort);
      const vb = sortValue(b, sort);
      if (typeof va === "string" || typeof vb === "string") {
        return String(va).localeCompare(String(vb), "de");
      }
      return vb - va; // Zahlen absteigend
    });
    return arr;
  }, [sort]);

  // Balkenreferenz fuer das aktive Sortierkriterium (nur bei Zahlen).
  const maxMetric = useMemo(() => {
    if (sort === "name") return 0;
    return Math.max(...LAENDER_DATEN.map((l) => Number(sortValue(l, sort)) || 0), 1);
  }, [sort]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Die 16 Bundesländer"
        sub="Einwohner, Landeshauptstadt, Regierung und Schuldenstand je Land. Karte antippen für Details. Alle Zahlen amtlich belegt (Quellen unten)."
      />

      {/* Sortierung */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
          Sortieren:
        </span>
        {SORTS.map((s) => {
          const active = s.key === sort;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setSort(s.key)}
              aria-pressed={active}
              className="rounded-full px-2.5 py-1 text-[0.72rem] font-medium transition-colors"
              style={{
                background: active ? "var(--bm-accent)" : "var(--bm-surface-2)",
                color: active ? "#fff" : "var(--bm-text-muted)",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <section className="flex flex-col gap-1.5">
        {sorted.map((l, i) => {
          const metric = sort === "name" ? 0 : Number(sortValue(l, sort)) || 0;
          const barPct = maxMetric > 0 ? (metric / maxMetric) * 100 : 0;
          return (
            <div key={l.name} className="bm-card overflow-hidden">
              <details className="group">
                <summary className="flex cursor-pointer list-none flex-col gap-1.5 p-3 transition-colors hover:bg-[color-mix(in_srgb,var(--bm-accent)_6%,transparent)]">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="flex min-w-0 items-baseline gap-1.5">
                      <span className="min-w-0 truncate text-[0.9rem] font-semibold leading-snug">{l.name}</span>
                      <span className="shrink-0 text-[0.66rem]" style={{ color: "var(--bm-text-muted)" }}>
                        {l.stadtstaat ? "Stadtstaat" : l.hauptstadt}
                      </span>
                    </span>
                    <span className="shrink-0 whitespace-nowrap text-right">
                      {sort === "schulden" && l.schuldenEur !== undefined ? (
                        <span className="bm-mono text-[0.82rem] font-semibold" style={{ color: "var(--bm-accent)" }}>
                          {mrd(l.schuldenEur)}
                        </span>
                      ) : sort === "proKopf" && l.schuldenJeEinwohnerEur !== undefined ? (
                        <span className="bm-mono text-[0.82rem] font-semibold" style={{ color: "var(--bm-accent)" }}>
                          {euroNf.format(l.schuldenJeEinwohnerEur)}
                        </span>
                      ) : sort === "kriminalitaet" && l.haeufigkeitszahl !== undefined ? (
                        <span className="bm-mono text-[0.82rem] font-semibold" style={{ color: "var(--bm-accent)" }}>
                          {nf.format(l.haeufigkeitszahl)}
                          <span className="ml-1 text-[0.6rem] font-normal" style={{ color: "var(--bm-text-muted)" }}>
                            je 100.000
                          </span>
                        </span>
                      ) : l.einwohner !== undefined ? (
                        <span className="bm-mono text-[0.82rem] font-semibold" style={{ color: "var(--bm-accent)" }}>
                          {nf.format(l.einwohner)}
                          <span className="ml-1 text-[0.6rem] font-normal" style={{ color: "var(--bm-text-muted)" }}>
                            Einw.
                          </span>
                        </span>
                      ) : null}
                    </span>
                  </div>
                  {sort !== "name" && (
                    <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--bm-surface-2)" }}>
                      <div
                        className="bm-grow h-full rounded-full"
                        style={{
                          width: `${barPct}%`,
                          background: "var(--bm-accent)",
                          animationDelay: `${i * 45}ms`,
                        }}
                      />
                    </div>
                  )}
                </summary>

                {/* Detailtabelle */}
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-t px-3 py-3 text-[0.76rem]" style={{ borderColor: "var(--bm-surface-2)" }}>
                  <dt style={{ color: "var(--bm-text-muted)" }}>Landeshauptstadt</dt>
                  <dd className="text-right">{l.hauptstadt}</dd>

                  {l.einwohner !== undefined && (
                    <>
                      <dt style={{ color: "var(--bm-text-muted)" }}>Einwohner (31.12.2024)</dt>
                      <dd className="bm-mono text-right">{nf.format(l.einwohner)}</dd>
                    </>
                  )}

                  {l.regierungschef && (
                    <>
                      <dt style={{ color: "var(--bm-text-muted)" }}>{l.regierungschefAmt ?? "Regierungschef:in"}</dt>
                      <dd className="text-right">
                        {l.regierungschef}
                        {l.partei ? ` (${l.partei})` : ""}
                        {l.regierungSeit ? (
                          <span className="block text-[0.66rem]" style={{ color: "var(--bm-text-muted)" }}>
                            im Amt seit {l.regierungSeit}
                          </span>
                        ) : null}
                      </dd>
                    </>
                  )}

                  {l.koalition && (
                    <>
                      <dt style={{ color: "var(--bm-text-muted)" }}>Regierung</dt>
                      <dd className="text-right">{l.koalition}</dd>
                    </>
                  )}

                  {l.schuldenEur !== undefined && (
                    <>
                      <dt style={{ color: "var(--bm-text-muted)" }}>Schulden (31.12.2025)</dt>
                      <dd className="bm-mono text-right">{mrd(l.schuldenEur)}</dd>
                    </>
                  )}

                  {l.schuldenJeEinwohnerEur !== undefined && (
                    <>
                      <dt style={{ color: "var(--bm-text-muted)" }}>Schulden je Einwohner</dt>
                      <dd className="bm-mono text-right">{euroNf.format(l.schuldenJeEinwohnerEur)}</dd>
                    </>
                  )}

                  {l.haeufigkeitszahl !== undefined && (
                    <>
                      <dt style={{ color: "var(--bm-text-muted)" }}>Kriminalität je 100.000 (PKS 2024)</dt>
                      <dd className="bm-mono text-right">{nf.format(l.haeufigkeitszahl)}</dd>
                    </>
                  )}
                </dl>
              </details>
            </div>
          );
        })}
      </section>

      <SourceLine sources={LAENDER_QUELLEN} note={LAENDER_HINWEIS} />

      <p
        className="rounded-md p-2.5 text-[0.68rem] leading-relaxed"
        style={{ background: "var(--bm-surface-2)", color: "var(--bm-text-muted)" }}
      >
        {KRIMINALITAET_HINWEIS}
      </p>
    </div>
  );
}
