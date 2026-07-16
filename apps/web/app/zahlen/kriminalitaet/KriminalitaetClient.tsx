"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import { SourceLine } from "@/app/components/PostenListe";
import { DeliktBreakdown } from "@/app/components/DeliktBreakdown";
import { TatverdaechtigeSplit } from "@/app/components/TatverdaechtigeSplit";
import { T } from "@/app/components/LangProvider";
import { KRIMINALITAET } from "@/lib/statistik";
import { fetchLiveKriminalitaet, mergeKriminalitaet } from "@/lib/liveStats";

// Kriminalitaet im Detail (PKS). Startet mit den eingebauten Werten (sofort,
// offline-sicher) und ersetzt sie nach dem Laden durch die jaehrlich per Action
// aktualisierte stats.json aus dem Gist. Neutral: Zahlen und methodische
// Einordnung, keine Wertung; sensible Bereiche mit den noetigen Hinweisen.

function n(v: number): string {
  return new Intl.NumberFormat("de-DE").format(v);
}

export function KriminalitaetClient() {
  const [K, setK] = useState(KRIMINALITAET);

  useEffect(() => {
    let alive = true;
    void fetchLiveKriminalitaet().then((live) => {
      if (alive && live) setK((base) => mergeKriminalitaet(base, live));
    });
    return () => {
      alive = false;
    };
  }, []);

  const tv = K.tatverdaechtige;
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={<T k="zahlen.kriminalitaet" />}
        sub={`Polizeiliche Kriminalstatistik ${K.year}. Sie zählt der Polizei bekannt gewordene Fälle und Tatverdächtige – keine Verurteilungen.`}
      />

      {/* Kopf: Gesamt + Aufklaerung */}
      <section className="bm-card">
        <div className="grid grid-cols-3 items-baseline gap-2">
          <div>
            <div className="bm-tile__lab">Erfasste Straftaten {K.year}</div>
            <div className="bm-mono text-lg font-bold" style={{ color: "var(--bm-accent)" }}>
              {n(K.gesamt)}
            </div>
          </div>
          <div>
            <div className="bm-tile__lab">ggü. {K.prevYear}</div>
            <div className="bm-mono text-sm font-semibold">{K.gesamtChange}</div>
          </div>
          <div>
            <div className="bm-tile__lab">Aufklärungsquote</div>
            <div className="bm-mono text-sm font-semibold" style={{ color: "var(--bm-status-healthy)" }}>
              {new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(K.aufklaerungProzent)}&nbsp;%
            </div>
          </div>
        </div>
        <p className="mt-3 rounded-lg p-2.5 text-[0.72rem] leading-relaxed" style={{ background: "var(--bm-surface-2)" }}>
          {K.cannabisNote}
        </p>
      </section>

      {/* Vollstaendige Aufteilung auf die sieben amtlichen Obergruppen */}
      <section className="flex flex-col gap-2">
        <div>
          <h2 className="text-[0.82rem] font-semibold">So verteilen sich alle {n(K.gesamt)} Fälle</h2>
          <p className="bm-sub mt-0.5">{K.obergruppenNote}</p>
        </div>
        <DeliktBreakdown groups={K.obergruppen} />
      </section>

      {/* Gewalt / Messer */}
      <section className="bm-card">
        <h2 className="mb-1 text-[0.82rem] font-semibold">Gewalt &amp; Messerangriffe</h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <div className="bm-tile__lab">Gewaltkriminalität</div>
            <div className="bm-mono text-lg font-bold" style={{ color: "var(--bm-accent)" }}>
              {n(K.gewaltkriminalitaet)}
            </div>
            {K.gewaltNote && (
              <div className="text-[0.66rem]" style={{ color: "var(--bm-text-muted)" }}>
                {K.gewaltNote}
              </div>
            )}
          </div>
          <div>
            <div className="bm-tile__lab">davon mit Messerangriff</div>
            <div className="bm-mono text-lg font-bold" style={{ color: "var(--bm-accent)" }}>
              {n(K.messerangriffe)}
            </div>
            {K.messerMerkmalNote && (
              <div className="text-[0.66rem]" style={{ color: "var(--bm-text-muted)" }}>
                {K.messerMerkmalNote}
              </div>
            )}
          </div>
        </div>
        <p className="mt-3 text-[0.72rem] leading-relaxed" style={{ color: "var(--bm-text-muted)" }}>
          {K.messerNote}
        </p>
      </section>

      {/* Tatverdaechtige – mit Einordnung */}
      <section className="bm-card">
        <h2 className="mb-1 text-[0.82rem] font-semibold">Tatverdächtige</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg p-2.5" style={{ background: "var(--bm-surface-2)" }}>
            <div className="bm-tile__lab">deutsch</div>
            <div className="bm-mono text-base font-bold">{n(tv.deutsch)}</div>
            <div className="text-[0.64rem]" style={{ color: "var(--bm-text-muted)" }}>
              {tv.deutschChange} · {n(tv.tvbzDeutsch)} je 100.000
            </div>
          </div>
          <div className="rounded-lg p-2.5" style={{ background: "var(--bm-surface-2)" }}>
            <div className="bm-tile__lab">
              nichtdeutsch · Anteil{" "}
              {new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(
                tv.anteilNichtdeutschProzent,
              )}{" "}
              %
            </div>
            <div className="bm-mono text-base font-bold">{n(tv.nichtdeutsch)}</div>
            <div className="text-[0.64rem]" style={{ color: "var(--bm-text-muted)" }}>
              {tv.nichtdeutschChange} · {n(tv.tvbzNichtdeutsch)} je 100.000
            </div>
          </div>
        </div>

        <TatverdaechtigeSplit
          deutsch={tv.deutsch}
          nichtdeutsch={tv.nichtdeutsch}
          nationalitaeten={tv.nichtdeutschNationalitaet}
          aufenthalt={tv.nichtdeutschAufenthalt}
        />

        <div
          className="mt-3 rounded-lg border p-3"
          style={{ borderColor: "color-mix(in srgb, var(--bm-accent) 40%, var(--bm-border))" }}
        >
          <div className="mb-1 text-[0.72rem] font-semibold" style={{ color: "var(--bm-accent)" }}>
            Wichtig für die Einordnung
          </div>
          <ul className="flex flex-col gap-1.5 text-[0.72rem] leading-relaxed">
            {tv.hinweise.map((h) => (
              <li key={h.slice(0, 24)} className="flex gap-1.5">
                <span aria-hidden="true" style={{ color: "var(--bm-accent)" }}>
                  ·
                </span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SourceLine sources={K.sources} />
    </div>
  );
}
