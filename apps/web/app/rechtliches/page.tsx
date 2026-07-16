import { PageHeader } from "@/app/components/PageHeader";

// Rechtliche Hinweise und Disclaimer. Neutral, ehrlich, ohne Juristendeutsch
// wo es geht – aber mit den noetigen Klarstellungen.

const ABSCHNITTE: { titel: string; text: string }[] = [
  {
    titel: "Kein amtliches Angebot",
    text: "Bundesmonitor ist ein privates, unabhängiges Projekt. Die App ist kein Angebot des Bundes, des Bundestages oder einer Behörde und steht mit diesen in keiner Verbindung. Es werden bewusst keine Hoheitszeichen (z. B. Bundesadler) verwendet.",
  },
  {
    titel: "Datenquellen & Verbindlichkeit",
    text: "Alle Inhalte stammen aus amtlichen bzw. offiziellen Quellen (u. a. Dokumentations- und Informationssystem des Bundestages (DIP), bundeshaushalt.de, Statistisches Bundesamt, Bundeswahlleiterin, Bundesgesetzblatt) und sind mit Quelle und Stand gekennzeichnet. Rechtlich maßgeblich sind ausschließlich die amtlichen Veröffentlichungen der jeweiligen Stellen. Trotz Sorgfalt kann keine Gewähr für Richtigkeit, Vollständigkeit und Aktualität übernommen werden.",
  },
  {
    titel: "Hochrechnungen & Restgrößen",
    text: "Live-Zähler sind klar gekennzeichnete lineare Hochrechnungen amtlicher Werte – keine Echtzeit-Messungen. Als „Restgröße“ oder „rechnerisch“ markierte Werte sind Differenzen aus amtlichen Summen, keine eigenständig veröffentlichten Zahlen.",
  },
  {
    titel: "Neutralität",
    text: "Bundesmonitor bewertet nicht. Es gibt kein Ranking, kein Framing und keine politische Empfehlung. Statusangaben (geplant, beschlossen, verkündet, Ist) werden strikt getrennt; bei Unsicherheit wird „unklar“ angezeigt statt geraten.",
  },
  {
    titel: "Keine Beratung",
    text: "Die Inhalte dienen der allgemeinen Information und stellen keine Rechts-, Steuer- oder Finanzberatung dar.",
  },
  {
    titel: "Datenschutz",
    text: "Die App hat keine Konten und kein Tracking. Einstellungen (Thema, Sprache, Bundesland, Favoriten) werden ausschließlich lokal auf dem Gerät gespeichert. Beim Aktualisieren werden Anfragen an den konfigurierten Bundesmonitor-Server gestellt; externe Links öffnen die Websites der jeweiligen amtlichen Stellen mit deren Datenschutzregeln.",
  },
  {
    titel: "Externe Links",
    text: "Für Inhalte verlinkter externer Seiten sind deren Betreiber verantwortlich. Zum Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar.",
  },
  {
    titel: "Lizenz der Daten",
    text: "Amtliche Werke wie Gesetze und Drucksachen sind gemeinfrei (§ 5 UrhG). Daten von bundeshaushalt.de und Destatis stehen unter der Datenlizenz Deutschland (dl-de/by-2-0) bzw. den Nutzungsbedingungen der jeweiligen Stelle.",
  },
];

export default function RechtlichesPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Rechtliche Hinweise" sub="Was Bundesmonitor ist – und was nicht." />
      {ABSCHNITTE.map((a) => (
        <section key={a.titel} className="bm-card">
          <h2 className="mb-1 text-[0.82rem] font-semibold">{a.titel}</h2>
          <p className="text-[0.76rem] leading-relaxed" style={{ color: "var(--bm-text-muted)" }}>
            {a.text}
          </p>
        </section>
      ))}
    </div>
  );
}
