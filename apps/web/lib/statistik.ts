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
  // Grosse Deliktbereiche (Faelle 2024). Wo die absolute Zahl amtlich nicht
  // eindeutig einzeln vorlag, steht nur die belegte Veraenderung.
  deliktbereiche: [
    {
      label: "Diebstahl",
      value: 1_940_000,
      ca: true,
      change: "−1,6 %",
      dir: "down",
      hint: "rund ein Drittel aller Straftaten. Ladendiebstahl wird zu 89 % aufgeklärt, Fahrraddiebstahl kaum.",
    },
    {
      label: "Gewaltkriminalität",
      value: 217_277,
      change: "+1,5 %",
      dir: "up",
      hint: "höchster Stand seit 2007. Deutlich mehr tatverdächtige Kinder (unter 14) und Jugendliche.",
    },
    {
      label: "Rauschgiftkriminalität",
      change: "−34,2 %",
      dir: "down",
      hint: "starker Rückgang durch die Cannabis-Teillegalisierung. Kokain/Crack (+4,8 %), Methamphetamin (+6,0 %) und LSD (+32,6 %) stiegen dagegen.",
    },
    {
      label: "Vergewaltigung / sexuelle Nötigung",
      value: 13_320,
      change: "+9,3 %",
      dir: "up",
      hint: "schwere Sexualdelikte nach PKS-Abgrenzung (Vergewaltigung, sexuelle Nötigung, sexueller Übergriff).",
    },
    {
      label: "Straftaten gegen das Leben",
      value: 2_303,
      change: "+0,9 %",
      dir: "up",
      hint: "Mord, Totschlag und Tötung auf Verlangen – einschließlich Versuchen.",
    },
    {
      label: "Wohnungseinbruchdiebstahl",
      value: 78_436,
      change: "+0,8 %",
      dir: "up",
      hint: "geschätzter Schaden rund 350 Mio €.",
    },
  ] satisfies StatPosten[],
  messerangriffe: 29_014,
  messerNote:
    "Zu 29.014 Straftaten wurde 2024 ein „Messerangriff“ erfasst – seit 2024 ein eigenes statistisches Merkmal.",
  // Tatverdaechtige – mit den wissenschaftlich noetigen Einordnungen.
  tatverdaechtige: {
    deutsch: 1_271_638,
    deutschChange: "−3,9 %",
    nichtdeutsch: 913_196,
    nichtdeutschChange: "−1,1 %",
    anteilNichtdeutschProzent: 41.8,
    tvbzDeutsch: 1_878,
    tvbzNichtdeutsch: 5_091,
    hinweise: [
      "Die PKS zählt Tatverdächtige, nicht Verurteilte – ein Verdacht ist keine Schuld (Unschuldsvermutung).",
      "Die Tatverdächtigenbelastungszahl (Tatverdächtige je 100.000) ist ohne ausländerrechtliche Verstöße gerechnet – diese können nur Nichtdeutsche begehen.",
      "Sie ist nicht bereinigt um Alter, Geschlecht, Stadt/Land und soziale Lage. Die tatverdächtige Bevölkerung ist im Schnitt jünger, männlicher und städtischer – Faktoren, die für sich genommen die Zahlen erhöhen.",
      "Nicht enthalten: Personen ohne festen Wohnsitz oder mit Touristen-/Durchreisestatus werden statistisch der Wohnbevölkerung gegenübergestellt, was die Belastungszahl rechnerisch erhöht.",
    ],
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
