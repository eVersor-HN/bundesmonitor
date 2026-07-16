import { BarChart } from "@/app/components/BarChart";
import { Begriff } from "@/app/components/Begriff";
import { PageHeader } from "@/app/components/PageHeader";
import { T } from "@/app/components/LangProvider";
import { PostenListe, SourceLine } from "@/app/components/PostenListe";
import { SCHULDEN_ZWECK } from "@/lib/haushalt";
import { FISCAL_FACTS } from "@/lib/kennzahlen";

// Neue Schulden: wie viel, wofuer, und die Sondervermoegen daneben.

export default function NeueSchuldenPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={<T k="neueschulden.titel" />}
        sub={
          <>
            <Begriff k="nettokreditaufnahme">Nettokreditaufnahme</Begriff> 2026:{" "}
            {new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2 }).format(SCHULDEN_ZWECK.kernNka)}{" "}
            Mrd € im <Begriff k="kernhaushalt">Kernhaushalt</Begriff>.
          </>
        }
      />

      <section className="bm-card">
        <h2 className="mb-1 text-[0.82rem] font-semibold"><T k="neueschulden.wofuer" /></h2>
        <p className="mb-3 text-[0.76rem] leading-relaxed">{SCHULDEN_ZWECK.erklaerung}</p>
        <PostenListe items={SCHULDEN_ZWECK.sondervermoegen} color="var(--bm-accent-2)" />
        <SourceLine sources={SCHULDEN_ZWECK.sources} />
      </section>

      {/* Die Zahl aus den Schlagzeilen einordnen: 98 oder 900 Milliarden? */}
      <section
        className="bm-card"
        style={{ borderColor: "color-mix(in srgb, var(--bm-accent) 40%, var(--bm-border))" }}
      >
        <h2 className="mb-1 text-[0.82rem] font-semibold">98 oder 900 Milliarden – was stimmt?</h2>
        <p className="text-[0.76rem] leading-relaxed">
          Beides, je nach Zeitraum und Abgrenzung:
        </p>
        <ul className="mt-2 flex flex-col gap-1.5 text-[0.76rem] leading-relaxed">
          <li>
            <b className="bm-mono" style={{ color: "var(--bm-accent)" }}>
              97,96 Mrd €
            </b>{" "}
            = neue Schulden <b>nur im Jahr 2026</b>, nur{" "}
            <Begriff k="kernhaushalt">Kernhaushalt</Begriff>.
          </li>
          <li>
            <b className="bm-mono" style={{ color: "var(--bm-accent-2)" }}>
              rund 850 Mrd €
            </b>{" "}
            = geplante Neuverschuldung <b>2025 bis 2029 zusammen</b>, inklusive der Kredite
            der <Begriff k="sondervermoegen">Sondervermögen</Begriff> – diese Summe meinen
            die Schlagzeilen von „fast einer Billion“.
          </li>
          <li>
            Das Sondervermögen Infrastruktur (500 Mrd €) läuft sogar bis 2036 – seine
            Jahresraten kommen zusätzlich zum Kernhaushalt.
          </li>
        </ul>
        <SourceLine sources={[FISCAL_FACTS.source]} />
      </section>

      <section className="bm-card">
        <h2 className="mb-1 text-[0.82rem] font-semibold"><T k="neueschulden.vergleich" /></h2>
        <p className="bm-sub mb-4">Nettokreditaufnahme des Bundes (Kernhaushalt), Mrd. Euro.</p>
        <BarChart items={FISCAL_FACTS.nka} unit=" Mrd €" fractionDigits={1} />
        <p className="mt-2 text-[0.68rem] leading-relaxed" style={{ color: "var(--bm-text-muted)" }}>
          Nicht direkt vergleichbar: 2025 ist das vorläufige Ist (tatsächlicher Abschluss),
          2026 der beschlossene Soll-Wert (Plan).
        </p>
        <SourceLine sources={[FISCAL_FACTS.source]} />
      </section>

    </div>
  );
}
