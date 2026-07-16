// Automatische Rotation des oeffentlichen DIP-Sammelschluessels in der Gist-JSON.
// Ablauf: aktuellen Key aus dem Gist lesen -> gegen die DIP-API pruefen ->
// falls ungueltig, die (JavaScript-)Hilfeseite mit einem Headless-Browser rendern,
// Kandidaten extrahieren, gegen die API validieren, und den funktionierenden Key
// in den Gist zurueckschreiben. Laeuft in der GitHub Action (siehe
// .github/workflows/dip-key-rotate.yml).
//
// Benoetigte Env:
//   GIST_TOKEN  - GitHub-PAT mit "gist"-Scope (als Repo-Secret hinterlegen)
//   GIST_ID     - ID des Gists
//   GIST_FILE   - Dateiname im Gist (Standard: bundesmonitor-dip-key.json)
//   DIP_BASE    - DIP-API-Basis (Standard: https://search.dip.bundestag.de/api/v1)
//   DIP_HELP    - URL der DIP-Hilfeseite mit dem oeffentlichen Schluessel

import { chromium } from "playwright";

const TOKEN = process.env.GIST_TOKEN;
const GIST_ID = process.env.GIST_ID;
const GIST_FILE = process.env.GIST_FILE || "bundesmonitor-dip-key.json";
const DIP_BASE = process.env.DIP_BASE || "https://search.dip.bundestag.de/api/v1";
const DIP_HELP = process.env.DIP_HELP || "https://dip.bundestag.de/%C3%BCber-dip/hilfe/api";
const KEY_RE = /[A-Za-z0-9]{6,8}\.[A-Za-z0-9]{28,44}/g;

if (!TOKEN || !GIST_ID) {
  console.error("GIST_TOKEN und GIST_ID sind erforderlich.");
  process.exit(1);
}

const gh = (path, init = {}) =>
  fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "User-Agent": "bundesmonitor-key-rotate",
      Accept: "application/vnd.github+json",
      ...(init.headers || {}),
    },
  });

async function keyWorks(key) {
  try {
    const r = await fetch(
      `${DIP_BASE}/vorgang?f.wahlperiode=21&apikey=${encodeURIComponent(key)}`,
      { headers: { Accept: "application/json" } },
    );
    return r.ok;
  } catch {
    return false;
  }
}

// 1) Aktuellen Key aus dem Gist lesen.
const gistRes = await gh(`/gists/${GIST_ID}`);
if (!gistRes.ok) {
  console.error("Gist konnte nicht gelesen werden:", gistRes.status);
  process.exit(1);
}
const gist = await gistRes.json();
const file = gist.files?.[GIST_FILE];
if (!file) {
  console.error(`Datei ${GIST_FILE} im Gist nicht gefunden.`);
  process.exit(1);
}
const current = JSON.parse(file.content);
const currentKey = (current.dipPublicKey || "").trim();

// 2) Funktioniert der aktuelle Key noch? Dann nichts tun.
if (currentKey && (await keyWorks(currentKey))) {
  console.log("Aktueller Schluessel funktioniert - keine Rotation noetig.");
  process.exit(0);
}
console.log("Aktueller Schluessel ungueltig/leer - suche neuen auf der DIP-Hilfeseite ...");

// 3) Neuen Key aus der gerenderten SPA-Seite extrahieren.
const browser = await chromium.launch();
let candidates = [];
try {
  const page = await browser.newPage();
  await page.goto(DIP_HELP, { waitUntil: "networkidle", timeout: 60000 });
  const html = await page.content();
  const bodyText = await page.evaluate(() => document.body.innerText);
  candidates = [...new Set(`${html}\n${bodyText}`.match(KEY_RE) ?? [])];
} finally {
  await browser.close();
}

let newKey = null;
for (const c of candidates) {
  if (c === currentKey) continue;
  if (await keyWorks(c)) {
    newKey = c;
    break;
  }
}

if (!newKey) {
  console.error(
    `Kein neuer gueltiger Schluessel gefunden (${candidates.length} Kandidaten geprueft). ` +
      "Bitte manuell im Gist aktualisieren.",
  );
  process.exit(1);
}

// 4) Gist mit dem neuen Key aktualisieren.
const updated =
  JSON.stringify(
    { ...current, dipPublicKey: newKey, aktualisiert: new Date().toISOString().slice(0, 10) },
    null,
    2,
  ) + "\n";

const patch = await gh(`/gists/${GIST_ID}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ files: { [GIST_FILE]: { content: updated } } }),
});
if (!patch.ok) {
  console.error("Gist-Update fehlgeschlagen:", patch.status, await patch.text());
  process.exit(1);
}
console.log("Neuer Schluessel im Gist gespeichert. Installierte Apps ziehen automatisch nach.");
