import Link from "next/link";
import { PageHeader } from "@/app/components/PageHeader";
import { SourceLine } from "@/app/components/PostenListe";
import { POLITIKER_BEZUEGE, type BezugPosten, type BezugRegel } from "@/lib/politikerBezuege";

// Detailseite: Ämter, Funktionen und Transparenzregeln rund um die Bezüge von
// Politiker:innen des Bundes. Ergänzt /akteure/diaeten (MdB-Grundbezüge) um
// Amtsbezüge, Funktionszulagen, Anrechnung und Nebeneinkünfte-/Lobbyregeln.
// Neutral, ohne Wertung, jede Angabe belegt. Beträge brutto vor Steuern, soweit
// nicht anders vermerkt.

function euro(v: number): string {
  const nachkomma = v % 1 !== 0 ? 2 : 0;
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: nachkomma,
    maximumFractionDigits: 2,
  }).format(v);
}

// Proportionale Balkenliste in Euro pro Monat. Zeilen mit ⓘ sind aufklappbar.
function BezuegeListe({ items, color }: { items: BezugPosten[]; color: string }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((it, i) => {
        const zeile = (
          <>
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex min-w-0 items-baseline gap-1.5 text-[0.78rem]">
                <span className="leading-snug" style={{ overflowWrap: "anywhere" }}>
                  {it.label}
                </span>
                {it.hint && (
                  <span aria-hidden="true" className="shrink-0 text-[0.62rem]" style={{ color: "var(--bm-accent)" }}>
                    ⓘ
                  </span>
                )}
              </span>
              <span className="shrink-0 whitespace-nowrap bm-mono text-[0.74rem] font-semibold" style={{ color }}>
                {it.ca ? "≈ " : ""}
                {euro(it.value)} €/Monat
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--bm-surface-2)" }}>
              <div
                className="bm-grow h-full rounded-full"
                style={{ width: `${(it.value / max) * 100}%`, background: color, animationDelay: `${i * 70}ms` }}
              />
            </div>
          </>
        );
        if (it.hint) {
          return (
            <li key={it.label}>
              <details className="group">
                <summary className="flex cursor-pointer list-none flex-col gap-1 rounded-lg p-1.5 transition-colors hover:bg-[color-mix(in_srgb,var(--bm-accent)_7%,transparent)]">
                  {zeile}
                </summary>
                <p className="px-1.5 pb-1 pt-0.5 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
                  {it.hint}
                </p>
              </details>
            </li>
          );
        }
        return (
          <li key={it.label} className="flex flex-col gap-1 p-1.5">
            {zeile}
          </li>
        );
      })}
    </ul>
  );
}

// Regel-Liste (kein fester Monatsbetrag): Label + Regel als Text, ⓘ aufklappbar.
// Regel-Abschnitte: Der "wert" ist hier ein ganzer Satz (keine Euro-Zahl),
// deshalb gestapelt – Label oben, Regel darunter – statt als rechte Spalte,
// die den Text sonst chaotisch umbricht.
function RegelListe({ items, color }: { items: BezugRegel[]; color: string }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((it) => (
        <li key={it.label}>
          <details className="group">
            <summary className="flex cursor-pointer list-none flex-col gap-0.5 rounded-lg p-2 transition-colors hover:bg-[color-mix(in_srgb,var(--bm-accent)_7%,transparent)]">
              <span className="flex items-baseline gap-1.5">
                <span className="text-[0.78rem] font-medium leading-snug">{it.label}</span>
                {it.hint && (
                  <span aria-hidden="true" className="shrink-0 text-[0.62rem]" style={{ color: "var(--bm-accent)" }}>
                    ⓘ
                  </span>
                )}
              </span>
              <span className="text-[0.74rem] font-semibold leading-snug" style={{ color }}>
                {it.wert}
              </span>
            </summary>
            {it.hint && (
              <p className="px-2 pb-1 pt-1 text-[0.7rem] leading-relaxed" style={{ color: "var(--bm-text-muted)" }}>
                {it.hint}
              </p>
            )}
          </details>
        </li>
      ))}
    </ul>
  );
}

export default function PolitikerBezuegePage() {
  const d = POLITIKER_BEZUEGE;
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Ämter, Funktionen & Transparenz"
        sub="Was Politiker:innen des Bundes über die reguläre Diät hinaus erhalten – Amtsbezüge, Funktionszulagen und die geltenden Transparenzregeln. Belegt aus amtlichen Quellen, neutral. Zeile mit ⓘ antippen für Details."
      />

      <div className="bm-card p-3 text-[0.72rem]" style={{ color: "var(--bm-text-muted)" }}>
        Die MdB-Grundbezüge (Diät, Kostenpauschale, Amtsbezüge der Regierung) stehen auf{" "}
        <Link className="bm-link" href="/akteure/diaeten">
          Bezüge im Bund
        </Link>
        . Diese Seite ergänzt sie um Ämter, Funktionszulagen und die Regeln zu Nebeneinkünften.
      </div>

      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-sm font-semibold">Amtsbezüge des Staatsoberhaupts</h2>
        <p className="mb-3 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
          Eigenständige Amtsbezüge außerhalb der MdB-Diät. Es wird keine amtliche Euro-Einzelaufstellung
          veröffentlicht; der Wert ist daher gerundet (≈) und die gesetzliche Bemessung im Hinweis genannt.
        </p>
        <BezuegeListe items={d.aemter} color="var(--bm-accent-2)" />
        <SourceLine sources={d.sourcesAemter} />
      </section>

      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-sm font-semibold">Funktionszulagen im Bundestag</h2>
        <p className="mb-3 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
          Amtszulagen nach § 11 Abs. 2 Abgeordnetengesetz – zusätzlich zur regulären Abgeordnetenentschädigung.
          Berechnet als Anteil des aktuellen Monatsbetrags von {euro(d.monatsbetrag)} €.
        </p>
        <BezuegeListe items={d.funktionszulagen} color="var(--bm-accent)" />
        <SourceLine sources={d.sourcesFunktionszulagen} />
      </section>

      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-sm font-semibold">Funktionen ohne bezifferte Zulage</h2>
        <p className="mb-3 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
          Hier gibt es keine gesetzlich festgelegte Euro-Zulage – daher die Regel statt einer Zahl.
        </p>
        <RegelListe items={d.funktionsRegeln} color="var(--bm-accent-2)" />
        <SourceLine sources={d.sourcesFunktionsRegeln} />
      </section>

      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-sm font-semibold">Regierungsamt und Mandat zugleich</h2>
        <p className="mb-3 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
          Kein ungekürzter Doppelbezug: Amtsbezüge und Diät werden gegeneinander angerechnet.
        </p>
        <RegelListe items={d.anrechnung} color="var(--bm-accent)" />
        <SourceLine sources={d.sourcesAnrechnung} />
      </section>

      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-sm font-semibold">Nebeneinkünfte & Lobbyregister</h2>
        <p className="mb-3 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
          Regeln zur Offenlegung von Einkünften neben dem Mandat sowie zum öffentlichen Lobbyregister –
          als Erklärung der geltenden Vorschriften, ohne Einzelbeträge.
        </p>
        <RegelListe items={d.nebeneinkuenfte} color="var(--bm-accent-2)" />
        <SourceLine sources={d.sourcesNebeneinkuenfte} />
      </section>

    </div>
  );
}
