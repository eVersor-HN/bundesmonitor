import Link from "next/link";
import { Begriff } from "@/app/components/Begriff";
import { DebtTicker } from "@/app/components/DebtTicker";
import { PageHeader } from "@/app/components/PageHeader";
import { T } from "@/app/components/LangProvider";
import { PostenListe, SourceLine } from "@/app/components/PostenListe";
import { FISCAL_FACTS, SCHULDEN_BUND } from "@/lib/kennzahlen";

// Schuldenstand: Bund live, plus ganz Deutschland (Laender, Gemeinden).

export default function SchuldenPage() {
  const teile = [
    { label: "Bund", value: SCHULDEN_BUND.amountEur / 1e9 },
    { label: "Länder", value: SCHULDEN_BUND.laenderEur / 1e9 },
    { label: "Gemeinden", value: SCHULDEN_BUND.gemeindenEur / 1e9 },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={<T k="schulden.titel" />}
        sub={
          <>
            Wie viele Schulden hat Deutschland? Live-Zahl als{" "}
            <Begriff k="hochrechnung">Hochrechnung</Begriff>, amtlicher Stand darunter.
          </>
        }
      />

      <DebtTicker />

      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-[0.82rem] font-semibold"><T k="schulden.de" vars={{ stand: SCHULDEN_BUND.asOfLabel }} /></h2>
        <p className="bm-sub mb-3">
          Öffentliche Schulden insgesamt:{" "}
          {new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(SCHULDEN_BUND.gesamtstaatEur / 1e9)}{" "}
          Mrd € – verteilt auf:
        </p>
        <PostenListe items={teile} color="var(--bm-accent)" />
        <SourceLine sources={[SCHULDEN_BUND.source]} />
      </section>

      <section className="bm-card p-3.5">
        <h2 className="mb-1 text-[0.82rem] font-semibold"><T k="schulden.einordnung" /></h2>
        <p className="text-[0.76rem] leading-relaxed">
          Die <Begriff k="schuldenquote">Schuldenquote</Begriff> lag Ende 2025 bei{" "}
          {FISCAL_FACTS.debtRatio.value} – also knapp zwei Drittel der jährlichen
          Wirtschaftsleistung (<Begriff k="bip">BIP</Begriff>).
        </p>
        <SourceLine sources={[FISCAL_FACTS.source]} />
      </section>

      <p className="flex flex-wrap gap-x-4 gap-y-1 text-[0.7rem]" style={{ color: "var(--bm-text-muted)" }}>
        <Link className="bm-link" href="/geld/neue-schulden">
          <T k="schulden.wofuerLink" />
        </Link>
        <Link className="bm-link" href="/zahlen/laender">
          Schulden der Länder →
        </Link>
      </p>

    </div>
  );
}
