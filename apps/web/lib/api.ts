// Client-seitiger Datenzugriff im serverlosen Betrieb. Die App holt Vorgaenge,
// Zeitleisten und Dokumente direkt aus der DIP-API des Bundestages (siehe
// lib/dip.ts) - kein eigener Server. Nicht aus DIP ableitbare Daten (namentliche
// Abstimmungen, App-Version) kommen aus gebuendelten Snapshots.
//
// Die exportierten Funktionsnamen/Signaturen bleiben unveraendert, damit die
// bestehenden Seiten/Komponenten ohne Anpassung weiterlaufen. Jeder Abruf ist in
// einen stale-while-revalidate-Cache gehuellt: gelingt der DIP-Abruf, wird die
// Antwort gecacht; schlaegt er fehl (offline), kommt die zuletzt gecachte
// Antwort (STALE) oder null.

import {
  checkDipKey,
  dipFetchDocuments,
  dipFetchFeed,
  dipFetchMatter,
  dipFetchTimeline,
  dipMdBsByFraktion,
  dipStats,
  dipTopicCounts,
  type DipFeedParams,
  type FraktionGruppe,
} from "./dip";
import { VOTES_SNAPSHOT } from "./data/votesSnapshot";
import { readCache, writeCache } from "./offlineCache";
import type {
  FeedResponse,
  MatterDetail,
  MatterDocument,
  RollCallVote,
  SourceStatus,
  Stats,
  TimelineEvent,
  TopicCount,
} from "./types";

// In-Memory-Cache + Dedup laufender Abrufe. So blockieren wiederholte/parallele
// Aufrufe desselben Keys nicht jeweils auf einem eigenen Netz-Round-Trip.
const memCache = new Map<string, { ts: number; data: unknown }>();
const inflight = new Map<string, Promise<unknown>>();

// Producer ausfuehren (dedupliziert), Ergebnis in beide Caches schreiben.
function revalidate<T>(key: string, producer: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const p = producer()
    .then((data) => {
      memCache.set(key, { ts: Date.now(), data });
      writeCache(key, data);
      return data;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

// Bei gesetztem ttlMs und frischem In-Memory-Wert wird dieser SOFORT geliefert
// und im Hintergrund revalidiert (stale-while-revalidate). Sonst wird auf den
// (deduplizierten) Abruf gewartet; bei Fehler kommt der letzte Cache oder null.
async function withCache<T>(
  key: string,
  producer: () => Promise<T>,
  ttlMs = 0,
): Promise<T | null> {
  const mem = memCache.get(key);
  if (ttlMs > 0 && mem && Date.now() - mem.ts < ttlMs) {
    void revalidate(key, producer).catch(() => {});
    return mem.data as T;
  }
  try {
    return await revalidate(key, producer);
  } catch {
    return (mem?.data as T | undefined) ?? readCache<T>(key)?.data ?? null;
  }
}

// Zeitstempel des zuletzt erfolgreich gecachten Abrufs zu key (fuer den
// Offline-/Stand-Hinweis in der UI), oder null.
export function getLastUpdated(key: string): number | null {
  return readCache<unknown>(key)?.ts ?? null;
}

// ---------------------------------------------------------------------------
// Feed.
// ---------------------------------------------------------------------------

export function buildFeedQuery(params: {
  cursor?: string;
  topics?: string[];
  parties?: string[];
  bundeslaender?: string[];
  matterTypes?: string[];
  text?: string;
  limit?: number;
}): string {
  const sp = new URLSearchParams();
  if (params.cursor) sp.set("cursor", params.cursor);
  if (params.limit) sp.set("limit", String(params.limit));
  if (params.text && params.text.trim()) sp.set("q", params.text.trim());
  for (const t of params.topics ?? []) sp.append("topic", t);
  for (const p of params.parties ?? []) sp.append("party", p);
  for (const b of params.bundeslaender ?? []) sp.append("bundesland", b);
  for (const mt of params.matterTypes ?? []) sp.append("matter_type", mt);
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function parseFeedQuery(query: string): DipFeedParams {
  const sp = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
  const limitRaw = sp.get("limit");
  return {
    cursor: sp.get("cursor") ?? undefined,
    limit: limitRaw ? Number.parseInt(limitRaw, 10) : undefined,
    text: sp.get("q") ?? undefined,
    topics: sp.getAll("topic"),
    parties: sp.getAll("party"),
    bundeslaender: sp.getAll("bundesland"),
    matterTypes: sp.getAll("matter_type"),
  };
}

export function fetchFeed(query: string): Promise<FeedResponse | null> {
  // Cache-Key bleibt der bisherige Pfad-String, damit getLastUpdated-Aufrufer
  // (FeedClient) unveraendert den Offline-Stand finden.
  return withCache(`/api/v1/events${query}`, () => dipFetchFeed(parseFeedQuery(query)));
}

// ---------------------------------------------------------------------------
// Vorgangsdetail.
// ---------------------------------------------------------------------------

export function fetchMatter(slug: string): Promise<MatterDetail | null> {
  return withCache(`matter:${slug}`, async () => {
    const m = await dipFetchMatter(slug);
    if (!m) throw new Error("Vorgang nicht gefunden");
    return m;
  });
}

export function fetchTimeline(slug: string): Promise<TimelineEvent[] | null> {
  return withCache(`timeline:${slug}`, () => dipFetchTimeline(slug));
}

export function fetchDocuments(slug: string): Promise<MatterDocument[] | null> {
  return withCache(`documents:${slug}`, () => dipFetchDocuments(slug));
}

// ---------------------------------------------------------------------------
// Themen / Statistik (pragmatischer Mix: aus DIP angenaehert).
// ---------------------------------------------------------------------------

export function fetchTopics(scheme?: string): Promise<TopicCount[] | null> {
  return withCache(`topics:${scheme ?? ""}`, () => dipTopicCounts(scheme));
}

export function fetchStats(): Promise<Stats | null> {
  return withCache("stats", () => dipStats());
}

// ---------------------------------------------------------------------------
// Abgeordnete (MdB) nach Fraktion (live aus DIP, gecacht).
// ---------------------------------------------------------------------------

export function fetchMdBGroups(): Promise<FraktionGruppe[] | null> {
  // Das MdB-Roster ist pro Wahlperiode quasi statisch -> 1 h SWR-Cache, damit die
  // Parteien-Seite nach dem ersten (teuren) Laden sofort erscheint.
  return withCache("mdb:fraktionen", () => dipMdBsByFraktion(), 60 * 60 * 1000);
}

// ---------------------------------------------------------------------------
// Quellenstatus / Health (serverlos: DIP-Erreichbarkeit).
// ---------------------------------------------------------------------------

export interface HealthResult {
  reachable: boolean;
  status: string;
  detail: Record<string, unknown> | null;
}

// Prueft die Erreichbarkeit/Gueltigkeit des DIP-Zugangs. `path` wird ignoriert
// (Signatur bleibt fuer bestehende Aufrufer erhalten).
export async function fetchHealth(_path: string): Promise<HealthResult> {
  void _path;
  const r = await checkDipKey();
  return { reachable: r.ok, status: r.message, detail: null };
}

export async function fetchSources(): Promise<SourceStatus[] | null> {
  const r = await checkDipKey();
  const now = new Date().toISOString();
  return [
    {
      key: "dip",
      name: "Bundestag DIP (Direktabruf)",
      status: r.ok ? "healthy" : "down",
      last_success_at: r.ok ? now : null,
      last_new_item_at: null,
      expected_frequency_seconds: 900,
      known_limitation:
        "Serverloser Direktabruf: keine Quellen-Historie, keine Korrektur-/Löscherkennung.",
    },
    {
      key: "votes",
      name: "Namentliche Abstimmungen (gebündelt)",
      status: VOTES_SNAPSHOT.length > 0 ? "degraded" : "unknown",
      last_success_at: null,
      last_new_item_at: null,
      expected_frequency_seconds: 0,
      known_limitation: "Gebündelter Snapshot; Aktualisierung nur über App-Updates.",
    },
  ];
}

// ---------------------------------------------------------------------------
// Namentliche Abstimmungen (gebuendelter Snapshot).
// ---------------------------------------------------------------------------

export function fetchVotes(limit = 15, matterSlug?: string): Promise<RollCallVote[] | null> {
  let votes = VOTES_SNAPSHOT;
  if (matterSlug) votes = votes.filter((v) => v.matter_slug === matterSlug);
  return Promise.resolve(votes.slice(0, limit));
}

// ---------------------------------------------------------------------------
// App-Version (Update-Hinweis).
// ---------------------------------------------------------------------------

export interface AppVersionInfo {
  versionCode: number;
  versionName: string;
  downloadUrl: string;
  notes?: string;
}

// Serverlos: die aktuelle Version wird - falls konfiguriert - aus einer
// statischen JSON (z. B. GitHub-Release-Asset) gelesen. Ohne Konfiguration kein
// Update-Hinweis (statt einen Server vorzutaeuschen).
export async function fetchAppVersion(): Promise<AppVersionInfo | null> {
  const url = process.env.NEXT_PUBLIC_VERSION_URL;
  if (!url) return null;
  return withCache("appversion", async () => {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as AppVersionInfo;
  });
}

// ---------------------------------------------------------------------------
// Legacy: Eigenbetrieb-Refresh entfaellt im serverlosen Betrieb.
// ---------------------------------------------------------------------------

export interface RefreshResult {
  ok: boolean;
  message: string;
}

export function triggerRefresh(_dipKey: string, _limit = 100): Promise<RefreshResult> {
  void _dipKey;
  void _limit;
  return Promise.resolve({
    ok: false,
    message: "Im serverlosen Betrieb nicht nötig – Daten kommen live aus der DIP-API.",
  });
}
