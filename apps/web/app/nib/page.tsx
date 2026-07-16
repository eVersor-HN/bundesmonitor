import { Suspense } from "react";
import { AkteureSelector } from "@/app/components/AkteureSelector";
import { BarChart } from "@/app/components/BarChart";
import { FeedClient } from "@/app/components/FeedClient";
import { PageHeader } from "@/app/components/PageHeader";
import { VotesList } from "@/app/components/VotesList";
import { ELECTION_2025 } from "@/lib/kennzahlen";
import { T } from "@/app/components/LangProvider";

// NIB – "Neu im Bundestag": der parlamentarische Aktivitäts-Tab. Live-Feed (DIP)
// mit Ziehen-nach-unten-Aktualisierung, Vorgänge nach Initiative, namentliche
// Abstimmungen und die Sitzverteilung. Das Dashboard bleibt die Startseite,
// Akteure bleibt der Personen-Hub (keine doppelten News mehr).
export default function NibPage() {
  const bars = ELECTION_2025.parties.map((p) => ({
    label: p.name,
    value: p.pct,
    color: p.color,
    note: p.seats > 0 ? `${p.seats} Sitze` : "kein Einzug",
  }));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Parlament"
        sub="Neu im Bundestag: die neuesten Vorgänge, Anfragen und Drucksachen – live aus der DIP-Schnittstelle. Nach unten ziehen aktualisiert."
      />
      <Suspense fallback={<p className="text-sm">Lädt…</p>}>
        <AkteureSelector basePath="/nib" />
        <FeedClient showTopicFilter enableRefresh applyStoredLand basePath="/nib" />
      </Suspense>

      <section className="flex flex-col gap-2">
        <h2 className="bm-sect px-1"><T k="votes.titel" /></h2>
        <p className="bm-sub px-1">
          <T k="votes.sub" />
        </p>
        <VotesList limit={10} />
      </section>

      <section className="bm-card bm-card--roomy">
        <h2 className="mb-1 text-sm font-semibold"><T k="akteure.sitze" /></h2>
        <p className="mb-4 text-xs" style={{ color: "var(--bm-text-muted)" }}>
          <T k="akteure.sitzeSub" />
        </p>
        <BarChart items={bars} unit=" %" max={30} fractionDigits={1} />
        <p className="mt-4 text-xs" style={{ color: "var(--bm-text-muted)" }}>
          <T k="ui.quelle" />:{" "}
          <a
            className="bm-link"
            href={ELECTION_2025.source.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            {ELECTION_2025.source.label}
          </a>
        </p>
      </section>
    </div>
  );
}
