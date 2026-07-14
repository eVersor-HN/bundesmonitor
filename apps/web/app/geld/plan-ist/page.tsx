import { Begriff } from "@/app/components/Begriff";
import { PageHeader } from "@/app/components/PageHeader";
import { T } from "@/app/components/LangProvider";
import { SourceLine } from "@/app/components/PostenListe";
import { PlanIstChart } from "@/app/components/PlanIstChart";
import { HAUSHALT_PLAN_IST, HAUSHALT_PLAN_IST_2024 } from "@/lib/kennzahlen";

// Kontrolle: Was war geplant (Soll), was ist tatsaechlich geflossen (Ist)?

export default function PlanIstPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={<T k="geld.planIst" />}
        sub={
          <>
            Bundesmonitor hält <Begriff k="soll">Soll</Begriff> und{" "}
            <Begriff k="ist">Ist</Begriff> strikt auseinander – hier der Vergleich für den
            letzten abgeschlossenen Haushalt.
          </>
        }
      />

      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-[0.82rem] font-semibold">
          Bundeshaushalt {HAUSHALT_PLAN_IST.year} (neuester Abschluss)
        </h2>
        <p className="bm-sub mb-4">
          Veranschlagt (Plan) gegen tatsächlich (Ist), Mrd. Euro. 2025 gab der Bund 9,3 Mrd €
          weniger aus als geplant und nahm 14,9 Mrd € weniger neue Schulden auf.
        </p>
        <PlanIstChart items={HAUSHALT_PLAN_IST.items} unit=" Mrd €" />
        <SourceLine sources={[HAUSHALT_PLAN_IST.source]} />
      </section>

      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-[0.82rem] font-semibold">
          Bundeshaushalt {HAUSHALT_PLAN_IST_2024.year}
        </h2>
        <p className="bm-sub mb-4">Zum Vergleich das Vorjahr.</p>
        <PlanIstChart items={HAUSHALT_PLAN_IST_2024.items} unit=" Mrd €" />
        <SourceLine
          sources={[HAUSHALT_PLAN_IST_2024.source]}
          note="Feinere Aufschlüsselung (je Einzelplan/Förderung) folgt mit den Haushalts-Quellen"
        />
      </section>

    </div>
  );
}
