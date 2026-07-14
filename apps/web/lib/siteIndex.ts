// Statischer Index der eigenen Seiten fuer die Suche. So findet die Lupe auch
// die redaktionellen Inhalte (Rundfunk, Steuern, Diaeten, Laender ...), nicht
// nur Bundestags-Vorgaenge. Synonyme fangen Alltagsbegriffe ab (GEZ, MwSt ...).

export interface SiteEntry {
  path: string;
  titel: string;
  beschreibung: string;
  syn: string[];
}

export const SITE_INDEX: SiteEntry[] = [
  { path: "/geld", titel: "Geld & Haushalt", beschreibung: "Einnahmen, Ausgaben, Schulden des Bundes", syn: ["haushalt", "bundeshaushalt", "budget", "geld", "finanzen"] },
  { path: "/geld/schulden", titel: "Schuldenstand", beschreibung: "Schulden des Bundes, live", syn: ["schulden", "schuldenuhr", "schuldenstand", "verschuldung"] },
  { path: "/geld/neue-schulden", titel: "Neue Schulden", beschreibung: "Nettokreditaufnahme & Sondervermögen", syn: ["neue schulden", "nettokreditaufnahme", "kredite", "nka", "sondervermögen"] },
  { path: "/geld/steuern", titel: "Steuern", beschreibung: "Steuerarten & Verteilung", syn: ["steuer", "steuern"] },
  { path: "/geld/steuer/energiesteuer", titel: "Energiesteuer", beschreibung: "Benzin, Diesel, Heizöl, Gas", syn: ["energiesteuer", "benzin", "diesel", "sprit", "heizöl", "gas", "mineralölsteuer", "tanken", "spritpreis"] },
  { path: "/geld/steuer/uebrige", titel: "Weitere Steuerarten", beschreibung: "Einkommen-, Umsatzsteuer, Soli u. a.", syn: ["umsatzsteuer", "mwst", "mehrwertsteuer", "einkommensteuer", "lohnsteuer", "tabaksteuer", "grunderwerbsteuer", "soli", "kfz-steuer", "kapitalertragsteuer"] },
  { path: "/geld/ressorts", titel: "Ministerien (Etats)", beschreibung: "Alle 26 Einzelpläne", syn: ["ministerien", "ministerium", "ressort", "einzelplan", "etat", "etats"] },
  { path: "/geld/plan-ist", titel: "Plan vs. Ist", beschreibung: "Hält der Bund den Haushalt ein?", syn: ["plan ist", "soll ist", "haushaltsabschluss", "kontrolle"] },
  { path: "/rundfunk", titel: "Öffentlich-rechtlicher Rundfunk", beschreibung: "Beitrag, Verteilung, Gehälter", syn: ["rundfunk", "öffentlich rechtlich", "örr", "gez", "rundfunkbeitrag", "ard", "zdf", "intendant", "beitragsservice"] },
  { path: "/zahlen/kriminalitaet", titel: "Kriminalität", beschreibung: "Polizeiliche Kriminalstatistik", syn: ["kriminalität", "straftaten", "verbrechen", "polizei", "pks", "kriminalstatistik", "gewalt", "messer", "diebstahl"] },
  { path: "/zahlen/bevoelkerung", titel: "Bevölkerung", beschreibung: "Einwohner, Geburten, Wanderung", syn: ["bevölkerung", "einwohner", "geburten", "demografie", "sterbefälle", "zuwanderung"] },
  { path: "/zahlen/wirtschaft", titel: "Wirtschaft", beschreibung: "BIP, Inflation, Arbeitslosigkeit", syn: ["wirtschaft", "bip", "inflation", "arbeitslosigkeit", "arbeitslos", "konjunktur", "preise"] },
  { path: "/zahlen/laender", titel: "Bundesländer", beschreibung: "Einwohner, Regierung, Schulden je Land", syn: ["bundesländer", "länder", "landesregierung", "ministerpräsident", "bayern", "nrw", "berlin", "sachsen", "landesschulden"] },
  { path: "/akteure/regierung", titel: "Bundesregierung · Werdegänge", beschreibung: "Lebensläufe aller Kabinettsmitglieder", syn: ["regierung", "kabinett", "minister", "kanzler", "merz", "werdegang", "lebenslauf", "biografie"] },
  { path: "/akteure/diaeten", titel: "Diäten der Abgeordneten", beschreibung: "Entschädigung, Pauschalen", syn: ["diäten", "abgeordnetengehalt", "abgeordnetenentschädigung", "mdb", "kostenpauschale"] },
  { path: "/akteure/politiker", titel: "Amtsbezüge & Nebeneinkünfte", beschreibung: "Ministergehalt, Zulagen, Lobbyregister", syn: ["amtsbezüge", "ministergehalt", "nebeneinkünfte", "lobbyregister", "funktionszulage", "gehalt"] },
  { path: "/akteure", titel: "Akteure", beschreibung: "Parteien, Sitze, Abstimmungen", syn: ["akteure", "parteien", "partei", "sitze", "abstimmung", "abstimmungen", "fraktion"] },
  { path: "/anstehend", titel: "Termine & Wahlen", beschreibung: "Wahl-Countdown, Sitzungswochen", syn: ["wahl", "wahlen", "termine", "sitzungswoche", "countdown", "landtagswahl"] },
  { path: "/mitmachen", titel: "Mitmachen", beschreibung: "Petition, Beschwerde, Auskunft", syn: ["mitmachen", "petition", "beschwerde", "auskunft", "bürger", "einwohner", "aktiv"] },
  { path: "/einstellungen", titel: "Optionen", beschreibung: "Sprache, Design, Bundesland, Benachrichtigungen", syn: ["optionen", "einstellungen", "sprache", "design", "dunkelmodus", "bundesland", "benachrichtigung"] },
  { path: "/ueber", titel: "Über Bundesmonitor", beschreibung: "Projekt, Kontakt, Spenden", syn: ["über", "impressum", "kontakt", "spenden", "spende"] },
  { path: "/rechtliches", titel: "Rechtliche Hinweise", beschreibung: "Datenschutz, Haftung, Quellen", syn: ["rechtliches", "datenschutz", "haftung", "impressum"] },
  { path: "/nib", titel: "Neu im Bundestag", beschreibung: "Live-Feed: neueste Vorgänge, Anfragen, Drucksachen", syn: ["nib", "neu im bundestag", "feed", "neu", "live", "vorgänge", "vorgang", "drucksachen", "anfragen", "aktuell"] },
  { path: "/akteure/parteien", titel: "Abgeordnete nach Fraktion", beschreibung: "Alle Mitglieder des Bundestages je Partei", syn: ["abgeordnete", "mdb", "fraktion", "parteien", "partei", "mitglieder", "bundestag", "namen"] },
  { path: "/geld/empfaenger", titel: "Wem gibt der Staat Geld?", beschreibung: "Benannte Zuschüsse an NGOs, Kultur, Ehrenamt u. a.", syn: ["empfänger", "zuschüsse", "zuwendungen", "ngo", "förderung", "kultur", "ehrenamt", "stiftungen", "wem gibt der staat geld"] },
  { path: "/geld/einnahmen", titel: "Einnahmen des Bundes", beschreibung: "Woraus sich der Haushalt speist", syn: ["einnahmen", "einnahme", "haushalt einnahmen"] },
  { path: "/status", titel: "Quellenstatus", beschreibung: "Woher die Daten kommen und ob der Abruf läuft", syn: ["status", "quellenstatus", "quellen", "verbindung", "dip", "erreichbar"] },
];

// Trefferliste: Suchbegriff gegen Titel + Synonyme (case-insensitiv).
export function searchSites(term: string): SiteEntry[] {
  const q = term.trim().toLowerCase();
  if (q.length < 2) return [];
  return SITE_INDEX.filter((e) => {
    const hay = (e.titel + " " + e.beschreibung + " " + e.syn.join(" ")).toLowerCase();
    return hay.includes(q);
  });
}
