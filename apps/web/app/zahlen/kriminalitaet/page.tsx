import { PageHeader } from "@/app/components/PageHeader";
import { SourceLine } from "@/app/components/PostenListe";
import { StatList } from "@/app/components/StatList";
import { T } from "@/app/components/LangProvider";
import { KRIMINALITAET as K } from "@/lib/statistik";

// Kriminalitaet im Detail (PKS). Neutral: Zahlen und methodische Einordnung,
// keine Wertung. Besonders sensible Bereiche (Tatverdaechtige) mit den
// wissenschaftlich noetigen Hinweisen.

function n(v: number): string {
  return new Intl.NumberFormat("de-DE").format(v);
}

export default function KriminalitaetPage() {
  const tv = K.tatverdaechtige;
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={<T k="zahlen.kriminalitaet" />}
        sub={`Polizeiliche Kriminalstatistik ${K.year}. Sie zählt der Polizei bekannt gewordene Fälle und Tatverdächtige – keine Verurteilungen.`}
      />

      {/* Kopf: Gesamt + Aufklaerung */}
      <section className="bm-card p-3.5">
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

      {/* Deliktbereiche */}
      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-[0.82rem] font-semibold">Nach Deliktbereichen</h2>
        <p className="bm-sub mb-3">Fälle {K.year}, Veränderung zum Vorjahr. Zeile mit ⓘ antippen.</p>
        <StatList items={K.deliktbereiche} unit="Fälle" />
      </section>

      {/* Gewalt / Messer */}
      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-[0.82rem] font-semibold">Gewalt &amp; Messerangriffe</h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <div className="bm-tile__lab">Gewaltkriminalität</div>
            <div className="bm-mono text-lg font-bold" style={{ color: "var(--bm-accent)" }}>
              {n(K.deliktbereiche[1].value ?? 0)}
            </div>
            <div className="text-[0.66rem]" style={{ color: "var(--bm-text-muted)" }}>
              höchster Stand seit 2007
            </div>
          </div>
          <div>
            <div className="bm-tile__lab">davon mit Messerangriff</div>
            <div className="bm-mono text-lg font-bold" style={{ color: "var(--bm-accent)" }}>
              {n(K.messerangriffe)}
            </div>
            <div className="text-[0.66rem]" style={{ color: "var(--bm-text-muted)" }}>
              eigenes Merkmal seit 2024
            </div>
          </div>
        </div>
        <p className="mt-3 text-[0.72rem] leading-relaxed" style={{ color: "var(--bm-text-muted)" }}>
          {K.messerNote}
        </p>
      </section>

      {/* Tatverdaechtige – mit Einordnung */}
      <section className="bm-card p-3.5">
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
            <div className="bm-tile__lab">nichtdeutsch · Anteil {tv.anteilNichtdeutschProzent} %</div>
            <div className="bm-mono text-base font-bold">{n(tv.nichtdeutsch)}</div>
            <div className="text-[0.64rem]" style={{ color: "var(--bm-text-muted)" }}>
              {tv.nichtdeutschChange} · {n(tv.tvbzNichtdeutsch)} je 100.000
            </div>
          </div>
        </div>
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
