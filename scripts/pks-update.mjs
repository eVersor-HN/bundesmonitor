// PKS-Auto-Update: laedt die amtlichen BKA-Grundtabellen (Faelle T01,
// Aufenthaltsanlass T61, Staatsangehoerigkeiten T62) mit einem echten Browser
// (Behoerdenseiten blocken plain curl), parst sie und schreibt eine fertige
// stats.json in den Gist. Die App laedt sie live (wie den DIP-Schluessel), mit
// den in statistik.ts eingebauten Werten als Fallback. Laeuft jaehrlich per
// GitHub Action. ENV: GIST_TOKEN, GIST_ID, GIST_FILE (Standard bundesmonitor-stats.json).
import { chromium } from "playwright";
import * as XLSX from "xlsx";

const TOKEN = process.env.GIST_TOKEN;
const GIST_ID = process.env.GIST_ID;
const GIST_FILE = process.env.GIST_FILE || "bundesmonitor-stats.json";
if (!TOKEN || !GIST_ID) {
  console.error("GIST_TOKEN und GIST_ID sind erforderlich.");
  process.exit(1);
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const TV =
  "https://www.bka.de/SharedDocs/Downloads/DE/Publikationen/PolizeilicheKriminalstatistik/2024/Bund/Tatverdaechtige/";
const FAELLE =
  "https://www.bka.de/SharedDocs/Downloads/DE/Publikationen/PolizeilicheKriminalstatistik/2024/Bund/Faelle/";
const SOURCES = {
  t01: FAELLE + "BU-F-01-T01-Faelle_xls.xlsx?__blob=publicationFile&v=3",
  t61: TV + "BU-TV-23-T61-TV-nichtdeutsch-Aufenthaltsanlass_xls.xlsx?__blob=publicationFile&v=5",
  t62: TV + "BU-TV-22-T62-TV-Staatsangehoerigkeiten_xls.xlsx?__blob=publicationFile&v=2",
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA, locale: "de-DE" });
async function warmup(url) {
  const p = await ctx.newPage();
  try {
    await p.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  } catch {
    /* egal */
  }
  await p.close();
}
async function grid(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    await warmup("https://www.bka.de/DE/Home/home_node.html");
    try {
      const resp = await ctx.request.get(url, { timeout: 45000 });
      if (resp.ok()) {
        const buf = await resp.body();
        const wb = XLSX.read(buf, { type: "buffer" });
        return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true });
      }
    } catch (e) {
      console.log(`GET ${url} Versuch ${attempt}: ${e.message}`);
    }
  }
  throw new Error("Download fehlgeschlagen: " + url);
}

const num = (v) => {
  const n = Number(String(v ?? "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

// ---- T01: Grundtabelle Faelle -> Map Schluessel -> Zeile ----
const t01rows = await grid(SOURCES.t01);
const t01 = new Map();
for (const r of t01rows) {
  const k = String(r[0] ?? "").trim();
  if (k) t01.set(k, r);
}
const faelle = (k) => num(t01.get(k)?.[2]);
const anteil = (k) => num(t01.get(k)?.[3]);
const gesamt = faelle("------");
if (!gesamt) throw new Error("T01: Gesamtzahl nicht gefunden");

// Untergruppen je Obergruppe (Schluessel + Anzeigename + optional Hinweis).
const sub = (k, label, hint) => {
  const v = faelle(k);
  return v == null ? null : hint ? { label, value: v, hint } : { label, value: v };
};
const obergruppen = [
  {
    label: "Diebstahl",
    value: faelle("****00"),
    share: anteil("****00"),
    unterposten: [
      sub("*26*00", "Ladendiebstahl", "zu rund 89 % aufgeklärt."),
      sub("***300", "Fahrraddiebstahl", "wird nur selten aufgeklärt."),
      sub("***500", "Diebstahl unbarer Zahlungsmittel"),
      sub("*90*00", "Taschendiebstahl"),
      sub("435*00", "Wohnungseinbruchdiebstahl", "geschätzter Schaden rund 350 Mio €."),
      sub("***100", "Diebstahl von Kraftwagen"),
      sub("***200", "Diebstahl von Mopeds und Krafträdern"),
    ].filter(Boolean),
  },
  {
    label: "Sonstige Straftatbestände (StGB)",
    value: faelle("600000"),
    share: anteil("600000"),
    unterposten: [
      sub("674000", "Sachbeschädigung"),
      sub("673000", "Beleidigung", "davon ein Teil auf sexueller Grundlage."),
      sub("620000", "Widerstand/tätlicher Angriff & Straftaten gegen die öffentliche Ordnung"),
      sub("630000", "Begünstigung, Strafvereitelung, Hehlerei"),
      sub("640000", "Brandstiftung"),
      sub("715000", "Urheberrechtsdelikte"),
      sub("676000", "Umweltstraftaten"),
    ].filter(Boolean),
  },
  {
    label: "Vermögens- und Fälschungsdelikte",
    value: faelle("500000"),
    share: anteil("500000"),
    unterposten: [
      sub("510000", "Betrug", "u. a. Waren-/Warenkreditbetrug und Erschleichen von Leistungen (Schwarzfahren)."),
      sub("530000", "Unterschlagung"),
      sub("540000", "Urkundenfälschung"),
      sub("550000", "Geld- und Wertzeichenfälschung"),
      sub("521000", "Untreue"),
    ].filter(Boolean),
  },
  {
    label: "Rohheitsdelikte & Straftaten gegen die persönliche Freiheit",
    value: faelle("200000"),
    share: anteil("200000"),
    vollstaendig: true,
    unterposten: [
      sub("220000", "Körperverletzung", "davon vorsätzliche einfache und gefährliche/schwere Körperverletzung."),
      sub("230000", "Straftaten gegen die persönliche Freiheit", "u. a. Bedrohung, Nötigung und Nachstellung/Stalking."),
      sub("210000", "Raub", "Raub, räuberische Erpressung und räuberischer Angriff auf Kraftfahrer."),
    ].filter(Boolean),
  },
  {
    label: "Strafrechtliche Nebengesetze",
    value: faelle("700000"),
    share: anteil("700000"),
    unterposten: [
      sub("725000", "Aufenthalts-, Asyl- und Freizügigkeitsgesetz", "können nur von Nichtdeutschen begangen werden."),
      sub("730000", "Rauschgiftdelikte (BtMG)", "stark gesunken durch die Cannabis-Teillegalisierung."),
      sub("726000", "Waffen-, Sprengstoff- und Kriegswaffengesetz"),
    ].filter(Boolean),
  },
  {
    label: "Straftaten gegen die sexuelle Selbstbestimmung",
    value: faelle("100000"),
    share: anteil("100000"),
    unterposten: [
      sub("130000", "Sexueller Missbrauch (§§ 176–176e, 182, 183)"),
      sub("114000", "Sexuelle Belästigung"),
      sub("111000", "Vergewaltigung / sexuelle Nötigung", "besonders schwere Fälle nach §§ 177, 178 StGB."),
    ].filter(Boolean),
  },
  {
    label: "Straftaten gegen das Leben",
    value: faelle("000000"),
    share: anteil("000000"),
    vollstaendig: true,
    unterposten: [
      sub("020000", "Totschlag und Tötung auf Verlangen", "einschließlich Versuchen."),
      sub("030000", "Fahrlässige Tötung (ohne Verkehrsunfall)"),
      sub("010000", "Mord", "einschließlich Versuchen."),
      sub("040000", "Schwangerschaftsabbruch"),
    ].filter(Boolean),
  },
];
// Kontrolle: Obergruppen muessen die Gesamtzahl exakt ergeben.
const summe = obergruppen.reduce((a, g) => a + (g.value || 0), 0);
if (Math.abs(summe - gesamt) > 5) {
  console.warn(`WARNUNG: Obergruppen-Summe ${summe} != Gesamt ${gesamt} (Differenz ${gesamt - summe}).`);
}
for (const g of obergruppen) if (g.value == null) throw new Error("Obergruppe ohne Wert: " + g.label);

// Tatverdaechtige-Gesamt aus T01 (col 15 TV insg, col 18 Nichtdeutsch).
const tvRow = t01.get("------");
const tvGesamt = num(tvRow?.[15]);
const tvNichtdeutsch = num(tvRow?.[18]);
const tvDeutsch = tvGesamt != null && tvNichtdeutsch != null ? tvGesamt - tvNichtdeutsch : null;
const anteilNd = num(tvRow?.[19]);

// ---- T61: nichtdeutsche TV nach Aufenthaltsstatus (Zeile ------, Sexus X) ----
const t61rows = await grid(SOURCES.t61);
const t61x = t61rows.find((r) => String(r[0] ?? "").trim() === "------" && String(r[2] ?? "").trim() === "X");
const aufenthalt = t61x
  ? [
      {
        label: "Erlaubter Aufenthalt",
        value: num(t61x[8]),
        hint: `u. a. Arbeit/Studium/EU-Freizügigkeit (${(num(t61x[12]) ?? 0).toLocaleString("de-DE")}), Asylbewerber (${(num(t61x[9]) ?? 0).toLocaleString("de-DE")}), anerkannte Schutzberechtigte (${(num(t61x[10]) ?? 0).toLocaleString("de-DE")}), Duldung (${(num(t61x[11]) ?? 0).toLocaleString("de-DE")}).`,
      },
      {
        label: "Unerlaubter Aufenthalt",
        value: num(t61x[7]),
        hint: "Aufenthaltsstatus der Tatverdächtigen über alle Delikte – nicht die Straftat „unerlaubter Aufenthalt“ selbst.",
      },
      { label: "Kein Aufenthalt in Deutschland", value: num(t61x[6]), hint: "Touristinnen/Touristen und Durchreisende." },
    ].filter((x) => x.value != null)
  : [];

// ---- T62: TV nach Nationalitaet (Header-Zeile + Zeile ------), Top 10 ----
const t62rows = await grid(SOURCES.t62);
const hdr = t62rows.find((r) => String(r[3] ?? "").includes("Deutschland"));
const totRow = t62rows.find((r) => String(r[0] ?? "").trim() === "------");
let nationalitaeten = [];
if (hdr && totRow) {
  const pairs = [];
  for (let j = 5; j < hdr.length; j++) {
    const name = String(hdr[j] ?? "").trim();
    const v = num(totRow[j]);
    if (name && v && v > 0) pairs.push({ label: name, value: v });
  }
  pairs.sort((a, b) => b.value - a.value);
  nationalitaeten = pairs.slice(0, 10);
}

const stats = {
  quelle: "Bundeskriminalamt – Polizeiliche Kriminalstatistik (Grundtabellen T01/T61/T62), automatisch geholt",
  kriminalitaet: {
    year: 2024,
    gesamt,
    aufklaerungProzent: num(tvRow?.[14]),
    aufgeklaert: faelle("------") != null ? num(t01.get("------")?.[13]) : null,
    obergruppen: obergruppen.map((g) => ({
      label: g.label,
      value: g.value,
      share: g.share,
      ...(g.vollstaendig ? { vollstaendig: true } : {}),
      unterposten: g.unterposten,
    })),
    gewaltkriminalitaet: faelle("892000"),
    tatverdaechtige: {
      gesamt: tvGesamt,
      deutsch: tvDeutsch,
      nichtdeutsch: tvNichtdeutsch,
      anteilNichtdeutschProzent: anteilNd,
      nichtdeutschNationalitaet: nationalitaeten,
      nichtdeutschAufenthalt: aufenthalt,
    },
  },
};

await browser.close();

// ---- In den Gist schreiben ----
const content = JSON.stringify(stats, null, 2);
console.log("Erzeugte stats.json:\n", content.slice(0, 1200), "\n…");
const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "User-Agent": "bundesmonitor-pks-update",
    Accept: "application/vnd.github+json",
  },
  body: JSON.stringify({ files: { [GIST_FILE]: { content } } }),
});
if (!res.ok) {
  console.error("Gist-Update fehlgeschlagen:", res.status, await res.text());
  process.exit(1);
}
console.log(`Gist aktualisiert: ${GIST_FILE} (${content.length} Bytes).`);
