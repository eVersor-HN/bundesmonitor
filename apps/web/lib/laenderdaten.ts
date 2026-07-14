// Kennzahlen der 16 Bundeslaender. Jede Zahl mit amtlicher Primaerquelle und Stand.
// Keine Wertung, keine Interpolation: Einwohner und Landeshauptstaedte aus dem
// Gemeindeverzeichnis (Destatis, Stand 31.12.2024, Basis Zensus 2022), Schulden
// aus dem Statistischen Bericht "Vierteljaehrliche Schulden des Oeffentlichen
// Gesamthaushalts" (Destatis, Stichtag 31.12.2025, Tabelle 71311-04). Die
// Regierungschef:innen geben den Stand Juli 2026 wieder.
//
// Abgrenzung der Schulden: Oeffentlicher Gesamthaushalt der Laender (Kern- und
// Extrahaushalte) beim nicht-oeffentlichen Bereich – dieselbe Abgrenzung wie
// SCHULDEN_BUND in lib/kennzahlen.ts (Laender-Summe dort: 624,6 Mrd €). Die
// 16 Einzelwerte summieren sich exakt auf diese Summe. Absolute Betraege sind
// auf volle Mio € gerundet (Quellpraezision); "je Einwohner" ist der amtliche
// Nachrichtlich-Wert derselben Tabelle.

import type { SourceRef } from "./kennzahlen";

export interface LandDaten {
  name: string;
  hauptstadt: string;
  stadtstaat?: boolean;
  // Bevoelkerung insgesamt, Stand 31.12.2024 (Zensus 2022).
  einwohner?: number;
  // Regierungschef:in und Amtsbezeichnung (Stand Juli 2026).
  regierungschef?: string;
  regierungschefAmt?: string;
  partei?: string; // Partei des Regierungschefs
  koalition?: string; // regierende Parteien
  regierungSeit?: string; // Amtsantritt (nur bei juengeren Wechseln vermerkt)
  // Schuldenstand 31.12.2025 (oeffentl. Gesamthaushalt des Landes, nicht-oeffentl. Bereich).
  schuldenEur?: number;
  // Amtlicher Nachrichtlich-Wert derselben Tabelle: Schulden je Einwohner/-in (€).
  schuldenJeEinwohnerEur?: number;
  // Haeufigkeitszahl der PKS 2024: erfasste Straftaten (insgesamt) je 100.000
  // Einwohner/-innen. Einheitliche, laenderweit vergleichbare BKA-Kennzahl.
  haeufigkeitszahl?: number;
}

// Alphabetisch nach Landesname.
export const LAENDER_DATEN: LandDaten[] = [
  {
    name: "Baden-Württemberg",
    hauptstadt: "Stuttgart",
    einwohner: 11_245_898,
    regierungschef: "Cem Özdemir",
    regierungschefAmt: "Ministerpräsident",
    partei: "Grüne",
    koalition: "Grüne · CDU",
    regierungSeit: "Mai 2026",
    schuldenEur: 48_079_000_000,
    schuldenJeEinwohnerEur: 4278,
    haeufigkeitszahl: 5230,
  },
  {
    name: "Bayern",
    hauptstadt: "München",
    einwohner: 13_248_928,
    regierungschef: "Markus Söder",
    regierungschefAmt: "Ministerpräsident",
    partei: "CSU",
    koalition: "CSU · Freie Wähler",
    schuldenEur: 19_176_000_000,
    schuldenJeEinwohnerEur: 1448,
    haeufigkeitszahl: 4726,
  },
  {
    name: "Berlin",
    hauptstadt: "Berlin",
    stadtstaat: true,
    einwohner: 3_685_265,
    regierungschef: "Kai Wegner",
    regierungschefAmt: "Regierender Bürgermeister",
    partei: "CDU",
    koalition: "CDU · SPD",
    schuldenEur: 66_386_000_000,
    schuldenJeEinwohnerEur: 17_980,
    haeufigkeitszahl: 14_719,
  },
  {
    name: "Brandenburg",
    hauptstadt: "Potsdam",
    einwohner: 2_556_747,
    regierungschef: "Dietmar Woidke",
    regierungschefAmt: "Ministerpräsident",
    partei: "SPD",
    koalition: "SPD · BSW",
    schuldenEur: 22_286_000_000,
    schuldenJeEinwohnerEur: 8729,
    haeufigkeitszahl: 6915,
  },
  {
    name: "Bremen",
    hauptstadt: "Bremen",
    stadtstaat: true,
    einwohner: 704_881,
    regierungschef: "Andreas Bovenschulte",
    regierungschefAmt: "Präsident des Senats und Bürgermeister",
    partei: "SPD",
    koalition: "SPD · Grüne · Die Linke",
    schuldenEur: 26_326_000_000,
    schuldenJeEinwohnerEur: 37_335,
    haeufigkeitszahl: 14_998,
  },
  {
    name: "Hamburg",
    hauptstadt: "Hamburg",
    stadtstaat: true,
    einwohner: 1_862_565,
    regierungschef: "Peter Tschentscher",
    regierungschefAmt: "Erster Bürgermeister",
    partei: "SPD",
    koalition: "SPD · Grüne",
    schuldenEur: 35_850_000_000,
    schuldenJeEinwohnerEur: 19_223,
    haeufigkeitszahl: 12_147,
  },
  {
    name: "Hessen",
    hauptstadt: "Wiesbaden",
    einwohner: 6_280_793,
    regierungschef: "Boris Rhein",
    regierungschefAmt: "Ministerpräsident",
    partei: "CDU",
    koalition: "CDU · SPD",
    schuldenEur: 46_999_000_000,
    schuldenJeEinwohnerEur: 7487,
    haeufigkeitszahl: 6194,
  },
  {
    name: "Mecklenburg-Vorpommern",
    hauptstadt: "Schwerin",
    einwohner: 1_573_597,
    regierungschef: "Manuela Schwesig",
    regierungschefAmt: "Ministerpräsidentin",
    partei: "SPD",
    koalition: "SPD · Die Linke",
    schuldenEur: 8_239_000_000,
    schuldenJeEinwohnerEur: 5249,
    haeufigkeitszahl: 6878,
  },
  {
    name: "Niedersachsen",
    hauptstadt: "Hannover",
    einwohner: 8_004_489,
    regierungschef: "Olaf Lies",
    regierungschefAmt: "Ministerpräsident",
    partei: "SPD",
    koalition: "SPD · Grüne",
    regierungSeit: "Mai 2025",
    schuldenEur: 57_593_000_000,
    schuldenJeEinwohnerEur: 7199,
    haeufigkeitszahl: 6609,
  },
  {
    name: "Nordrhein-Westfalen",
    hauptstadt: "Düsseldorf",
    einwohner: 18_034_454,
    regierungschef: "Hendrik Wüst",
    regierungschefAmt: "Ministerpräsident",
    partei: "CDU",
    koalition: "CDU · Grüne",
    schuldenEur: 172_730_000_000,
    schuldenJeEinwohnerEur: 9590,
    haeufigkeitszahl: 7763,
  },
  {
    name: "Rheinland-Pfalz",
    hauptstadt: "Mainz",
    einwohner: 4_129_569,
    regierungschef: "Gordon Schnieder",
    regierungschefAmt: "Ministerpräsident",
    partei: "CDU",
    koalition: "CDU · SPD",
    regierungSeit: "Mai 2026",
    schuldenEur: 28_425_000_000,
    schuldenJeEinwohnerEur: 6894,
    haeufigkeitszahl: 5803,
  },
  {
    name: "Saarland",
    hauptstadt: "Saarbrücken",
    einwohner: 1_012_141,
    regierungschef: "Anke Rehlinger",
    regierungschefAmt: "Ministerpräsidentin",
    partei: "SPD",
    koalition: "SPD (Alleinregierung)",
    schuldenEur: 14_042_000_000,
    schuldenJeEinwohnerEur: 13_915,
    haeufigkeitszahl: 6470,
  },
  {
    name: "Sachsen",
    hauptstadt: "Dresden",
    einwohner: 4_042_422,
    regierungschef: "Michael Kretschmer",
    regierungschefAmt: "Ministerpräsident",
    partei: "CDU",
    koalition: "CDU · SPD (Minderheitsregierung)",
    schuldenEur: 6_990_000_000,
    schuldenJeEinwohnerEur: 1736,
    haeufigkeitszahl: 7349,
  },
  {
    name: "Sachsen-Anhalt",
    hauptstadt: "Magdeburg",
    einwohner: 2_135_597,
    regierungschef: "Sven Schulze",
    regierungschefAmt: "Ministerpräsident",
    partei: "CDU",
    koalition: "CDU · SPD · FDP",
    regierungSeit: "Januar 2026",
    schuldenEur: 23_651_000_000,
    schuldenJeEinwohnerEur: 11_128,
    haeufigkeitszahl: 8588,
  },
  {
    name: "Schleswig-Holstein",
    hauptstadt: "Kiel",
    einwohner: 2_959_517,
    regierungschef: "Daniel Günther",
    regierungschefAmt: "Ministerpräsident",
    partei: "CDU",
    koalition: "CDU · Grüne",
    schuldenEur: 32_678_000_000,
    schuldenJeEinwohnerEur: 11_045,
    haeufigkeitszahl: 7227,
  },
  {
    name: "Thüringen",
    hauptstadt: "Erfurt",
    einwohner: 2_100_277,
    regierungschef: "Mario Voigt",
    regierungschefAmt: "Ministerpräsident",
    partei: "CDU",
    koalition: "CDU · SPD · BSW",
    regierungSeit: "Dezember 2024",
    schuldenEur: 15_183_000_000,
    schuldenJeEinwohnerEur: 7269,
    haeufigkeitszahl: 7381,
  },
];

// Summe der Laenderschulden zum 31.12.2025 (amtlich, zur Kontrolle/Kontext).
export const LAENDER_SCHULDEN_SUMME_EUR = 624_600_000_000;

// Quellen (unten auf der Seite ausweisen).
export const QUELLE_EINWOHNER: SourceRef = {
  label: "Statistisches Bundesamt – Gemeindeverzeichnis: Bundesländer mit Hauptstädten (Basis Zensus 2022)",
  url: "https://www.destatis.de/DE/Themen/Laender-Regionen/Regionales/Gemeindeverzeichnis/Administrativ/02-bundeslaender.html",
  asOf: "Bevölkerungsstand 31.12.2024",
};

export const QUELLE_SCHULDEN: SourceRef = {
  label: "Statistisches Bundesamt – Vierteljährliche Schulden des Öffentlichen Gesamthaushalts, 4. Vj. 2025 (Tab. 71311-04)",
  url: "https://www.destatis.de/DE/Themen/Staat/Oeffentliche-Finanzen/Schulden-Finanzvermoegen/Publikationen/Downloads-Schulden/statistischer-bericht-vj-schulden-oeffentl-gesamthaushalt-2140520253245.html",
  asOf: "Stichtag 31.12.2025",
};

export const QUELLE_REGIERUNG: SourceRef = {
  label: "Bundesrat – Die Länder (Zusammensetzung der Landesregierungen)",
  url: "https://www.bundesrat.de/DE/bundesrat/laender/laender-node.html",
  asOf: "Stand Juli 2026",
};

export const QUELLE_KRIMINALITAET: SourceRef = {
  label:
    "Statistische Ämter des Bundes und der Länder – Erfasste Straftaten je 100.000 Einwohner/-innen (Datenbasis: Bundeskriminalamt, Polizeiliche Kriminalstatistik 2024)",
  url: "https://www.statistikportal.de/de/nachhaltigkeit/ergebnisse/ziel-16-frieden-gerechtigkeit-und-starke-institutionen/straftaten",
  asOf: "Berichtsjahr 2024",
};

export const LAENDER_QUELLEN: SourceRef[] = [
  QUELLE_EINWOHNER,
  QUELLE_SCHULDEN,
  QUELLE_REGIERUNG,
  QUELLE_KRIMINALITAET,
];

// Ehrlicher Hinweis zu Stand/Abgrenzung, wird als Fussnote gezeigt.
export const LAENDER_HINWEIS =
  "Einwohner: Stand 31.12.2024 (Zensus 2022). Schulden: öffentlicher Gesamthaushalt des Landes (Kern- und Extrahaushalte) beim nicht-öffentlichen Bereich, Stichtag 31.12.2025; auf volle Mio € gerundet. Regierungschef:innen Stand Juli 2026 (jüngste Wechsel: Baden-Württemberg und Rheinland-Pfalz Mai 2026, Sachsen-Anhalt Januar 2026, Niedersachsen Mai 2025).";

// Einordnender Hinweis zur Häufigkeitszahl: die reine Zahl erlaubt keinen Schluss
// auf "gefährlicher". Gehört klar in den Hinweisbereich.
export const KRIMINALITAET_HINWEIS =
  "Kriminalität je 100.000: Häufigkeitszahl der Polizeilichen Kriminalstatistik 2024 (erfasste Straftaten insgesamt je 100.000 Einwohner/-innen; Bundeswert 6.995). Eine höhere Zahl bedeutet NICHT automatisch „gefährlicher“: Stadtstaaten (Berlin, Bremen, Hamburg) liegen strukturbedingt höher (Pendler, Tourismus, Ballungsraum, Bahnhofs- und Grenzkriminalität, mehr Gelegenheiten auf kleiner Fläche). Die Zahl erfasst nur polizeilich registrierte Fälle und hängt zusätzlich vom Anzeigeverhalten und von der Kontrollintensität ab; sie ist eine Belastungs-, keine Gefährlichkeitskennzahl.";
