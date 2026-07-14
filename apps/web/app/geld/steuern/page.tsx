"use client";

import { Begriff } from "@/app/components/Begriff";
import { useLive } from "@/app/components/KennzahlenProvider";
import { T } from "@/app/components/LangProvider";
import { PageHeader } from "@/app/components/PageHeader";
import { PostenListe, SourceLine } from "@/app/components/PostenListe";
import { STEUERN_2025 } from "@/lib/steuern";

// Steuern: welche gibt es, wie viel bringen sie, wer bekommt das Geld.
// Steuerarten mit eigener Detailseite sind verlinkt (›).

export default function SteuernPage() {
  const live = useLive();
  const year = live?.steuernYear ?? STEUERN_2025.year;
  const total = live?.steuernGesamtMrd ?? STEUERN_2025.total;
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={<T k="geld.steuern" />}
        sub={<T k="steuern.sub" vars={{ year, total: new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(total), delta: STEUERN_2025.totalDelta }} />}
      />

      <section className="bm-card p-3.5">
        <h2 className="mb-3 text-[0.82rem] font-semibold"><T k="steuern.groesste" /></h2>
        <PostenListe
          items={STEUERN_2025.arten}
          color="var(--bm-accent-2)"
          hrefs={{
            Energiesteuer: "/geld/steuer/energiesteuer",
            "Übrige Steuerarten": "/geld/steuer/uebrige",
          }}
        />
        <SourceLine sources={[STEUERN_2025.source]} />
      </section>

      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-[0.82rem] font-semibold"><T k="steuern.werBekommt" /></h2>
        <p className="bm-sub mb-3">
          Viele Steuern sind <Begriff k="gemeinschaftsteuern">Gemeinschaftsteuern</Begriff> und
          werden nach festen Schlüsseln verteilt:
        </p>
        <PostenListe items={STEUERN_2025.verteilung} color="var(--bm-status-healthy)" />
        <SourceLine sources={[STEUERN_2025.source]} />
      </section>

      <section className="bm-card p-3.5">
        <h2 className="mb-2 text-[0.82rem] font-semibold"><T k="steuern.werErhebt" /></h2>
        <ul className="flex flex-col gap-2">
          {STEUERN_2025.kategorien.map((k) => (
            <li key={k.label} className="rounded-lg p-2.5" style={{ background: "var(--bm-surface-2)" }}>
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <span className="text-[0.76rem] font-semibold">{k.label}</span>
                {k.anteil && (
                  <span className="bm-mono text-[0.66rem]" style={{ color: "var(--bm-accent-2)" }}>
                    {k.anteil}
                  </span>
                )}
              </div>
              <p className="text-[0.68rem]" style={{ color: "var(--bm-text-muted)" }}>
                {k.wer} · z. B. {k.beispiele}
              </p>
            </li>
          ))}
        </ul>
        <SourceLine
          sources={[STEUERN_2025.source]}
          note="Der Bund plant davon 387,2 Mrd € als Soll im Haushalt 2026"
        />
      </section>

    </div>
  );
}
