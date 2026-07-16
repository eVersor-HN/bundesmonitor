// Amtliche Statistiken: Kriminalitaet (BKA/PKS), Bevoelkerung und Wirtschaft
// (Destatis, Bundesagentur fuer Arbeit). Jede Zahl mit Quelle und Jahr.
// Jahreszahlen kommen aus den Datensaetzen selbst, nicht aus dem JSX – so
// passt sich die Anzeige automatisch an, sobald die Daten aktualisiert werden.

import type { SourceRef } from "./kennzahlen";

export interface StatPosten {
  label: string;
  value?: number; // absolute Fallzahl, falls amtlich einzeln belegt
  ca?: boolean; // "rund"-Angabe
  change?: string; // Veraenderung ggue. Vorjahr, z. B. "+1,5 %"
  dir?: "up" | "down" | "flat";
  hint?: string;
  rest?: boolean;
}

// Eine amtliche PKS-Obergruppe mit ihren wichtigsten Unterposten (aufklappbar).
export interface Deliktgruppe {
  label: string;
  value: number; // Faelle der Obergruppe 2024
  share: number; // %-Anteil an allen Faellen (T01, Spalte 4)
  vollstaendig?: boolean; // true: Unterposten ergeben die Gruppe (nahezu) vollstaendig
  unterposten: StatPosten[];
}

const BKA_SOURCE: SourceRef = {
  label: "Bundeskriminalamt – Polizeiliche Kriminalstatistik",
  url: "https://www.bka.de/DE/AktuelleInformationen/StatistikenLagebilder/PolizeilicheKriminalstatistik/PKS2024/pks2024_node.html",
  asOf: "Berichtsjahr 2024",
};

const BMI_SOURCE: SourceRef = {
  label: "Bundesinnenministerium – PKS 2024",
  url: "https://www.bmi.bund.de/SharedDocs/pressemitteilungen/DE/2025/04/pks-2024.html",
  asOf: "vorgestellt April 2025",
};

export const KRIMINALITAET = {
  year: 2024,
  prevYear: 2023,
  gesamt: 5_837_445,
  gesamtVorjahr: 5_940_667,
  gesamtChange: "−1,7 %",
  gesamtDir: "down" as const,
  aufklaerungProzent: 58.0,
  aufgeklaert: 3_385_919,
  cannabisNote:
    "Der Rückgang geht vor allem auf die Cannabis-Teillegalisierung (seit 1. April 2024) zurück – dadurch fielen sehr viele Drogendelikte weg. Ohne diesen Effekt wäre die Kriminalität etwa auf hohem Niveau stabil geblieben.",
  // Amtliche PKS-Obergruppen 2024 (BKA-Grundtabelle T01). Diese sieben Gruppen
  // teilen die Gesamtzahl VOLLSTAENDIG und ueberschneidungsfrei auf – ihre Summe
  // ergibt exakt 5.837.445. Nach Groesse sortiert. Die Zahlen in den Hinweisen
  // sind die groessten Unterposten (ebenfalls T01 bzw. BMI-Ueberblick).
  obergruppenNote:
    "So verteilen sich alle erfassten Fälle auf die sieben amtlichen Obergruppen der Polizeilichen Kriminalstatistik. Sie summieren sich – überschneidungsfrei – exakt zur Gesamtzahl. Tippe eine Zeile für die größten Unterposten an.",
  obergruppen: [
    {
      label: "Diebstahl",
      value: 1_940_033,
      share: 33.2,
      unterposten: [
        { label: "Ladendiebstahl", value: 404_907, hint: "zu rund 89 % aufgeklärt." },
        { label: "Fahrraddiebstahl", value: 245_868, hint: "wird nur selten aufgeklärt." },
        { label: "Diebstahl unbarer Zahlungsmittel", value: 107_960 },
        { label: "Taschendiebstahl", value: 107_720 },
        { label: "Wohnungseinbruchdiebstahl", value: 78_436, hint: "geschätzter Schaden rund 350 Mio €." },
        { label: "Diebstahl von Kraftwagen", value: 30_373 },
        { label: "Diebstahl von Mopeds und Krafträdern", value: 27_810 },
      ],
    },
    {
      label: "Sonstige Straftatbestände (StGB)",
      value: 1_196_061,
      share: 20.5,
      unterposten: [
        { label: "Sachbeschädigung", value: 557_309 },
        { label: "Beleidigung", value: 251_502, hint: "davon rund 28.000 auf sexueller Grundlage." },
        { label: "Widerstand/tätlicher Angriff & Straftaten gegen die öffentliche Ordnung", value: 187_354 },
        { label: "Begünstigung, Strafvereitelung, Hehlerei", value: 52_657 },
        { label: "Brandstiftung", value: 17_702 },
        { label: "Urheberrechtsdelikte", value: 11_320 },
        { label: "Umweltstraftaten", value: 9_336 },
      ],
    },
    {
      label: "Vermögens- und Fälschungsdelikte",
      value: 984_886,
      share: 16.9,
      unterposten: [
        {
          label: "Betrug",
          value: 743_472,
          hint: "u. a. Waren-/Warenkreditbetrug (233.987) und Erschleichen von Leistungen (144.348, z. B. Schwarzfahren).",
        },
        { label: "Unterschlagung", value: 127_817 },
        { label: "Urkundenfälschung", value: 87_652 },
        { label: "Geld- und Wertzeichenfälschung", value: 8_617 },
        { label: "Untreue", value: 5_453 },
      ],
    },
    {
      label: "Rohheitsdelikte & Straftaten gegen die persönliche Freiheit",
      value: 968_321,
      share: 16.6,
      vollstaendig: true,
      unterposten: [
        {
          label: "Körperverletzung",
          value: 626_045,
          hint: "davon vorsätzliche einfache Körperverletzung (437.461) und gefährliche/schwere (158.177).",
        },
        {
          label: "Straftaten gegen die persönliche Freiheit",
          value: 299_082,
          hint: "u. a. Bedrohung (197.921), Nötigung (68.747) und Nachstellung/Stalking (24.743).",
        },
        { label: "Raub", value: 43_194, hint: "Raub, räuberische Erpressung und räuberischer Angriff auf Kraftfahrer." },
      ],
    },
    {
      label: "Strafrechtliche Nebengesetze",
      value: 617_187,
      share: 10.6,
      unterposten: [
        {
          label: "Aufenthalts-, Asyl- und Freizügigkeitsgesetz",
          value: 287_339,
          hint: "aufenthaltsrechtliche Verstöße – können nur von Nichtdeutschen begangen werden.",
        },
        { label: "Rauschgiftdelikte (BtMG)", value: 228_104, hint: "−34,2 % durch die Cannabis-Teillegalisierung." },
        { label: "Waffen-, Sprengstoff- und Kriegswaffengesetz", value: 41_431 },
      ],
    },
    {
      label: "Straftaten gegen die sexuelle Selbstbestimmung",
      value: 127_775,
      share: 2.2,
      unterposten: [
        { label: "Verbreitung, Besitz kinderpornografischer Inhalte", value: 42_854 },
        { label: "Sexueller Missbrauch (§§ 176–176e, 182, 183)", value: 26_833 },
        { label: "Sexuelle Belästigung", value: 20_150 },
        { label: "Vergewaltigung / sexuelle Nötigung", value: 13_320, hint: "besonders schwere Fälle nach §§ 177, 178 StGB." },
        { label: "Verbreitung, Besitz jugendpornografischer Inhalte", value: 9_601 },
        { label: "Exhibitionistische Handlungen", value: 9_288 },
      ],
    },
    {
      label: "Straftaten gegen das Leben",
      value: 3_182,
      share: 0.1,
      vollstaendig: true,
      unterposten: [
        { label: "Totschlag und Tötung auf Verlangen", value: 1_573, hint: "einschließlich Versuchen." },
        { label: "Fahrlässige Tötung (ohne Verkehrsunfall)", value: 780 },
        { label: "Mord", value: 730, hint: "einschließlich Versuchen." },
        { label: "Schwangerschaftsabbruch", value: 99 },
      ],
    },
  ] satisfies Deliktgruppe[],
  gewaltkriminalitaet: 217_277,
  // Kurze Einordnungen als Datenfeld (nicht im JSX hartcodiert), damit sie mit
  // den Live-Daten mitrollen und nicht veralten. Leerer String -> keine Anzeige.
  gewaltNote: "höchster Stand seit 2007",
  messerangriffe: 29_014,
  messerMerkmalNote: "eigenes Merkmal seit 2024",
  messerNote:
    "Zu 29.014 Straftaten wurde 2024 ein „Messerangriff“ erfasst – seit 2024 ein eigenes statistisches Merkmal.",
  // Tatverdaechtige – mit den wissenschaftlich noetigen Einordnungen.
  tatverdaechtige: {
    gesamt: 2_184_834,
    deutsch: 1_271_638,
    deutschChange: "−3,9 %",
    nichtdeutsch: 913_196,
    nichtdeutschChange: "−1,1 %",
    anteilNichtdeutschProzent: 41.8,
    tvbzDeutsch: 1_878,
    tvbzNichtdeutsch: 5_091,
    hinweise: [
      "Die PKS zählt Tatverdächtige, nicht Verurteilte – ein Verdacht ist keine Schuld (Unschuldsvermutung).",
      "Absolute Tatverdächtigenzahlen spiegeln auch die Größe sowie die Alters- und Geschlechtsstruktur der jeweiligen Gruppe in Deutschland wider – sie sagen für sich genommen nichts über die „Kriminalität“ einer Nationalität aus.",
      "Die Tatverdächtigenbelastungszahl (Tatverdächtige je 100.000) ist ohne ausländerrechtliche Verstöße gerechnet – diese können nur Nichtdeutsche begehen.",
      "Sie ist nicht bereinigt um Alter, Geschlecht, Stadt/Land und soziale Lage. Die tatverdächtige Bevölkerung ist im Schnitt jünger, männlicher und städtischer – Faktoren, die für sich genommen die Zahlen erhöhen.",
      "Nicht enthalten: Personen ohne festen Wohnsitz oder mit Touristen-/Durchreisestatus werden statistisch der Wohnbevölkerung gegenübergestellt, was die Belastungszahl rechnerisch erhöht.",
    ],
    // Untergliederung NUR der nichtdeutschen Tatverdaechtigen (913.196).
    // Herkunft: BKA T62; Aufenthaltsstatus: BKA T61. Deutsche Tatverdaechtige
    // koennen nicht nach Migrationshintergrund aufgeschluesselt werden – die PKS
    // erfasst nur die Staatsangehoerigkeit.
    nichtdeutschNationalitaet: [
      { label: "Syrien", value: 114_889 },
      { label: "Türkei", value: 93_253 },
      { label: "Rumänien", value: 65_041 },
      { label: "Ukraine", value: 55_669 },
      { label: "Afghanistan", value: 49_427 },
      { label: "Polen", value: 47_771 },
      { label: "Bulgarien", value: 27_940 },
      { label: "Irak", value: 23_185 },
      { label: "Serbien", value: 22_072 },
      { label: "Italien", value: 19_353 },
    ] satisfies StatPosten[],
    nichtdeutschAufenthalt: [
      {
        label: "Erlaubter Aufenthalt",
        value: 686_846,
        hint: "u. a. Arbeit/Studium/EU-Freizügigkeit (524.573), Asylbewerber (81.646), anerkannte Schutzberechtigte (51.160), Duldung (29.467).",
      },
      {
        label: "Unerlaubter Aufenthalt",
        value: 221_571,
        hint: "Aufenthaltsstatus der Tatverdächtigen über alle Delikte – nicht die Straftat „unerlaubter Aufenthalt“ selbst.",
      },
      {
        label: "Kein Aufenthalt in Deutschland",
        value: 4_761,
        hint: "Touristinnen/Touristen und Durchreisende.",
      },
    ] satisfies StatPosten[],
  },
  sources: [BKA_SOURCE, BMI_SOURCE],
};

export const BEVOELKERUNG = {
  year: 2024,
  einwohner: 83_600_000,
  einwohnerNote: "knapp 83,6 Mio zum Jahresende 2024",
  wachstumProzent: 0.1,
  wachstumAbs: 121_000,
  posten: [
    {
      label: "Geborene",
      value: 680_000,
      ca: true,
      hint: "2024 zwischen 670.000 und 690.000 – Geburtenrate 1,35 Kinder je Frau.",
    },
    {
      label: "Gestorbene",
      value: 1_000_000,
      ca: true,
      hint: "rund 1,0 Mio; Sterbeüberschuss über Geburten etwa +330.000.",
    },
    {
      label: "Wanderungssaldo",
      value: 420_000,
      change: "von +660.000 gesunken",
      dir: "down",
      hint: "Zuzüge minus Fortzüge über die Grenzen. Das Bevölkerungswachstum beruht allein hierauf.",
    },
  ] satisfies StatPosten[],
  geburtenrate: 1.35,
  geburtenNote:
    "Seit drei Jahren sterben mehr Menschen als geboren werden (Geburtendefizit über 300.000). Ohne Zuwanderung würde die Bevölkerung schrumpfen.",
  source: {
    label: "Statistisches Bundesamt – Bevölkerung 2024",
    url: "https://www.destatis.de/DE/Presse/Pressemitteilungen/2025/06/PD25_221_124.html",
    asOf: "Ergebnisse 2024",
  } satisfies SourceRef,
};

export const WIRTSCHAFT = {
  bipYear: 2024,
  bipChange: "−0,2 %",
  bipDir: "down" as const,
  bipNote: "reales Bruttoinlandsprodukt – zweites Minusjahr in Folge.",
  bip2025Change: "+0,2 %",
  inflationYear: 2024,
  inflationProzent: 2.2,
  inflationNote: "Jahresdurchschnitt der Verbraucherpreise; im Jahresverlauf deutlich gesunken.",
  arbeitYear: 2025,
  arbeitslose: 2_948_000,
  arbeitsloseChange: "+161.000",
  arbeitslosenquoteProzent: 6.3,
  arbeitNote: "Jahresdurchschnitt 2025; Quote +0,3 Prozentpunkte – drittes Anstiegsjahr in Folge.",
  sources: [
    {
      label: "Statistisches Bundesamt – Bruttoinlandsprodukt / Verbraucherpreise",
      url: "https://www.destatis.de/DE/Themen/Wirtschaft/Volkswirtschaftliche-Gesamtrechnungen-Inlandsprodukt/_inhalt.html",
      asOf: "2024/2025",
    },
    {
      label: "Bundesagentur für Arbeit – Jahresrückblick 2025",
      url: "https://www.arbeitsagentur.de/presse/2026-02-jahresrueckblick-2025",
      asOf: "Jahresdurchschnitt 2025",
    },
  ] satisfies SourceRef[],
};
