import { PageHeader } from "@/app/components/PageHeader";
import { PostenListe, SourceLine } from "@/app/components/PostenListe";
import { ENERGIESTEUER } from "@/lib/geld/energiesteuer";

// Energiesteuer im Detail: Aufkommen nach Energietraegern + Steuersaetze.

export default function EnergiesteuerPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Energiesteuer"
        sub={`${new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(ENERGIESTEUER.total2025)} Mrd € Aufkommen – ${ENERGIESTEUER.total2025Note}.`}
      />

      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-[0.82rem] font-semibold">Woraus das Aufkommen kommt</h2>
        <p className="bm-sub mb-3">Versteuerte Energieträger, Milliarden Euro (2024):</p>
        <PostenListe items={ENERGIESTEUER.traeger2024} color="var(--bm-accent-2)" />
      </section>

      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-[0.82rem] font-semibold">Wie viel Steuer steckt drin?</h2>
        <p className="bm-sub mb-3">Gesetzliche Sätze nach dem Energiesteuergesetz:</p>
        <ul className="flex flex-col gap-1.5">
          {ENERGIESTEUER.saetze.map((s) => (
            <li
              key={s.label}
              className="flex items-baseline justify-between gap-3 rounded-lg p-2"
              style={{ background: "var(--bm-surface-2)" }}
            >
              <span className="min-w-0 text-[0.78rem] leading-snug">{s.label}</span>
              <span className="bm-mono shrink-0 text-[0.74rem] font-semibold" style={{ color: "var(--bm-accent)" }}>
                {s.satz}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[0.72rem] leading-relaxed" style={{ color: "var(--bm-text-muted)" }}>
          {ENERGIESTEUER.saetzeNote}
        </p>
      </section>

      <SourceLine sources={ENERGIESTEUER.sources} />

    </div>
  );
}
