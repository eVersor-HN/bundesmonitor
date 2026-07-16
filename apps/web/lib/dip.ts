// Client-seitiger DIP-Zugriff: Die App spricht die DIP-API des Bundestages
// (https://search.dip.bundestag.de/api/v1) direkt an, ohne eigenen Server. Die
// hier enthaltenen Parser sind eine 1:1-Portierung der serverseitigen reinen
// Funktionen aus packages/core/.../dip/parser.py, damit dieselbe, getestete
// DIP -> Feed-Abbildung im Browser laeuft.
//
// Es werden keine Fakten erfunden: fehlende Felder bleiben null, der Status wird
// unveraendert aus `beratungsstand` uebernommen (CLAUDE.md Regel 5/7).
//
// CORS: In der Capacitor-WebView routet das CapacitorHttp-Plugin `fetch` nativ
// am Browser-CORS vorbei (siehe capacitor.config.ts). Im reinen Browser (Dev)
// kann DIP per CORS blockieren - die App wird nur als Android-APK ausgeliefert.

import { getDipBase, getDipKey } from "./config";
import type {
  FeedItem,
  FeedResponse,
  MatterDetail,
  MatterDocument,
  Stats,
  TimelineEvent,
  Topic,
  TopicCount,
} from "./types";

// ---------------------------------------------------------------------------
// Rohtypen der DIP-Antwort (nur die tatsaechlich genutzten Felder).
// ---------------------------------------------------------------------------

interface DipDeskriptor {
  name?: string;
  typ?: string;
}

interface DipVorgangRaw {
  id: string | number;
  titel?: string;
  abstract?: string;
  vorgangstyp?: string;
  beratungsstand?: string;
  aktualisiert?: string;
  datum?: string;
  gesta?: string;
  sachgebiet?: string[];
  deskriptor?: DipDeskriptor[];
  initiative?: string[];
}

// Fundstelle einer Vorgangsposition: Verweis auf die zugehoerige Drucksache bzw.
// das Plenarprotokoll (Nummer, Typ, Herausgeber, PDF). Das ist die einzige
// vorgangsscharfe Dokumentquelle - der DIP-Filter f.vorgang wird auf /drucksache
// ignoriert (liefert die gesamte Drucksachen-Datenbank), auf /vorgangsposition
// wirkt er dagegen korrekt.
interface DipFundstelle {
  dokumentnummer?: string;
  datum?: string;
  dokumentart?: string;
  drucksachetyp?: string;
  herausgeber?: string;
  pdf_url?: string;
}

interface DipVorgangspositionRaw {
  id: string | number;
  vorgang_id?: string | number;
  vorgangsposition?: string;
  titel?: string;
  datum?: string;
  aktualisiert?: string;
  fundstelle?: DipFundstelle | null;
}

interface DipListResponse<T> {
  numFound?: number;
  documents?: T[];
  cursor?: string;
}

// ---------------------------------------------------------------------------
// Textnormalisierung (Port aus parser.py: _norm / slugify / _dip_slug).
// ---------------------------------------------------------------------------

// Entspricht Pythons NFKD + encode("ascii","ignore"): Kombizeichen aus der
// NFKD-Zerlegung entfernen und alle verbliebenen Nicht-ASCII-Zeichen verwerfen
// (z. B. bleibt "ä" -> "a", "ß" faellt weg).
function toAscii(value: string): string {
  // Wie Pythons NFKD + encode("ascii","ignore"): NFKD-Kombizeichen (U+0300-036F)
  // und alle uebrigen Nicht-ASCII-Zeichen (z. B. ss) verwerfen.
  let out = "";
  for (const ch of value.normalize("NFKD")) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x0300 && code <= 0x036f) continue;
    if (code > 0x7f) continue;
    out += ch;
  }
  return out;
}

function norm(value: string): string {
  return toAscii(value).toLowerCase();
}

// Topic-Key-Slug (parser.py: slugify). NFKD/ASCII, lowercase, nicht-alnum -> '-'.
export function slugify(text: string, maxLength = 60): string {
  const ascii = toAscii(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii.slice(0, maxLength).replace(/^-+|-+$/g, "");
}

// Web-URL-Slug (ingest.py: _dip_slug). Umlaute explizit transliterieren, damit
// die DIP-SPA-Route /vorgang/<slug>/<id> matcht. Der Slug ist beliebig,
// entscheidend ist die ID.
function dipWebSlug(titel: string | null | undefined): string {
  let text = (titel ?? "").toLowerCase();
  for (const [src, dst] of [
    ["ä", "ae"],
    ["ö", "oe"],
    ["ü", "ue"],
    ["ß", "ss"],
  ] as const) {
    text = text.split(src).join(dst);
  }
  const slug = text
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "vorgang";
}

export function dipWebVorgangUrl(id: string, titel?: string | null): string {
  return `https://dip.bundestag.de/vorgang/${dipWebSlug(titel)}/${id}`;
}

export function dipWebDrucksacheUrl(id: string, titel?: string | null): string {
  return `https://dip.bundestag.de/drucksache/${dipWebSlug(titel)}/${id}`;
}

// ---------------------------------------------------------------------------
// Vokabular-Abbildungen (parser.py: _MATTER_TYPE_MAP / _PARTY_PATTERNS / ...).
// ---------------------------------------------------------------------------

const MATTER_TYPE_MAP: [string, string][] = [
  ["gesetzgebung", "gesetzgebung"],
  ["antrag", "antrag"],
  // NFKD faltet 'ue' zu 'u': "Wahlpruefungsverfahren" -> "wahlprufungsverfahren".
  ["wahlprufung", "wahlpruefung"],
];

export function mapMatterType(vorgangstyp?: string | null): string {
  if (!vorgangstyp) return "sonstiges";
  const key = norm(vorgangstyp);
  for (const [needle, mt] of MATTER_TYPE_MAP) {
    if (key.includes(needle)) return mt;
  }
  if (key.includes("anfrage")) return "anfrage";
  if (key.includes("bericht") || key.includes("unterrichtung")) return "bericht";
  if (key.includes("antrag")) return "antrag";
  return "sonstiges";
}

// Reihenfolge beachtet Teilstrings (spezifischer zuerst).
const PARTY_PATTERNS: [string, string][] = [
  ["cdu/csu", "CDU/CSU"],
  ["christlich demokratische", "CDU/CSU"],
  ["christlich-soziale", "CDU/CSU"],
  ["bundnis 90", "Grüne"],
  ["grunen", "Grüne"],
  ["grune", "Grüne"],
  ["sozialdemokratische", "SPD"],
  ["spd", "SPD"],
  ["alternative fur deutschland", "AfD"],
  ["afd", "AfD"],
  ["die linke", "Die Linke"],
  ["freie demokratische", "FDP"],
  ["fdp", "FDP"],
  ["bsw", "BSW"],
];

export function partyFromInitiative(value: string): string | null {
  const key = norm(value);
  for (const [needle, party] of PARTY_PATTERNS) {
    if (key.includes(needle)) return party;
  }
  return null;
}

function positionEventType(step: string): string {
  const key = norm(step);
  if (key.includes("verkundung")) return "promulgated";
  if (key.includes("beschlussempfehlung") || key.includes("ausschuss") || key.includes("uberweisung"))
    return "referred_to_committee";
  if (key.includes("abstimmung") || key.includes("wahl")) return "vote_held";
  if (key.includes("anfrage") || key.includes("frage") || key.includes("antrag")) return "submitted";
  return "status_updated";
}

// ---------------------------------------------------------------------------
// Themen aus einem Vorgang ableiten (parser.py: parse_vorgang, Topics-Teil).
// Topic-Key = `${scheme}:${slugify(label)}` (identisch zur Serverkonvention).
// ---------------------------------------------------------------------------

function topicsFromVorgang(raw: DipVorgangRaw): Topic[] {
  const topics: Topic[] = [];
  const push = (scheme: string, label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    topics.push({ scheme, key: `${scheme}:${slugify(trimmed)}`, label: trimmed });
  };
  for (const sg of raw.sachgebiet ?? []) {
    if (typeof sg === "string") push("sachgebiet", sg);
  }
  for (const desk of raw.deskriptor ?? []) {
    if (desk && typeof desk.name === "string") {
      // Geografische Deskriptoren als eigenes Schema 'ort' (fuer Ortsfilter).
      const typ = String(desk.typ ?? "");
      push(typ.includes("eogr") ? "ort" : "deskriptor", desk.name);
    }
  }
  for (const ini of raw.initiative ?? []) {
    if (typeof ini === "string") {
      const party = partyFromInitiative(ini);
      if (party) push("partei", party);
    }
  }
  return topics;
}

// ---------------------------------------------------------------------------
// DIP-Rohobjekt -> App-Formate.
// ---------------------------------------------------------------------------

// Stabiler, eindeutiger Ereignis-Schluessel (parser.py dedupe_key). Dient in der
// UI als event_id (React-Key, "zuletzt gesehen"-Marke).
function vorgangEventId(id: string, aktualisiert?: string): string {
  return `dip:vorgang:${id}:${aktualisiert ?? ""}`;
}

export function vorgangSlug(raw: DipVorgangRaw): string {
  const id = String(raw.id);
  const titel = (raw.titel ?? "").trim();
  return `${slugify(titel) || "vorgang"}-${id}`;
}

// Die numerische DIP-ID aus einem Slug `...-<id>` zuruecklesen.
export function idFromSlug(slug: string): string | null {
  const m = /(\d+)$/.exec(slug);
  return m ? m[1] : null;
}

export function vorgangToFeedItem(raw: DipVorgangRaw): FeedItem {
  const id = String(raw.id);
  const titel = (raw.titel ?? "").trim() || `Vorgang ${id}`;
  const status = raw.beratungsstand ? String(raw.beratungsstand) : null;
  return {
    event_id: vorgangEventId(id, raw.aktualisiert),
    event_type: "status_updated",
    title: titel,
    status_after: status,
    published_at: raw.aktualisiert ?? null,
    occurred_at: raw.datum ?? null,
    // Kein eigenes Entdeckungsdatum ohne Server: bestmoegliche Naeherung ist die
    // Aktualisierungszeit der Quelle (nicht raten, CLAUDE.md Regel 7).
    discovered_at: raw.aktualisiert ?? raw.datum ?? "",
    source_name: "Bundestag DIP",
    source_url: dipWebVorgangUrl(id, titel),
    matter_slug: vorgangSlug(raw),
    matter_title: titel,
    matter_type: mapMatterType(raw.vorgangstyp),
    current_status: status,
    topics: topicsFromVorgang(raw),
  };
}

export function vorgangToMatterDetail(raw: DipVorgangRaw): MatterDetail {
  const id = String(raw.id);
  const titel = (raw.titel ?? "").trim() || `Vorgang ${id}`;
  const identifiers = [{ scheme: "dip_vorgang", value: id, issuer: "DIP" }];
  if (raw.gesta) identifiers.push({ scheme: "gesta", value: String(raw.gesta), issuer: "DIP" });
  return {
    slug: vorgangSlug(raw),
    title: titel,
    short_title: titel ? titel.slice(0, 200) : null,
    description: raw.abstract ? String(raw.abstract) : null,
    matter_type: mapMatterType(raw.vorgangstyp),
    current_status: raw.beratungsstand ? String(raw.beratungsstand) : null,
    first_seen_at: raw.datum ?? raw.aktualisiert ?? "",
    last_event_at: raw.aktualisiert ?? null,
    topics: topicsFromVorgang(raw),
    identifiers,
  };
}

export function vorgangspositionToTimeline(raw: DipVorgangspositionRaw): TimelineEvent {
  const id = String(raw.id);
  const step = (raw.vorgangsposition ?? "").trim() || "Vorgangsschritt";
  const titel = (raw.titel ?? step).trim();
  return {
    event_id: `dip:vp:${id}:${raw.aktualisiert ?? ""}`,
    event_type: positionEventType(step),
    title: titel,
    status_after: null,
    published_at: raw.aktualisiert ?? null,
    occurred_at: raw.datum ?? null,
    source_url: null,
  };
}

// Dokument aus der Fundstelle einer Vorgangsposition. Gibt null zurueck, wenn die
// Position kein Dokument referenziert (nichts anzuzeigen/zu verlinken).
export function fundstelleToDocument(raw: DipVorgangspositionRaw): MatterDocument | null {
  const f = raw.fundstelle;
  if (!f || typeof f !== "object") return null;
  if (!f.pdf_url && !f.dokumentnummer) return null;
  return {
    title: raw.titel ?? null,
    document_type: f.drucksachetyp ?? f.dokumentart ?? null,
    document_number: f.dokumentnummer ?? null,
    publisher: f.herausgeber ?? null,
    document_date: f.datum ?? raw.datum ?? null,
    url: f.pdf_url ?? null,
  };
}

// ---------------------------------------------------------------------------
// DIP-HTTP-Client.
// ---------------------------------------------------------------------------

// Standard-Timeout fuer DIP-Abrufe. Eigene kleine Kopie statt Import aus api.ts,
// weil api.ts bereits aus dieser Datei importiert (Import-Zyklus vermeiden).
const FETCH_TIMEOUT_MS = 10_000;

// fetch mit hartem Timeout ueber einen AbortController: haengt das Netz (mobil),
// bricht der Abruf nach FETCH_TIMEOUT_MS ab und die Rejection propagiert normal
// (Aufrufer/Cache-Fallback greifen). Der Timer wird immer geraeumt.
async function fetchWithTimeout(
  url: string,
  opts: RequestInit = {},
  ms: number = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export class DipError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "DipError";
  }
}

function buildUrl(path: string, params: Record<string, string | number | undefined>): string {
  const base = getDipBase();
  const url = new URL(`${base}${path.startsWith("/") ? path : `/${path}`}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }
  // DIP erwartet den Schluessel als Query-Parameter `apikey`.
  url.searchParams.set("apikey", getDipKey());
  return url.toString();
}

async function dipGet<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  const res = await fetchWithTimeout(buildUrl(path, params), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new DipError(`DIP HTTP ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}

// Liste mit Cursor-Pagination. Gibt Rohdokumente + naechsten Cursor zurueck.
async function dipList<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  cursor?: string,
): Promise<{ documents: T[]; cursor: string | null }> {
  const data = await dipGet<DipListResponse<T>>(path, { ...params, cursor });
  const documents = data.documents ?? [];
  // DIP-Konvention: unveraenderter Cursor bedeutet "keine weiteren Ergebnisse".
  const next = data.cursor && data.cursor !== cursor ? data.cursor : null;
  return { documents, cursor: next };
}

// Validierung im Onboarding: prueft, ob der Schluessel gegen DIP funktioniert.
export interface DipKeyCheck {
  ok: boolean;
  status: number;
  message: string;
}

export async function checkDipKey(): Promise<DipKeyCheck> {
  try {
    await dipGet<DipListResponse<DipVorgangRaw>>("/vorgang", { "f.wahlperiode": 21 });
    return { ok: true, status: 200, message: "Schlüssel gültig" };
  } catch (e) {
    if (e instanceof DipError) {
      const message =
        e.status === 401 || e.status === 403
          ? "Schlüssel ungültig oder abgelaufen"
          : `DIP-Fehler ${e.status}`;
      return { ok: false, status: e.status, message };
    }
    return { ok: false, status: 0, message: "DIP nicht erreichbar" };
  }
}

// ---------------------------------------------------------------------------
// Oeffentlichen Schluessel live holen (kein Schluessel im APK eingebettet).
// ---------------------------------------------------------------------------

// Kleine JSON mit dem aktuellen oeffentlichen Sammelschluessel (vom Betreiber
// gepflegt). So liegt KEIN Schluessel im APK und er bleibt bei Key-Rotation
// aktuell, ohne neue App-Version. Format: { "dipPublicKey": "..." }.
// Ueber NEXT_PUBLIC_DIP_KEY_URL ueberschreibbar.
const DIP_KEY_JSON_URL =
  process.env.NEXT_PUBLIC_DIP_KEY_URL ||
  "https://gist.githubusercontent.com/eVersor-HN/6c22721add6106ec69d572f9d33e68a7/raw/bundesmonitor-dip-key.json";

// Prueft einen konkreten Schluessel direkt gegen die DIP-API.
async function keyWorks(key: string): Promise<boolean> {
  try {
    const url = new URL(`${getDipBase()}/vorgang`);
    url.searchParams.set("f.wahlperiode", "21");
    url.searchParams.set("apikey", key);
    const res = await fetchWithTimeout(url.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Holt den aktuellen oeffentlichen DIP-Schluessel aus der gepflegten JSON und
// gibt ihn zurueck, wenn er gegen die API funktioniert - sonst null.
export async function fetchPublicDipKey(): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(DIP_KEY_JSON_URL, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { dipPublicKey?: string };
    const key = (data?.dipPublicKey ?? "").trim();
    if (!key) return null;
    return (await keyWorks(key)) ? key : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Hoehere Abrufe im App-Format.
// ---------------------------------------------------------------------------

export interface DipFeedParams {
  cursor?: string;
  limit?: number;
  text?: string;
  topics?: string[];
  parties?: string[];
  bundeslaender?: string[];
  matterTypes?: string[];
}

// Chronologischer Feed direkt aus /vorgang (neueste zuerst). Server-Filter, die
// DIP nicht 1:1 kennt (Partei/Ort/Thema/Typ/Volltext), werden auf der geladenen
// Seite clientseitig angewandt - bewusste Naeherung des serverlosen Betriebs.
export async function dipFetchFeed(params: DipFeedParams): Promise<FeedResponse> {
  const limit = params.limit ?? 30;

  const wanted = (set?: string[]) => (set && set.length ? new Set(set) : null);
  const topicSet = wanted(params.topics);
  const partySet = wanted(params.parties);
  const ortSet = wanted(params.bundeslaender);
  const typeSet = wanted(params.matterTypes);
  const text = params.text?.trim().toLowerCase();
  const hasFilter = !!(topicSet || partySet || ortSet || typeSet || text);

  const matches = (it: FeedItem): boolean => {
    if (topicSet && !it.topics.some((t) => topicSet.has(t.key))) return false;
    if (partySet && !it.topics.some((t) => t.scheme === "partei" && partySet.has(t.key)))
      return false;
    if (ortSet && !it.topics.some((t) => t.scheme === "ort" && ortSet.has(t.key))) return false;
    if (typeSet && !(it.matter_type && typeSet.has(it.matter_type))) return false;
    if (
      text &&
      !(
        it.title.toLowerCase().includes(text) ||
        (it.matter_title ?? "").toLowerCase().includes(text)
      )
    )
      return false;
    return true;
  };

  // Ueber Cursor-Seiten sammeln, bis genug (gefilterte) Items da sind - und den
  // Cursor der ZULETZT geladenen Seite zurueckgeben. So werden keine Vorgaenge
  // uebersprungen (frueher wurde eine 100er-Seite auf `limit` beschnitten, der
  // 100er-Cursor aber weitergereicht -> ~75 % gingen verloren).
  const items: FeedItem[] = [];
  let cursor = params.cursor;
  let nextCursor: string | null = null;
  let pages = 0;
  const MAX_PAGES = hasFilter ? 8 : 1;
  do {
    const page = await dipList<DipVorgangRaw>("/vorgang", { "f.wahlperiode": 21 }, cursor);
    pages += 1;
    for (const raw of page.documents) {
      const it = vorgangToFeedItem(raw);
      if (matches(it)) items.push(it);
    }
    nextCursor = page.cursor;
    cursor = page.cursor ?? undefined;
  } while (nextCursor && items.length < limit && pages < MAX_PAGES);

  // DIP liefert /vorgang nicht streng nach Aktualisierungszeit (eher nach
  // Vorgangs-ID), die Karte zeigt aber published_at (= aktualisiert). Ohne
  // explizite Sortierung "springen" die Daten (z. B. 14., 14., 13., 14., ...).
  // Deshalb strikt nach published_at absteigend, event_id als stabiler Tiebreak.
  items.sort(
    (a, b) =>
      (b.published_at ?? "").localeCompare(a.published_at ?? "") ||
      b.event_id.localeCompare(a.event_id),
  );

  return {
    items,
    next_cursor: nextCursor,
    generated_at: new Date().toISOString(),
  };
}

export async function dipFetchMatter(slug: string): Promise<MatterDetail | null> {
  const id = idFromSlug(slug);
  if (!id) return null;
  const raw = await dipGet<DipVorgangRaw>(`/vorgang/${id}`);
  return vorgangToMatterDetail(raw);
}

// Vorgangspositionen einer Vorgang-ID. Zeitleiste UND Dokumente leiten sich aus
// derselben /vorgangsposition-Abfrage ab; frueher holten beide sie getrennt, was
// beim Oeffnen eines Vorgangs zwei identische Round-Trips ausloeste. Ein kleiner
// In-Modul-Cache (mit Dedup laufender Abrufe) macht daraus EINEN Abruf.
const vpCache = new Map<string, { ts: number; docs: DipVorgangspositionRaw[] }>();
const vpInflight = new Map<string, Promise<DipVorgangspositionRaw[]>>();
const VP_TTL_MS = 60_000;

async function fetchVorgangspositionen(id: string): Promise<DipVorgangspositionRaw[]> {
  const cached = vpCache.get(id);
  if (cached && Date.now() - cached.ts < VP_TTL_MS) return cached.docs;
  const existing = vpInflight.get(id);
  if (existing) return existing;
  const p = dipList<DipVorgangspositionRaw>("/vorgangsposition", { "f.vorgang": id })
    .then(({ documents }) => {
      vpCache.set(id, { ts: Date.now(), docs: documents });
      return documents;
    })
    .finally(() => vpInflight.delete(id));
  vpInflight.set(id, p);
  return p;
}

export async function dipFetchTimeline(slug: string): Promise<TimelineEvent[]> {
  const id = idFromSlug(slug);
  if (!id) return [];
  const documents = await fetchVorgangspositionen(id);
  return documents
    .map(vorgangspositionToTimeline)
    .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
}

export async function dipFetchDocuments(slug: string): Promise<MatterDocument[]> {
  const id = idFromSlug(slug);
  if (!id) return [];
  // DIP ignoriert f.vorgang auf /drucksache (liefert die gesamte Datenbank).
  // Vorgangsscharf sind nur die Fundstellen der Vorgangspositionen (dort wirkt
  // der Filter). Mehrfach referenzierte Drucksachen werden dedupliziert.
  const documents = await fetchVorgangspositionen(id);
  const seen = new Set<string>();
  const docs: MatterDocument[] = [];
  for (const pos of documents) {
    const doc = fundstelleToDocument(pos);
    if (!doc) continue;
    const key = doc.url ?? doc.document_number ?? "";
    if (seen.has(key)) continue;
    seen.add(key);
    docs.push(doc);
  }
  return docs.sort((a, b) => (b.document_date ?? "").localeCompare(a.document_date ?? ""));
}

// ---------------------------------------------------------------------------
// Pragmatischer Mix: Aggregate, die es serverlos nicht exakt gibt.
// ---------------------------------------------------------------------------

// Reine Trefferzahl (numFound) einer DIP-Abfrage ohne die Dokumente zu laden.
async function dipNumFound(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<number> {
  const data = await dipGet<DipListResponse<unknown>>(path, params);
  return data.numFound ?? 0;
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 19);
}

// Statistik-Kacheln aus DIP-Trefferzahlen (Gesamtzahlen sind exakt, nicht auf
// die aktuelle Wahlperiode begrenzt). events ~ matters (>= 1 Ereignis je Vorgang);
// laws_promulgated ist serverlos nicht exakt bestimmbar und bleibt 0.
export async function dipStats(): Promise<Stats> {
  const [matters, documents, events7d] = await Promise.all([
    dipNumFound("/vorgang"),
    dipNumFound("/drucksache"),
    dipNumFound("/vorgang", { "f.aktualisiert.start": isoDaysAgo(7) }),
  ]);
  return {
    matters,
    events: matters,
    events_7d: events7d,
    laws_promulgated: 0,
    documents,
  };
}

// Themen-Counts aus einer aktuellen Feed-Seite annaehern (nur ueber Sichtbares,
// keine Gesamtaggregation). Optionaler Schema-Filter (sachgebiet/deskriptor/ort/
// partei). Count = Haeufigkeit auf der geladenen Seite.
export async function dipTopicCounts(scheme?: string, sample = 200): Promise<TopicCount[]> {
  const { documents } = await dipList<DipVorgangRaw>("/vorgang", {
    "f.wahlperiode": 21,
  });
  const counts = new Map<string, TopicCount>();
  for (const raw of documents.slice(0, sample)) {
    for (const t of topicsFromVorgang(raw)) {
      if (scheme && t.scheme !== scheme) continue;
      const existing = counts.get(t.key);
      if (existing) existing.matter_count += 1;
      else counts.set(t.key, { key: t.key, scheme: t.scheme, label: t.label, matter_count: 1 });
    }
  }
  return [...counts.values()].sort((a, b) => b.matter_count - a.matter_count);
}

// ---------------------------------------------------------------------------
// Abgeordnete (MdB) aus DIP /person - nach Fraktion gruppiert.
// ---------------------------------------------------------------------------

// Die /person-Liste liefert funktion/fraktion als Arrays DIREKT am Objekt
// (kein person_roles in der Listenantwort – das gibt es nur im Detail).
interface DipPersonRaw {
  id: string | number;
  titel?: string;
  vorname?: string;
  nachname?: string;
  funktion?: string[];
  fraktion?: string[];
  wahlperiode?: number[];
}

export interface MdB {
  id: string;
  name: string;
  fraktion: string;
  rolle: string;
}

export interface FraktionGruppe {
  fraktion: string;
  slug: string;
  count: number;
  mdbs: MdB[];
}

// Rohbezeichnung der Fraktion auf einen kompakten Anzeigenamen bringen.
function normFraktion(raw: string): string {
  const k = norm(raw);
  if (k.includes("cdu") || k.includes("csu")) return "CDU/CSU";
  if (k.includes("bundnis 90") || k.includes("grune") || k.includes("grunen")) return "Grüne";
  if (k.includes("sozialdemokratische") || k === "spd") return "SPD";
  if (k.includes("alternative fur deutschland") || k === "afd") return "AfD";
  if (k.includes("die linke") || k === "linke") return "Die Linke";
  if (k.includes("freie demokratische") || k === "fdp") return "FDP";
  if (k.includes("bsw")) return "BSW";
  if (k.includes("fraktionslos") || !raw.trim()) return "Fraktionslos";
  return raw.trim();
}

const WAHLPERIODE = 21;

// Alle Personen einer Wahlperiode ueber die Cursor-Seiten einsammeln (gedeckelt).
async function dipAllPersons(maxPages = 30): Promise<DipPersonRaw[]> {
  const out: DipPersonRaw[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < maxPages; i++) {
    const { documents, cursor: next } = await dipList<DipPersonRaw>(
      "/person",
      { "f.wahlperiode": WAHLPERIODE },
      cursor,
    );
    out.push(...documents);
    if (!next || documents.length === 0) break;
    cursor = next;
  }
  return out;
}

// MdB, wenn eine (Top-Level-)Funktion exakt "MdB" ist bzw. "Mitglied des
// Bundestages" lautet. funktion ist ein Array (eine Person kann mehrere haben).
// Exakter Vergleich, damit "MdBR" (Mitglied des Bundesrates) NICHT mitzaehlt.
function istMdB(p: DipPersonRaw): boolean {
  return (p.funktion ?? []).some((f) => {
    const n = norm(f).trim();
    return n === "mdb" || n.includes("mitglied des bundestages");
  });
}

// Abgeordnete der laufenden Wahlperiode, nach Fraktion gruppiert (mit Cache in
// api.ts). Namen/Fraktion kommen unveraendert aus DIP.
export async function dipMdBsByFraktion(): Promise<FraktionGruppe[]> {
  const persons = await dipAllPersons();
  const seen = new Set<string>();
  const byFraktion = new Map<string, MdB[]>();
  for (const p of persons) {
    if (!istMdB(p)) continue;
    const id = String(p.id);
    if (seen.has(id)) continue;
    seen.add(id);
    const name =
      `${p.vorname ?? ""} ${p.nachname ?? ""}`.trim() ||
      (p.titel && p.titel.trim()) ||
      `Person ${id}`;
    const fraktion = normFraktion((p.fraktion ?? [])[0] ?? "");
    const mdb: MdB = { id, name, fraktion, rolle: "MdB" };
    const list = byFraktion.get(fraktion);
    if (list) list.push(mdb);
    else byFraktion.set(fraktion, [mdb]);
  }
  const groups: FraktionGruppe[] = [...byFraktion.entries()].map(([fraktion, mdbs]) => {
    mdbs.sort((a, b) => a.name.localeCompare(b.name, "de"));
    return { fraktion, slug: slugify(fraktion) || "fraktionslos", count: mdbs.length, mdbs };
  });
  groups.sort((a, b) => b.count - a.count);
  return groups;
}
