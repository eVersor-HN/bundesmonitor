import Link from "next/link";
import { PageHeader } from "@/app/components/PageHeader";
import { T } from "@/app/components/LangProvider";

export default function AkteurePage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={<T k="nav.akteure" />}
        sub={<T k="akteure.sub" />}
      />

      {/* Wenige, volle-Breite-Kacheln -> etwas groesserer, gleichmaessiger
          Zeilenabstand (wie der aeussere gap-4), damit die kurze Seite fuellt. */}
      <section className="bm-tilegrid" style={{ gap: "1rem" }}>
        <Link href="/akteure/regierung" className="bm-tile bm-tile--hero bm-tile--span2">
          <span className="bm-tile__lab">Bundesregierung · Werdegänge</span>
          <span className="text-[0.85rem] font-semibold">Wer regiert – und was haben sie vorher gemacht?&nbsp;→</span>
          <span className="bm-tile__meta">Ausbildung, Beruf, politische Stationen aller 18&nbsp;Kabinettsmitglieder</span>
        </Link>
        <Link href="/akteure/parteien" className="bm-tile bm-tile--span2">
          <span className="bm-tile__lab">Parteien · Abgeordnete</span>
          <span className="text-[0.85rem] font-semibold">Alle Mitglieder des Bundestages nach Fraktion&nbsp;→</span>
          <span className="bm-tile__meta">Live aus der DIP-Schnittstelle, durchsuchbar</span>
        </Link>
        <Link href="/akteure/diaeten" className="bm-tile bm-tile--span2">
          <span className="bm-tile__lab">Abgeordnete</span>
          <span className="text-[0.85rem] font-semibold">Diäten der Abgeordneten&nbsp;→</span>
          <span className="bm-tile__meta">Entschädigung, Pauschalen, Mitarbeiterbudget</span>
        </Link>
        <Link href="/akteure/politiker" className="bm-tile bm-tile--span2">
          <span className="bm-tile__lab">Ämter</span>
          <span className="text-[0.85rem] font-semibold">Amtsbezüge &amp; Nebeneinkünfte&nbsp;→</span>
          <span className="bm-tile__meta">Kanzler/Minister, Funktionszulagen, Lobbyregister</span>
        </Link>
        <Link href="/zahlen/laender" className="bm-tile bm-tile--span2">
          <span className="bm-tile__lab">Länder</span>
          <span className="text-[0.85rem] font-semibold">Landesregierungen&nbsp;→</span>
          <span className="bm-tile__meta">Regierungschef:in &amp; Koalition je Bundesland</span>
        </Link>
      </section>
    </div>
  );
}
