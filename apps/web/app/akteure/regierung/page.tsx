import { PageHeader } from "@/app/components/PageHeader";
import { SourceLine } from "@/app/components/PostenListe";
import { REGIERUNGSPROFILE, type RegierungsProfil, type Station } from "@/lib/regierungsprofile";

// Detailseite: Werdegänge der Mitglieder der Bundesregierung (Kabinett Merz).
// Jede Person eine aufklappbare Karte mit drei schlanken Zeitleisten und den
// amtlichen Biografie-Quellen unten. Neutral, ohne Wertung; öffentlich nicht
// dokumentierte Stationen fehlen bewusst (Datengrundlage: regierungsprofile.ts).

// Zeitraum links (mono), rechts was + ggf. wo. Ohne von/bis bleibt links leer.
function zeitraum(s: Station): string {
  const von = s.von?.trim() ?? "";
  const bis = s.bis?.trim() ?? "";
  if (von && bis) return `${von}–${bis}`;
  if (von) return von;
  if (bis) return `bis ${bis}`;
  return "";
}

function Zeitleiste({ stationen }: { stationen: Station[] }) {
  if (stationen.length === 0) {
    return (
      <p className="text-[0.72rem]" style={{ color: "var(--bm-text-muted)" }}>
        keine öffentlichen Angaben
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-1.5">
      {stationen.map((s, i) => (
        <li key={i} className="flex items-baseline gap-3">
          <span
            className="bm-mono shrink-0 text-[0.68rem] tabular-nums"
            style={{ minWidth: "5.5rem", color: "var(--bm-text-muted)" }}
          >
            {zeitraum(s)}
          </span>
          <span className="text-[0.78rem] leading-snug" style={{ overflowWrap: "anywhere" }}>
            {s.was}
            {s.wo && s.wo.trim() && (
              <span style={{ color: "var(--bm-text-muted)" }}> · {s.wo}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Abschnitt({ titel, stationen }: { titel: string; stationen: Station[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="bm-sect">{titel}</h3>
      <Zeitleiste stationen={stationen} />
    </div>
  );
}

function ProfilKarte({ p }: { p: RegierungsProfil }) {
  const meta = [p.amt, p.partei];
  if (p.geboren) meta.push(`geboren ${p.geboren}`);
  if (p.imAmtSeit) meta.push(`im Amt seit ${p.imAmtSeit}`);
  return (
    <details className="bm-card group p-4">
      <summary className="flex cursor-pointer list-none flex-col gap-0.5">
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold">{p.name}</span>
          <span
            aria-hidden="true"
            className="shrink-0 text-[0.72rem] transition-transform group-open:rotate-90"
            style={{ color: "var(--bm-text-muted)" }}
          >
            ›
          </span>
        </span>
        <span className="text-[0.72rem]" style={{ color: "var(--bm-text-muted)" }}>
          {meta.join(" · ")}
        </span>
      </summary>

      <div className="mt-3 flex flex-col gap-4">
        <Abschnitt titel="Ausbildung" stationen={p.ausbildung} />
        <Abschnitt titel="Beruflicher Werdegang" stationen={p.berufVorPolitik} />
        <Abschnitt titel="Politische Stationen" stationen={p.politischeStationen} />
        <SourceLine
          sources={p.quellen.map((q) => ({ label: q.label, url: q.url, asOf: "amtliche Biografie" }))}
        />
      </div>
    </details>
  );
}

export default function RegierungPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Bundesregierung"
        sub="Werdegänge der Kabinettsmitglieder, öffentlich belegt. Name antippen für Ausbildung, Stationen vor der Politik und politische Ämter – je Person mit amtlichen Quellen."
      />

      <section className="flex flex-col gap-3">
        {REGIERUNGSPROFILE.map((p) => (
          <ProfilKarte key={p.slug} p={p} />
        ))}
      </section>

    </div>
  );
}
