// Steuereinnahmen in Deutschland: kassenmaessiges Ist 2025 (Destatis).
// Nur amtlich belegte Einzelwerte; Restgroessen sind gekennzeichnet.

import type { SourceRef } from "./kennzahlen";
import type { HaushaltPosten } from "./haushalt";

export const STEUERN_2025 = {
  year: 2025,
  total: 989.8,
  totalDelta: "+4,4 % gegenüber 2024",
  // Groesste amtlich einzeln ausgewiesene Steuerarten (Mrd. Euro, Ist 2025).
  arten: [
    {
      label: "Umsatzsteuer (inkl. Einfuhr)",
      value: 310.2,
      hint: "zahlen alle beim Einkaufen: 19 % bzw. 7 % auf Waren und Dienstleistungen",
    },
    {
      label: "Lohnsteuer",
      value: 262.7,
      hint: "wird direkt vom Arbeitslohn einbehalten",
    },
    {
      label: "Gewerbesteuer",
      value: 76.4,
      hint: "zahlen Unternehmen an ihre Gemeinde",
    },
    {
      label: "Energiesteuer",
      value: 37.6,
      hint: "auf Benzin, Diesel, Heizöl, Gas – größte reine Bundessteuer",
    },
    {
      label: "Erbschaft- & Schenkungsteuer",
      value: 15.4,
      hint: "Ländersteuer; 2025 stark gestiegen (+54,3 %)",
    },
    {
      label: "Übrige Steuerarten",
      value: 287.5,
      hint: "antippen für die volle Aufschlüsselung – von Einkommen- bis Luftverkehrsteuer",
    },
  ] satisfies HaushaltPosten[],
  // Wer bekommt das Geld (nach Verteilung)?
  verteilung: [
    { label: "Bund", value: 388.7 },
    { label: "Länder", value: 415.3 },
    { label: "Gemeinden", value: 150.9 },
    {
      label: "Rest (u. a. EU-Anteile)",
      value: 34.9,
      rest: true,
      hint: "rechnerische Restgröße",
    },
  ] satisfies HaushaltPosten[],
  // Systematik: wer erhebt welche Steuern (Beispiele, ohne Zahlenbehauptung).
  kategorien: [
    {
      label: "Gemeinschaftsteuern",
      wer: "Bund + Länder (+ Gemeinden) teilen sich den Ertrag",
      beispiele: "Lohn- und Einkommensteuer, Umsatzsteuer, Körperschaftsteuer, Kapitalertragsteuer",
      anteil: "746,3 Mrd € (2025) – der weitaus größte Block",
    },
    {
      label: "Bundessteuern",
      wer: "Ertrag allein beim Bund",
      beispiele: "Energie-, Tabak-, Strom-, Kfz-, Luftverkehr-, Versicherungsteuer, Solidaritätszuschlag",
      anteil: null,
    },
    {
      label: "Ländersteuern",
      wer: "Ertrag allein bei den Ländern",
      beispiele: "Erbschaft- und Schenkungsteuer, Grunderwerbsteuer, Biersteuer",
      anteil: null,
    },
    {
      label: "Gemeindesteuern",
      wer: "Ertrag bei Städten und Gemeinden",
      beispiele: "Gewerbesteuer, Grundsteuer, Hunde- und Vergnügungsteuer",
      anteil: null,
    },
  ],
  source: {
    label: "Statistisches Bundesamt – Steuereinnahmen 2025",
    url: "https://www.destatis.de/DE/Themen/Staat/Steuern/Steuereinnahmen/steuereinnahmen.html",
    asOf: "kassenmäßiges Ist 2025",
  } satisfies SourceRef,
};

// Aufschluesselung der "uebrigen" Steuerarten (Ist 2025, BMF-Monatsbericht).
// Ergaenzt die Hauptliste (Umsatz-, Lohn-, Gewerbe-, Energie-, Erbschaftsteuer).
export const STEUERN_UEBRIGE_2025 = {
  year: 2025,
  total: 287.5,
  arten: [
    {
      label: "Veranlagte Einkommensteuer",
      value: 78.4,
      hint: "per Steuererklärung, v. a. Selbstständige und Vermieter",
    },
    {
      label: "Körperschaftsteuer",
      value: 39.2,
      hint: "15 % auf Gewinne von GmbH, AG & Co.",
    },
    {
      label: "Nicht veranlagte Steuern vom Ertrag",
      value: 31.1,
      hint: "v. a. Steuer auf Dividenden, direkt an der Quelle einbehalten",
    },
    {
      label: "Abgeltungsteuer",
      value: 24.8,
      hint: "25 % auf Zinsen und Verkaufsgewinne, zieht die Bank direkt ab",
    },
    {
      label: "Versicherungsteuer",
      value: 19.6,
      hint: "meist 19 % auf Versicherungsbeiträge (nicht: Leben/Kranken)",
    },
    {
      label: "Tabaksteuer",
      value: 17.6,
      hint: "fester Betrag je Zigarette plus Prozentanteil vom Preis",
    },
    {
      label: "Grunderwerbsteuer",
      value: 15.1,
      hint: "3,5–6,5 % beim Immobilienkauf, Satz je Bundesland",
    },
    {
      label: "Solidaritätszuschlag",
      value: 12.9,
      hint: "5,5 % Zuschlag – seit 2021 nur noch für hohe Einkommen und Kapitalerträge",
    },
    {
      label: "Kfz-Steuer",
      value: 9.6,
      hint: "nach Hubraum und CO₂-Ausstoß des Fahrzeugs",
    },
    {
      label: "Stromsteuer",
      value: 5.9,
      hint: "2,05 ct je kWh; für das produzierende Gewerbe abgesenkt",
    },
    {
      label: "Luftverkehrsteuer",
      value: 2.1,
      hint: "je Flugticket, gestaffelt nach Distanz",
    },
    {
      label: "Alkoholsteuer",
      value: 2.1,
      hint: "auf Spirituosen; Bier- und Schaumweinsteuer laufen separat",
    },
    {
      // Rechnerische Restgröße = total − Σ(benannte Arten) = 287,5 − 258,4 = 29,1.
      // So ergibt Σ(arten) exakt total (mit 29,3 waere die Summe 287,7 ≠ 287,5).
      label: "Weitere Steuern",
      value: 29.1,
      rest: true,
      hint: "rechnerische Restgröße: u. a. Grundsteuer, Zölle, Bier-, Kaffee- und Rennwettsteuer",
    },
  ] satisfies HaushaltPosten[],
  source: {
    label: "BMF-Monatsbericht Januar 2026 – Steuereinnahmen Dezember 2025",
    url: "https://www.bundesfinanzministerium.de/Monatsberichte/Ausgabe/2026/01/Inhalte/Kapitel-3-Wirtschafts-und-Finanzlage/3-2-steuereinnahmen-dezember-2025.html",
    asOf: "kassenmäßiges Ist, Januar–Dezember 2025",
  } satisfies SourceRef,
};
