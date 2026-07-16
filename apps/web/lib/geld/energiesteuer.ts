// Energiesteuer im Detail: Aufkommen nach Energietraegern (Destatis) und
// gesetzliche Steuersaetze (EnergieStG, Zoll). Nur belegte Werte.

import type { SourceRef } from "../kennzahlen";
import type { HaushaltPosten } from "../haushalt";

export const ENERGIESTEUER = {
  total2025: 37.6,
  total2025Note: "kassenmäßiges Ist 2025, +7,1 % gegenüber 2024 – größte reine Bundessteuer",
  // Aufkommen nach Energietraegern (Destatis, versteuerte Mengen 2024).
  traeger2024: [
    { label: "Diesel", value: 18.2, hint: "größter Posten – vor allem Güter- und Pendlerverkehr" },
    { label: "Benzin", value: 15.3, hint: "Ottokraftstoffe" },
    { label: "Heizöl (leicht)", value: 0.9, hint: "–7,6 % gegenüber 2023, Trend zu Wärmepumpen/Gas" },
    {
      label: "Übrige (u. a. Erdgas, Flüssiggas, schweres Heizöl)",
      value: 0,
      rest: true,
      hint: "rechnerische Restgröße; von Destatis nicht in dieser Übersicht einzeln ausgewiesen",
    },
  ] satisfies HaushaltPosten[],
  // Gesetzliche Saetze (EnergieStG, unveraendert seit 2003).
  saetze: [
    { label: "Benzin (schwefelfrei)", satz: "65,45 ct je Liter" },
    { label: "Diesel (schwefelfrei)", satz: "47,04 ct je Liter" },
    { label: "Heizöl (leicht)", satz: "6,14 ct je Liter" },
    { label: "Erdgas (Heizen)", satz: "0,55 ct je kWh" },
  ],
  saetzeNote:
    "Sätze für Benzin, Diesel und Heizöl sind seit 2003 unverändert. Auf die Energiesteuer fällt zusätzlich Umsatzsteuer an; beim Tanken und Heizen kommt außerdem der separate CO₂-Preis (Brennstoffemissionshandel) hinzu.",
  sources: [
    {
      label: "Statistisches Bundesamt – Energiesteuer",
      url: "https://www.destatis.de/DE/Themen/Staat/Steuern/Verbrauchsteuern/energiesteuer.html",
      asOf: "versteuerte Mengen 2024",
    },
    {
      label: "Zoll – Energiesteuer: Steuerhöhe (EnergieStG)",
      url: "https://www.zoll.de/DE/Fachthemen/Steuern/Verbrauchsteuern/Energie/Grundsaetze-Besteuerung/Steuerhoehe/steuerhoehe_node.html",
      asOf: "geltende Sätze",
    },
    {
      label: "Statistisches Bundesamt – Steuereinnahmen 2025",
      url: "https://www.destatis.de/DE/Themen/Staat/Steuern/Steuereinnahmen/steuereinnahmen.html",
      asOf: "Ist 2025",
    },
  ] satisfies SourceRef[],
};
