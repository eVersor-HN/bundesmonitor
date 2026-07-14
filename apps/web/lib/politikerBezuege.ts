// Bezüge, Ämter und Funktionen von Politiker:innen des Bundes – breiter als die
// reinen MdB-Diäten (siehe /akteure/diaeten). Ergänzt um Amtsbezüge des
// Staatsoberhaupts, Funktionszulagen nach dem Abgeordnetengesetz sowie die
// Transparenz- und Lobbyregeln. Jede Angabe mit amtlicher Primärquelle und
// Stand. Wo keine amtliche Euro-Zahl existiert (Fraktionsvergütung), steht die
// Regel statt einer erfundenen Zahl. Gerundete Werte sind mit ca:true markiert.

import type { SourceRef } from "./kennzahlen";

export interface BezugPosten {
  label: string;
  value: number; // Euro pro Monat
  hint?: string;
  ca?: boolean; // gerundet / rechnerisch aus gesetzlicher Bemessung
}

export interface BezugRegel {
  label: string;
  wert: string; // Regel/Prozent statt festem Monatsbetrag
  hint?: string;
}

// --- Quellen (amtliche Primärquellen) ---------------------------------------

const Q_ABGG11: SourceRef = {
  label: "Abgeordnetengesetz § 11 (Entschädigung, Amtszulagen)",
  url: "https://www.gesetze-im-internet.de/abgg/__11.html",
  asOf: "Rechtsgrundlage",
};

const Q_DIAETEN: SourceRef = {
  label: "Deutscher Bundestag – Abgeordnetenentschädigung",
  url: "https://www.bundestag.de/abgeordnete/mdb_diaeten/mdb_diaeten-214848",
  asOf: "Stand: 1. Juli 2025",
};

const Q_BPRAES: SourceRef = {
  label: "Deutscher Bundestag (hib) – Bezüge von Bundespräsidenten",
  url: "https://www.bundestag.de/presse/hib/647878-647878",
  asOf: "Angaben der Bundesregierung",
};

const Q_ABGG29: SourceRef = {
  label: "Abgeordnetengesetz § 29 (Anrechnung mehrerer Bezüge)",
  url: "https://www.gesetze-im-internet.de/abgg/__29.html",
  asOf: "Rechtsgrundlage",
};

const Q_ABGG44A: SourceRef = {
  label: "Abgeordnetengesetz § 44a (Unabhängigkeit des Mandats)",
  url: "https://www.gesetze-im-internet.de/abgg/__44a.html",
  asOf: "Rechtsgrundlage",
};

const Q_NEBEN: SourceRef = {
  label: "Deutscher Bundestag – Tätigkeiten und Einkünfte neben dem Mandat",
  url: "https://www.bundestag.de/abgeordnete/nebentaetigkeit",
  asOf: "Verhaltensregeln, seit 19.10.2021",
};

const Q_BVERFG: SourceRef = {
  label: "Bundesverfassungsgericht – Funktionszulagen (Urteil vom 21.7.2000)",
  url: "https://www.bundesverfassungsgericht.de/SharedDocs/Pressemitteilungen/DE/2000/bvg00-098.html",
  asOf: "2 BvH 3/91 u.a.",
};

const Q_LOBBY: SourceRef = {
  label: "Lobbyregister beim Deutschen Bundestag",
  url: "https://www.lobbyregister.bundestag.de/",
  asOf: "Neufassung seit 1. März 2024",
};

const Q_LOBBYRG: SourceRef = {
  label: "Lobbyregistergesetz (LobbyRG)",
  url: "https://www.gesetze-im-internet.de/lobbyrg/BJNR081800021.html",
  asOf: "Rechtsgrundlage",
};

// Aktueller Monatsbetrag der Abgeordnetenentschädigung, auf den sich die
// Amtszulagen nach § 11 Abs. 2 AbgG als Vielfaches/Anteil beziehen.
const MONATSBETRAG = 11_833.47; // €/Monat, Stand 1.7.2025 (Q_DIAETEN)

// --- Daten ------------------------------------------------------------------

export const POLITIKER_BEZUEGE = {
  monatsbetrag: MONATSBETRAG,

  // Eigenständige Amtsbezüge von Staatsämtern (nicht Teil der MdB-Diät). Die
  // Bezüge von Bundeskanzler:in, Minister:innen und Parl. Staatssekretär:innen
  // stehen auf /akteure/diaeten.
  aemter: [
    {
      label: "Bundespräsident:in (Amtsgehalt)",
      value: 23_000,
      ca: true,
      hint: "Amtsgehalt = zehn Neuntel des Amtsgehalts des Bundeskanzlers; nach Angaben der Bundesregierung rund 276.000 € im Jahr (gerundeter Monatswert). Zusätzlich steuerlich zweckgebundenes Aufwandsgeld von 78.000 € im Jahr.",
    },
  ] satisfies BezugPosten[],

  // Amtszulagen nach § 11 Abs. 2 AbgG – zusätzlich zur regulären
  // Abgeordnetenentschädigung. Beträge exakt als Anteil des aktuellen
  // Monatsbetrags (11.833,47 €) berechnet.
  funktionszulagen: [
    {
      label: "Bundestagspräsident:in",
      value: MONATSBETRAG,
      hint: "Amtszulage in Höhe eines vollen Monatsbetrags (100 %) zusätzlich zur Abgeordnetenentschädigung (§ 11 Abs. 2 AbgG).",
    },
    {
      label: "Vizepräsident:innen des Bundestages",
      value: 5_916.74,
      hint: "Amtszulage in Höhe des halben Monatsbetrags (50 %) zusätzlich zur Abgeordnetenentschädigung (§ 11 Abs. 2 AbgG).",
    },
    {
      label: "Vorsitz Ausschuss / Untersuchungsausschuss / Enquete / PKGr",
      value: 1_775.02,
      hint: "Amtszulage in Höhe von 15 % des Monatsbetrags zusätzlich zur Abgeordnetenentschädigung (§ 11 Abs. 2 AbgG). Gilt nur für die/den Vorsitzende:n, nicht für Stellvertretungen.",
    },
  ] satisfies BezugPosten[],

  // Funktionen ohne gesetzlich bezifferte Zulage – als Regel statt Euro-Zahl.
  funktionsRegeln: [
    {
      label: "Fraktions- / Gruppenvorsitz",
      wert: "Vergütung aus Fraktionsmitteln (keine amtliche Euro-Angabe)",
      hint: "Nicht im Abgeordnetengesetz beziffert. Das Bundesverfassungsgericht hält eine zusätzliche, zu versteuernde Vergütung nur für Fraktionsvorsitzende für zulässig; die Höhe legt die Fraktion in eigener Verantwortung fest. Für stellvertretende Fraktionsvorsitzende und Parlamentarische Geschäftsführer sind staatliche Funktionszulagen unzulässig.",
    },
  ] satisfies BezugRegel[],

  // Regierungsmitglieder mit Bundestagsmandat: Anrechnung/Kürzung – kein voller
  // Doppelbezug (§ 29 AbgG).
  anrechnung: [
    {
      label: "Regierungsmitglied zugleich Abgeordnete:r",
      wert: "Diät wird um 50 % gekürzt",
      hint: "Wer neben dem Mandat Amtsbezüge (z. B. als Bundeskanzler:in, Minister:in oder Parl. Staatssekretär:in) erhält, dessen Abgeordnetenentschädigung wird um 50 % gekürzt; der Kürzungsbetrag darf 30 % des Amtseinkommens nicht übersteigen (§ 29 Abs. 1 AbgG). Es gibt also keinen ungekürzten Doppelbezug.",
    },
  ] satisfies BezugRegel[],

  // Nebeneinkünfte- und Transparenzregeln sowie das Lobbyregister – als
  // Erklärung der geltenden Regeln, ohne erfundene Beträge.
  nebeneinkuenfte: [
    {
      label: "Veröffentlichungspflicht für Nebeneinkünfte",
      wert: "ab 1.000 €/Monat oder 3.000 €/Jahr",
      hint: "Einkünfte aus einer Tätigkeit neben dem Mandat sind ab dieser Schwelle anzuzeigen und werden auf Euro und Cent genau bei der Abgeordnetenbiografie veröffentlicht. Seit dem 19.10.2021 (Verhaltensregeln im 11. Abschnitt AbgG); das frühere Stufenmodell wurde durch exakte Betragsangaben ersetzt.",
    },
    {
      label: "Unternehmensbeteiligungen",
      wert: "offenlegungspflichtig ab 5 %",
      hint: "Beteiligungen an Kapital- oder Personengesellschaften sind ab 5 % der Anteile offenzulegen (zuvor 25 %).",
    },
    {
      label: "Entgeltliche Interessenvertretung für Dritte",
      wert: "neben dem Mandat unzulässig",
      hint: "§ 44a Abs. 2 AbgG: Bezahlte Interessenvertretung gegenüber Bundestag oder Bundesregierung ist verboten. Verstöße gegen die Verhaltensregeln können mit einem Ordnungsgeld bis zur Hälfte der Jahresentschädigung geahndet werden.",
    },
    {
      label: "Lobbyregister",
      wert: "öffentliches Register der Interessenvertreter",
      hint: "Kein Register der Politiker-Einkünfte, sondern der Lobbyist:innen: Wer Interessenvertretung gegenüber Bundestag oder Bundesregierung betreibt, muss sich eintragen und u. a. Auftraggeber, jährliche finanzielle Aufwendungen, Zahl der Beschäftigten in der Interessenvertretung sowie betroffene Regelungsvorhaben und Themen angeben (LobbyRG, seit 2021; erweiterte Fassung seit 1.3.2024).",
    },
  ] satisfies BezugRegel[],

  sourcesAemter: [Q_BPRAES] as SourceRef[],
  sourcesFunktionszulagen: [Q_ABGG11, Q_DIAETEN] as SourceRef[],
  sourcesFunktionsRegeln: [Q_BVERFG, Q_ABGG11] as SourceRef[],
  sourcesAnrechnung: [Q_ABGG29] as SourceRef[],
  sourcesNebeneinkuenfte: [Q_NEBEN, Q_ABGG44A, Q_LOBBY, Q_LOBBYRG] as SourceRef[],

  // Gesamtliste aller verwendeten Quellen.
  sources: [
    Q_BPRAES,
    Q_ABGG11,
    Q_DIAETEN,
    Q_ABGG29,
    Q_ABGG44A,
    Q_NEBEN,
    Q_BVERFG,
    Q_LOBBY,
    Q_LOBBYRG,
  ] as SourceRef[],
};
