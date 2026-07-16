// Die 16 Bundeslaender mit grober geografischer Rasterposition (5 Spalten),
// damit die Kachel-Auswahl kartenartig wirkt. Zentral, weil Region-Seite,
// Dashboard und Optionen dieselbe Liste nutzen.

export interface Land {
  abbr: string;
  name: string;
  col: number;
  row: number;
}

export const LAENDER: Land[] = [
  { abbr: "SH", name: "Schleswig-Holstein", col: 3, row: 1 },
  { abbr: "HB", name: "Bremen", col: 2, row: 2 },
  { abbr: "HH", name: "Hamburg", col: 3, row: 2 },
  { abbr: "MV", name: "Mecklenburg-Vorpommern", col: 4, row: 2 },
  { abbr: "NI", name: "Niedersachsen", col: 2, row: 3 },
  { abbr: "BB", name: "Brandenburg", col: 4, row: 3 },
  { abbr: "BE", name: "Berlin", col: 5, row: 3 },
  { abbr: "NW", name: "Nordrhein-Westfalen", col: 1, row: 4 },
  { abbr: "ST", name: "Sachsen-Anhalt", col: 4, row: 4 },
  { abbr: "HE", name: "Hessen", col: 2, row: 5 },
  { abbr: "TH", name: "Thüringen", col: 3, row: 5 },
  { abbr: "SN", name: "Sachsen", col: 4, row: 5 },
  { abbr: "RP", name: "Rheinland-Pfalz", col: 1, row: 6 },
  { abbr: "SL", name: "Saarland", col: 1, row: 7 },
  { abbr: "BW", name: "Baden-Württemberg", col: 2, row: 7 },
  { abbr: "BY", name: "Bayern", col: 3, row: 7 },
];
