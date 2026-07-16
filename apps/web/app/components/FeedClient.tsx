"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { buildFeedQuery, fetchFeed, fetchTopics, getLastUpdated } from "@/lib/api";
import { getLand, getRefreshMinutes, type MyLand } from "@/lib/config";
import { formatDateTime } from "@/lib/format";
import type { FeedItem, TopicCount } from "@/lib/types";
import { FacetFilter } from "./FacetFilter";
import { FeedCard } from "./FeedCard";
import { PullToRefresh } from "./PullToRefresh";
import { TopicFilter } from "./TopicFilter";
import { useLang } from "./LangProvider";

// Nachgeladene Seiten mit dem Bestand zusammenfuehren: per event_id
// deduplizieren (Cursor-Seiten koennen sich am Rand ueberlappen) und strikt
// nach published_at absteigend sortieren, event_id als stabiler Tiebreak.
function mergeFeedItems(prev: FeedItem[], next: FeedItem[]): FeedItem[] {
  const map = new Map<string, FeedItem>();
  for (const it of prev) map.set(it.event_id, it);
  for (const it of next) map.set(it.event_id, it);
  return [...map.values()].sort(
    (a, b) =>
      (b.published_at ?? "").localeCompare(a.published_at ?? "") ||
      b.event_id.localeCompare(a.event_id),
  );
}

type State = {
  items: FeedItem[];
  nextCursor: string | null;
  loading: boolean;
  error: boolean;
  // Anzeige stammt aus dem Offline-Cache (Geraet offline, aber Daten vorhanden).
  offline: boolean;
  // Zeitstempel (Date.now()) des zuletzt erfolgreich gecachten Abrufs.
  lastUpdated: number | null;
};

export function FeedClient({
  showTopicFilter = false,
  showFacetFilter = false,
  enableRefresh = false,
  applyStoredLand = false,
  basePath = "/",
}: {
  showTopicFilter?: boolean;
  showFacetFilter?: boolean;
  enableRefresh?: boolean;
  applyStoredLand?: boolean;
  basePath?: string;
}) {
  const searchParams = useSearchParams();
  const { t } = useLang();
  const topics = searchParams.getAll("topic");
  const parties = searchParams.getAll("party");
  const urlBundeslaender = searchParams.getAll("bundesland");

  // "Jetzt": das in den Optionen gewaehlte Bundesland filtert den Feed.
  const [land, setLandState] = useState<MyLand | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (applyStoredLand) setLandState(getLand());
  }, [applyStoredLand]);
  const landKey = applyStoredLand && land?.topicKey ? land.topicKey : null;
  const bundeslaender = landKey ? [...urlBundeslaender, landKey] : urlBundeslaender;
  const filterKey = [topics.join(","), parties.join(","), bundeslaender.join(",")].join("|");

  const [topicCatalog, setTopicCatalog] = useState<TopicCount[]>([]);
  const [state, setState] = useState<State>({
    items: [],
    nextCursor: null,
    loading: true,
    error: false,
    offline: false,
    lastUpdated: null,
  });

  // Sequenz-Token: nur die Antwort des zuletzt gestarteten Abrufs darf den State
  // schreiben (verhindert, dass out-of-order-Antworten frische Daten ueberschreiben).
  const reqSeq = useRef(0);

  const load = useCallback(
    async (cursor: string | null, append: boolean) => {
      const token = ++reqSeq.current;
      const query = buildFeedQuery({
        topics,
        parties,
        bundeslaender,
        cursor: cursor ?? undefined,
        limit: 25,
      });
      const feed = await fetchFeed(query);
      if (token !== reqSeq.current) return; // durch neueren Abruf ueberholt
      // Offline-Erkennung: Ist das Geraet offline, kann fetchFeed nur aus dem
      // Cache geliefert haben (stale-while-revalidate in lib/api.ts). Wir nutzen
      // navigator.onLine bewusst als einfaches Signal fuer den "Offline"-Hinweis;
      // ein erreichbarer, aber fehlerhafter Server wird damit nicht erfasst.
      const offline = typeof navigator !== "undefined" && !navigator.onLine;
      setState((prev) => {
        if (feed === null) return { ...prev, loading: false, error: !append };
        return {
          // Beim Nachladen zusammenfuehren, per event_id deduplizieren und die
          // gesamte Liste strikt nach published_at absteigend sortieren, damit
          // die Daten auch ueber Seitengrenzen hinweg nicht "springen".
          items: append ? mergeFeedItems(prev.items, feed.items) : feed.items,
          nextCursor: feed.next_cursor,
          loading: false,
          error: false,
          offline: offline,
          lastUpdated: offline ? getLastUpdated(`/api/v1/events${query}`) : null,
        };
      });
    },
    // wird ueber filterKey (topic/party/bundesland) neu ausgeloest
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterKey],
  );

  // Daten beim Mount und bei Themenwechsel laden (setState erst nach dem fetch).
  useEffect(() => {
    void load(null, false);
  }, [load]);

  useEffect(() => {
    if (showTopicFilter) void fetchTopics().then((t) => t && setTopicCatalog(t));
  }, [showTopicFilter]);

  useEffect(() => {
    if (!enableRefresh) return;
    const min = getRefreshMinutes();
    if (min <= 0) return;
    const id = window.setInterval(() => void load(null, false), min * 60_000);
    return () => window.clearInterval(id);
  }, [enableRefresh, load]);

  const content = (
    <div className="flex flex-col gap-4">
      {/* Dezenter Hinweis, wenn die Anzeige aus dem Offline-Cache stammt.
          Kein passender i18n-Key vorhanden -> bewusst deutscher Text. */}
      {state.offline && state.items.length > 0 && state.lastUpdated !== null && (
        <p className="text-xs" style={{ color: "var(--bm-text-muted)" }}>
          Offline – Stand: {formatDateTime(new Date(state.lastUpdated).toISOString())}
        </p>
      )}

      {showFacetFilter && <FacetFilter basePath={basePath} />}
      {showTopicFilter && topicCatalog.length > 0 && (
        <TopicFilter topics={topicCatalog} activeTopics={topics} basePath={basePath} />
      )}

      {applyStoredLand && land?.name && (
        <a
          href="/einstellungen"
          className="bm-chip w-fit"
          style={{ color: "var(--bm-accent)", borderColor: "var(--bm-accent)" }}
        >
          <span className="whitespace-nowrap">{t("feed.gefiltert", { land: land.name })}</span>
          &nbsp;· {t("feed.aendern")}
        </a>
      )}

      {state.loading && state.items.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--bm-text-muted)" }}>
          {t("ui.laedt")}
        </p>
      ) : state.error ? (
        <a href="/einstellungen" className="bm-card block p-4 text-sm" style={{ color: "var(--bm-text-muted)" }}>
          {t("ui.serverFehler")}
        </a>
      ) : state.items.length === 0 ? (
        <p className="bm-card p-4 text-sm" style={{ color: "var(--bm-text-muted)" }}>
          {topics.length > 0 ? t("ui.keineEintraegeThemen") : t("ui.keineEintraege")}
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {state.items.map((item) => (
              <li key={item.event_id}>
                <FeedCard item={item} />
              </li>
            ))}
          </ul>
          {state.nextCursor && (
            <button
              type="button"
              onClick={() => void load(state.nextCursor, true)}
              className="bm-btn self-center"
            >
              {t("ui.loadMore")}
            </button>
          )}
        </>
      )}
    </div>
  );

  if (enableRefresh) {
    // Ziehen nach unten aktualisiert alles: Live-Kennzahlen (per Event) + Feed.
    const refreshAll = async () => {
      if (typeof window !== "undefined") window.dispatchEvent(new Event("bm:refresh"));
      await load(null, false);
    };
    return <PullToRefresh onRefresh={refreshAll}>{content}</PullToRefresh>;
  }
  return content;
}
