"use client";

import { Begriff } from "@/app/components/Begriff";
import { useLive } from "@/app/components/KennzahlenProvider";
import { PageHeader } from "@/app/components/PageHeader";
import { RUNDFUNK } from "@/lib/rundfunk";

// Oeffentlich-rechtlicher Rundfunk: Finanzen und Struktur.
// Klar eingeordnet: Laendersache und beitragsfinanziert, nicht Bundeshaushalt.

function fmt(v: number): string {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: v < 1 ? 2 : 2,
    maximumFractionDigits: 2,
  }).format(v);
}

export default function RundfunkPage() {
  const live = useLive();
  const max = Math.max(...RUNDFUNK.verteilung.map((v) => v.value));
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Öffentlich-rechtlicher Rundfunk"
        sub={
          <>
            ARD, ZDF und Deutschlandradio sind Ländersache (per{" "}
            <Begriff k="staatsvertrag">Staatsvertrag</Begriff>) und werden über den{" "}
            <Begriff k="rundfunkbeitrag">Rundfunkbeitrag</Begriff> bezahlt – sie sind{" "}
            <b>nicht</b> Teil des Bundeshaushalts. Bundesmonitor zeigt die Zahlen als
            Kontext öffentlicher Finanzierung.
          </>
        }
      />

      {/* Beitrag + Ertraege */}
      <section className="bm-card p-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[0.82rem] font-semibold">Der Rundfunkbeitrag</h2>
          <span className="bm-mono text-base font-bold" style={{ color: "var(--bm-accent)" }}>
            {fmt(live?.rundfunkBeitragMonat ?? RUNDFUNK.beitragMonat)} €/Monat
          </span>
        </div>
        <p className="bm-sub mt-1">{RUNDFUNK.beitragNote}</p>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {RUNDFUNK.ertraege.map((e) => {
            // Nur der Ertrag des Live-Berichtsjahres wird ueberlagert, sonst gebundelt.
            const value = live?.rundfunkYear === e.year ? (live?.rundfunkErtraegeMrd ?? e.value) : e.value;
            return (
              <div key={e.year} className="rounded-lg p-2.5" style={{ background: "var(--bm-surface-2)" }}>
                <div className="bm-tile__lab">Erträge {e.year}</div>
                <div className="bm-mono mt-0.5 text-sm font-bold">{fmt(value)} Mrd €</div>
              </div>
            );
          })}
          <div className="rounded-lg p-2.5" style={{ background: "var(--bm-surface-2)" }}>
            <div className="bm-tile__lab">Beitragskonten</div>
            <div className="bm-mono mt-0.5 text-sm font-bold">
              {new Intl.NumberFormat("de-DE").format(RUNDFUNK.haushalte)}
            </div>
          </div>
        </div>
        <p className="mt-2 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
          {RUNDFUNK.befreite} · Einzug kostet {fmt(RUNDFUNK.einzugskostenMio)} Mio €/Jahr (
          {RUNDFUNK.einzugskostenNote}).
        </p>
      </section>

      {/* Wohin fliesst der Beitrag */}
      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-[0.82rem] font-semibold">Wohin fließt der Beitrag? (2024)</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {RUNDFUNK.verteilung.map((v, i) => (
            <li key={v.label} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="min-w-0 text-[0.76rem] leading-snug">{v.label}</span>
                <span
                  className="bm-mono shrink-0 text-[0.74rem] font-semibold"
                  style={{ color: v.rest ? "var(--bm-text-muted)" : "var(--bm-accent)" }}
                >
                  {v.ca ? "≈ " : ""}
                  {fmt(v.value)} Mrd €
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--bm-surface-2)" }}>
                <div
                  className="bm-grow h-full rounded-full"
                  style={{
                    width: `${(v.value / max) * 100}%`,
                    background: v.rest ? "var(--bm-text-muted)" : "var(--bm-accent)",
                    opacity: v.rest ? 0.55 : 1,
                    animationDelay: `${i * 80}ms`,
                  }}
                />
              </div>
              {v.hint && (
                <span className="text-[0.64rem]" style={{ color: "var(--bm-text-muted)" }}>
                  {v.hint}
                </span>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
          Wofür die Anstalten es ausgeben: {RUNDFUNK.personalNote} Die Angemessenheit prüft die
          unabhängige <Begriff k="kef">KEF</Begriff>.
        </p>
      </section>

      {/* Gehaelter & Personal */}
      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-[0.82rem] font-semibold">
          Was verdienen die Chefinnen und Chefs?
        </h2>
        <p className="bm-sub mb-3">{RUNDFUNK.intendanten.note}</p>
        <ul className="flex flex-col gap-1.5">
          {(() => {
            const max = Math.max(...RUNDFUNK.intendanten.items.map((i) => i.value));
            return RUNDFUNK.intendanten.items.map((i, idx) => (
              <li key={i.label}>
                <details>
                  <summary className="flex cursor-pointer list-none flex-col gap-1 rounded-lg p-1.5 transition-colors hover:bg-[color-mix(in_srgb,var(--bm-accent)_7%,transparent)]">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="flex min-w-0 items-baseline gap-1.5 text-[0.78rem]">
                        <span className="leading-snug">{i.label}</span>
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-[0.62rem]"
                          style={{ color: "var(--bm-accent)" }}
                        >
                          ⓘ
                        </span>
                      </span>
                      <span
                        className="bm-mono shrink-0 whitespace-nowrap text-[0.74rem] font-semibold"
                        style={{ color: "var(--bm-accent)" }}
                      >
                        {new Intl.NumberFormat("de-DE").format(i.value)} €/Jahr
                      </span>
                    </div>
                    <div
                      className="h-1.5 overflow-hidden rounded-full"
                      style={{ background: "var(--bm-surface-2)" }}
                    >
                      <div
                        className="bm-grow h-full rounded-full"
                        style={{
                          width: `${(i.value / max) * 100}%`,
                          background: "var(--bm-accent)",
                          animationDelay: `${idx * 70}ms`,
                        }}
                      />
                    </div>
                  </summary>
                  <p className="px-1.5 pb-1 pt-0.5 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
                    {i.hint}
                  </p>
                </details>
              </li>
            ));
          })()}
        </ul>
        <p className="mt-3 text-[0.68rem]" style={{ color: "var(--bm-text-muted)" }}>
          Quellen:{" "}
          {RUNDFUNK.intendanten.sources.map((s, i) => (
            <span key={s.url}>
              {i > 0 && " · "}
              <a className="bm-link" href={s.url} rel="noopener noreferrer" target="_blank">
                {s.label}
              </a>{" "}
              ({s.asOf})
            </span>
          ))}
        </p>
      </section>

      <section className="bm-card p-3.5">
        <h2 className="mb-2 text-[0.82rem] font-semibold">Personal &amp; Vergütungsniveau</h2>
        <ul className="flex flex-col gap-2">
          {RUNDFUNK.personal.fakten.map((f) => (
            <li
              key={f.slice(0, 30)}
              className="rounded-lg p-2.5 text-[0.74rem] leading-relaxed"
              style={{ background: "var(--bm-surface-2)" }}
            >
              {f}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
          {RUNDFUNK.personal.detailNote}
        </p>
      </section>

      {/* Struktur */}
      <section className="bm-card p-3.5">
        <h2 className="mb-2 text-[0.82rem] font-semibold">Welche Sender gehören dazu?</h2>
        <ul className="flex flex-col gap-2">
          {RUNDFUNK.struktur.map((s) => (
            <li key={s.name} className="rounded-lg p-2.5" style={{ background: "var(--bm-surface-2)" }}>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-[0.78rem] font-semibold">{s.name}</span>
                <span className="text-[0.66rem]" style={{ color: "var(--bm-text-muted)" }}>
                  {s.desc}
                </span>
              </div>
              {s.mitglieder && (
                <p className="mt-0.5 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
                  Anstalten: {s.mitglieder}
                </p>
              )}
              <p className="mt-0.5 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
                Angebote: {s.angebote}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Deutsche Welle = Bund */}
      <section
        className="bm-card p-3.5"
        style={{ borderColor: "color-mix(in srgb, var(--bm-accent) 40%, var(--bm-border))" }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[0.82rem] font-semibold">Ausnahme: Deutsche Welle (Bund)</h2>
          <span className="bm-mono text-sm font-bold" style={{ color: "var(--bm-accent)" }}>
            {fmt(RUNDFUNK.dw.zuschussMio)} Mio € (2026)
          </span>
        </div>
        <p className="bm-sub mt-1">{RUNDFUNK.dw.note}</p>
        <p className="mt-2 text-[0.68rem]" style={{ color: "var(--bm-text-muted)" }}>
          Quelle:{" "}
          <a className="bm-link" href={RUNDFUNK.dw.source.url} rel="noopener noreferrer" target="_blank">
            {RUNDFUNK.dw.source.label}
          </a>
        </p>
      </section>

      <p className="text-[0.68rem]" style={{ color: "var(--bm-text-muted)" }}>
        Quellen:{" "}
        {RUNDFUNK.sources.map((s, i) => (
          <span key={s.url}>
            {i > 0 && " · "}
            <a className="bm-link" href={s.url} rel="noopener noreferrer" target="_blank">
              {s.label}
            </a>
          </span>
        ))}
        . Journalistische Inhalte der Sender sind bewusst nicht Teil des Feeds (keine amtlichen
        Primärquellen).
      </p>

    </div>
  );
}
