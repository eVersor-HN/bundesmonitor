import { PageHeader } from "@/app/components/PageHeader";
import { T } from "@/app/components/LangProvider";
import { PostenListe, SourceLine } from "@/app/components/PostenListe";
import { EINNAHMEN_2026 } from "@/lib/haushalt";

// Einnahmen des Bundeshaushalts 2026 im Detail.

export default function EinnahmenPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={<T k="geld.einnahmen" vars={{ year: 2026 }} />}
        sub={<T k="einnahmen.sub" vars={{ total: new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(EINNAHMEN_2026.total) }} />}
      />

      <section className="bm-card p-3.5">
        <h2 className="mb-3 text-[0.82rem] font-semibold"><T k="einnahmen.woraus" /></h2>
        <PostenListe
          items={EINNAHMEN_2026.items}
          color="var(--bm-status-healthy)"
          hrefs={{
            Steuereinnahmen: "/geld/steuern",
            "Neue Schulden (Nettokreditaufnahme)": "/geld/neue-schulden",
          }}
        />
        <SourceLine sources={[EINNAHMEN_2026.source]} />
      </section>

    </div>
  );
}
