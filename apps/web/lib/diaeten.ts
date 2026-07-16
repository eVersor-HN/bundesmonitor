// Bezüge von Politiker:innen des Bundes: Diäten der Abgeordneten, pauschale
// Leistungen sowie Amtsbezüge der Regierungsmitglieder. Jede Zahl mit amtlicher
// Quelle und Stand. Wo keine amtliche Euro-Einzelaufstellung existiert
// (Regierungsbezüge), sind die Beträge als gerundet/rechnerisch gekennzeichnet
// und die gesetzliche Bemessung im Hinweis genannt (Regel: nicht raten).

import type { SourceRef } from "./kennzahlen";

export interface DiaetenPosten {
  label: string;
  value: number; // Euro pro Monat
  hint?: string;
  ca?: boolean; // gerundet / rechnerisch aus gesetzlicher Bemessung
}

export interface DiaetenRegel {
  label: string;
  wert: string; // Regel statt fester Monatsbetrag
  hint?: string;
}

// --- Quellen (amtliche Primärquellen bevorzugt) -----------------------------

const Q_ENTSCH: SourceRef = {
  label: "Deutscher Bundestag – Abgeordnetenentschädigung",
  url: "https://www.bundestag.de/abgeordnete/mdb_diaeten/mdb_diaeten-214848",
  asOf: "Stand: 1. Juli 2025",
};

const Q_KOSTEN: SourceRef = {
  label: "Deutscher Bundestag – Kostenpauschale",
  url: "https://www.bundestag.de/abgeordnete/mdb_diaeten/1334e-260800",
  asOf: "Stand: 1. Januar 2026",
};

const Q_MITARB: SourceRef = {
  label: "Deutscher Bundestag – Mitarbeiter der Abgeordneten",
  url: "https://www.bundestag.de/abgeordnete/mdb_diaeten/1334d-260806",
  asOf: "Stand: 1. Mai 2026",
};

const Q_ALTER: SourceRef = {
  label: "Deutscher Bundestag – Altersentschädigung",
  url: "https://www.bundestag.de/abgeordnete/mdb_diaeten/1335-260796",
  asOf: "Abgeordnetengesetz",
};

const Q_UEBERGANG: SourceRef = {
  label: "Deutscher Bundestag – Übergangsgeld",
  url: "https://www.bundestag.de/abgeordnete/mdb_diaeten/1335b-260810",
  asOf: "Abgeordnetengesetz",
};

const Q_BMING: SourceRef = {
  label: "Bundesministergesetz § 11 (Amtsbezüge)",
  url: "https://www.gesetze-im-internet.de/bming/__11.html",
  asOf: "Rechtsgrundlage",
};

// --- Daten ------------------------------------------------------------------

export const DIAETEN = {
  // Was ein Mitglied des Bundestages (MdB) monatlich erhält bzw. verfügt.
  abgeordnete: [
    {
      label: "Abgeordnetenentschädigung („Diäten“)",
      value: 11_833.47,
      hint: "Zu versteuern. Wird jährlich zum 1. Juli anhand des Nominallohnindex des Statistischen Bundesamtes angepasst.",
    },
    {
      label: "Steuerfreie Kostenpauschale (Amtsausstattung)",
      value: 5_467.27,
      hint: "Steuerfrei. Deckt Wahlkreisbüro(s), Zweitwohnung am Parlamentssitz, Fahrten und Wahlkreisbetreuung. Anpassung jährlich zum 1. Januar.",
    },
    {
      label: "Mitarbeiterpauschale (Bürobudget)",
      value: 27_396,
      hint: "Kein Einkommen des Abgeordneten: Die Gehälter zahlt die Bundestagsverwaltung direkt an die Beschäftigten. Angehörige dürfen nicht zulasten des Bundeshaushalts beschäftigt werden.",
    },
  ] satisfies DiaetenPosten[],

  // Amtsbezüge der Regierungsmitglieder. Betraege gerundet (ca:true), da keine
  // amtliche Euro-Einzelaufstellung veroeffentlicht wird; die gesetzliche
  // Bemessung (Vielfaches des Grundgehalts B 11) steht im Hinweis.
  regierung: [
    {
      label: "Bundeskanzler:in",
      value: 21_600,
      ca: true,
      hint: "Amtsgehalt = 1⅔ des Grundgehalts der Besoldungsgruppe B 11, zzgl. Ortszuschlag und Dienstaufwandsentschädigung (Bundesministergesetz § 11). Gerundeter Monatswert.",
    },
    {
      label: "Bundesminister:in",
      value: 17_900,
      ca: true,
      hint: "Amtsgehalt = 1⅓ des Grundgehalts B 11, zzgl. Ortszuschlag und Dienstaufwandsentschädigung (§ 11 BMinG). Gerundeter Monatswert.",
    },
    {
      label: "Parl. Staatssekretär:in",
      value: 13_400,
      ca: true,
      hint: "Gesetzlich 75 % der Amtsbezüge eines Bundesministers. Gerundeter Monatswert.",
    },
  ] satisfies DiaetenPosten[],

  // Pauschale/rechtebasierte Leistungen, die sich nicht als fester Monatsbetrag
  // darstellen lassen (Regel statt Zahl).
  leistungen: [
    {
      label: "Übergangsgeld nach dem Ausscheiden",
      wert: "1 Monat je Mandatsjahr, längstens 18 Monate",
      hint: "In Höhe der Abgeordnetenentschädigung. Ab dem zweiten Monat wird anderes Erwerbseinkommen angerechnet.",
    },
    {
      label: "Altersentschädigung",
      wert: "2,5 % je Mandatsjahr, höchstens 65 %",
      hint: "Prozentsatz der Abgeordnetenentschädigung. Höchstsatz nach 26 Mandatsjahren; die Altersgrenze ist an die gesetzliche Rente (bis 67 Jahre) gekoppelt.",
    },
  ] satisfies DiaetenRegel[],

  sourcesAbgeordnete: [Q_ENTSCH, Q_KOSTEN, Q_MITARB] as SourceRef[],
  sourcesRegierung: [Q_BMING] as SourceRef[],
  sourcesLeistungen: [Q_UEBERGANG, Q_ALTER] as SourceRef[],
  // Gesamtliste aller verwendeten Quellen.
  sources: [Q_ENTSCH, Q_KOSTEN, Q_MITARB, Q_BMING, Q_UEBERGANG, Q_ALTER] as SourceRef[],
};
