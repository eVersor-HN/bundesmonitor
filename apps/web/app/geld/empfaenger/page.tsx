import Link from "next/link";
import { PageHeader } from "@/app/components/PageHeader";
import { SourceLine } from "@/app/components/PostenListe";
import { empfaengerGesamt, empfaengerGruppen, type EmpfaengerGruppe } from "@/lib/geld/empfaenger";
import { HAUSHALT, fmtEur } from "@/lib/geld/haushaltsdaten";

// „Wem gibt der Staat Geld?" – benannte Zuschüsse/Zuwendungen aus dem
// Bundeshaushalt, nach Bereich. Neutral: amtliche Zweckbestimmung + Betrag +
// Ressort + Quelle, keine Wertung, keine erfundenen Zahlen.

function GruppeCard({ gruppe }: { gruppe: EmpfaengerGruppe }) {
  const max = gruppe.items[0]?.value ?? 1;
  return (
    <section className="bm-card p-3.5">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-[0.9rem] font-semibold">{gruppe.title}</h2>
        <span className="bm-mono shrink-0 text-[0.75rem] font-semibold" style={{ color: "var(--bm-accent)" }}>
          {fmtEur(gruppe.total)}
        </span>
      </div>
      <ul className="flex flex-col gap-3">
        {gruppe.items.map((item) => (
          <li key={`${item.einzelplanNr}-${item.label}`}>
            <Link href={`/geld/ressort/${item.einzelplanNr}`} className="group block">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[0.82rem] leading-snug">{item.label}</span>
                <span
                  className="bm-mono shrink-0 text-[0.82rem] font-semibold"
                  style={{ color: "var(--bm-accent)" }}
                >
                  {fmtEur(item.value)}
                </span>
              </div>
              <div
                className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: "var(--bm-surface-2)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(3, (item.value / max) * 100)}%`, background: "var(--bm-accent)" }}
                />
              </div>
              <span className="mt-1 inline-block text-[0.66rem]" style={{ color: "var(--bm-text-muted)" }}>
                {item.ministerium} · Einzelplan {item.einzelplanNr} →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function EmpfaengerPage() {
  const gruppen = empfaengerGruppen();
  const gesamt = empfaengerGesamt();
  const year = HAUSHALT.meta.year;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Wem gibt der Staat Geld?"
        sub={`Benannte Zuschüsse, Zuwendungen und Beiträge aus dem Bundeshaushalt ${year} – nach Bereich. Angezeigt wird die amtliche Zweckbestimmung; manche Titel benennen eine einzelne Organisation, andere ein Förderprogramm.`}
      />

      <p className="bm-sub -mt-1">
        Erfasst: <b style={{ color: "var(--bm-text)" }}>{fmtEur(gesamt)}</b> in {gruppen.length}{" "}
        Bereichen. Tippe einen Posten für den Ressort-Kontext.
      </p>

      {gruppen.map((g) => (
        <GruppeCard key={g.key} gruppe={g} />
      ))}

      <div className="bm-card p-3.5">
        <p className="text-[0.72rem] leading-relaxed" style={{ color: "var(--bm-text-muted)" }}>
          Methodik: automatische Auswahl benannter Empfänger-Titel aus den amtlichen Einzelplänen
          (ab 1 Mio € Soll), thematisch gruppiert. <b>Nicht empfängerscharf</b> sind große
          systemische Transfers (z. B. Rentenversicherung) und Programme, deren Mittel erst später
          an viele Einzelempfänger fließen – diese sind hier bewusst nicht als einzelner Empfänger
          dargestellt.
        </p>
        <SourceLine
          sources={[{ label: HAUSHALT.meta.source, url: HAUSHALT.meta.sourceUrl, asOf: HAUSHALT.meta.apiModifyDate }]}
          note={`Bundeshaushalt ${year} (${HAUSHALT.meta.quota})`}
        />
      </div>
    </div>
  );
}
