// Glossar: kurze, neutrale Erklaerungen von Fachbegriffen in Alltagssprache.
// Wird von der Begriff-Komponente (Tipp-Popup) verwendet.

export const GLOSSAR: Record<string, { titel: string; text: string }> = {
  nettokreditaufnahme: {
    titel: "Nettokreditaufnahme",
    text: "Die neuen Schulden eines Jahres: aufgenommene Kredite minus zurückgezahlte Kredite. Kurz: um so viel wächst der Schuldenberg.",
  },
  kernhaushalt: {
    titel: "Kernhaushalt",
    text: "Der „normale“ Bundeshaushalt, den der Bundestag jährlich beschließt – ohne die separaten Sondervermögen.",
  },
  sondervermoegen: {
    titel: "Sondervermögen",
    text: "Ein Geldtopf neben dem normalen Haushalt, per Gesetz für einen festen Zweck eingerichtet (z. B. Infrastruktur oder Bundeswehr). Wird meist über eigene Kredite gefüllt.",
  },
  einzelplan: {
    titel: "Einzelplan",
    text: "Ein Kapitel des Bundeshaushalts – in der Regel das Budget eines Ministeriums oder Verfassungsorgans. Es gibt rund 25 Einzelpläne.",
  },
  soll: {
    titel: "Soll",
    text: "Der geplante Betrag im Haushaltsgesetz. Was am Ende wirklich fließt, heißt „Ist“ – Bundesmonitor hält beides strikt auseinander.",
  },
  ist: {
    titel: "Ist",
    text: "Der tatsächlich eingenommene oder ausgegebene Betrag – im Nachhinein festgestellt. Gegenstück zum geplanten „Soll“.",
  },
  hochrechnung: {
    titel: "Hochrechnung",
    text: "Eine rechnerische Fortschreibung: Der letzte amtliche Wert wird gleichmäßig weitergezählt. Keine Echtzeit-Messung – der echte Verlauf schwankt.",
  },
  schuldenquote: {
    titel: "Schuldenquote",
    text: "Schulden im Verhältnis zur jährlichen Wirtschaftsleistung (BIP). Macht Schulden zwischen Ländern und über die Zeit vergleichbar.",
  },
  bip: {
    titel: "BIP",
    text: "Bruttoinlandsprodukt: der Wert aller Waren und Dienstleistungen, die in einem Jahr im Land erwirtschaftet werden.",
  },
  gemeinschaftsteuern: {
    titel: "Gemeinschaftsteuern",
    text: "Steuern, deren Ertrag sich Bund, Länder und teils Gemeinden nach festen Schlüsseln teilen – z. B. Einkommen- und Umsatzsteuer. Der größte Block aller Steuereinnahmen.",
  },
  koerperschaftsteuer: {
    titel: "Körperschaftsteuer",
    text: "Die „Einkommensteuer“ für Kapitalgesellschaften wie GmbH und AG: 15 % auf den Gewinn.",
  },
  kapitalertragsteuer: {
    titel: "Kapitalertragsteuer",
    text: "Steuer auf Kapitalerträge wie Zinsen und Dividenden, meist 25 % („Abgeltungsteuer“), direkt von der Bank einbehalten.",
  },
  baukostenzuschuss: {
    titel: "Baukostenzuschuss",
    text: "Geld des Bundes an die Bahn-Infrastrukturgesellschaft für Erhalt und Ausbau des Schienennetzes – ein Zuschuss, kein Kredit.",
  },
  ertms: {
    titel: "ERTMS",
    text: "Europäisches Zugsicherungssystem: digitale Technik, die Züge überwacht und stoppt. Ersetzt nach und nach die alte Signaltechnik.",
  },
  kef: {
    titel: "KEF",
    text: "Unabhängige Kommission zur Ermittlung des Finanzbedarfs der Rundfunkanstalten: prüft die Anmeldungen von ARD, ZDF und Deutschlandradio und empfiehlt den Ländern die Beitragshöhe.",
  },
  rundfunkbeitrag: {
    titel: "Rundfunkbeitrag",
    text: "18,36 € pro Wohnung und Monat, unabhängig von Geräten. Keine Steuer: Er fließt nicht in den Staatshaushalt, sondern direkt an die Rundfunkanstalten.",
  },
  staatsvertrag: {
    titel: "Staatsvertrag",
    text: "Ein Vertrag zwischen Bundesländern (nicht dem Bund!). Der öffentlich-rechtliche Rundfunk beruht auf solchen Verträgen aller 16 Länder.",
  },
  drucksache: {
    titel: "Drucksache",
    text: "Offizielles Parlamentsdokument mit eindeutiger Nummer (z. B. 21/600) – etwa ein Gesetzentwurf, Antrag oder Bericht.",
  },
  lesung: {
    titel: "Lesung",
    text: "Beratungsrunde eines Gesetzentwurfs im Bundestag. Üblich sind drei Lesungen; nach der dritten wird abgestimmt.",
  },
  bundesrat: {
    titel: "Bundesrat",
    text: "Die Vertretung der 16 Landesregierungen. Viele Gesetze brauchen seine Zustimmung, bevor sie in Kraft treten können.",
  },
  vorgang: {
    titel: "Vorgang",
    text: "Ein parlamentarisches Verfahren von Anfang bis Ende – z. B. der komplette Weg eines Gesetzes mit allen Stationen.",
  },
  ktf: {
    titel: "KTF",
    text: "Klima- und Transformationsfonds: Sondervermögen des Bundes für Klimaschutz und Umbau der Wirtschaft, z. B. Gebäudeförderung und Halbleiterwerke.",
  },
};
