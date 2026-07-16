"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildFeedQuery, fetchFeed, fetchTopics } from "@/lib/api";
import { matterTypeLabel } from "@/lib/format";
import { searchSites } from "@/lib/siteIndex";
import type { FeedItem, TopicCount } from "@/lib/types";
import { Dropdown } from "./Dropdown";
import { FeedCard } from "./FeedCard";
import { IconSearch } from "./icons";
import { useLang } from "./LangProvider";

// Facette: Vorgangstyp (feste, kleine Menge). Grenzt die Freitextsuche ein.
const TYPES = ["gesetzgebung", "antrag", "anfrage", "bericht", "wahlpruefung", "sonstiges"];

// Freitextsuche: tippen -> nach kurzer Pause laden -> Treffer nach
// Vorgangstyp gruppiert und strukturiert dargestellt. Optional per Typ-Facette
// eingegrenzt.
export function SearchClient() {
  const { t } = useLang();
  const [term, setTerm] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [parties, setParties] = useState<string[]>([]);
  const [partyOpts, setPartyOpts] = useState<TopicCount[]>([]);

  useEffect(() => {
    void fetchTopics("partei").then((tc) => tc && setPartyOpts(tc));
  }, []);
  const [items, setItems] = useState<FeedItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Entprellte Suche.
  useEffect(() => {
    const q = term.trim();
    /* eslint-disable react-hooks/set-state-in-effect */
    if (q.length < 2) {
      setItems(null);
      setLoading(false);
      setError(false);
      return;
    }
    setLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const id = window.setTimeout(async () => {
      const res = await fetchFeed(
        buildFeedQuery({
          text: q,
          limit: 60,
          matterTypes: types.length ? types : undefined,
          parties: parties.length ? parties : undefined,
        }),
      );
      if (res === null) {
        setError(true);
        setItems(null);
      } else {
        setError(false);
        setItems(res.items);
      }
      setLoading(false);
    }, 350);
    return () => window.clearTimeout(id);
  }, [term, types, parties]);

  function toggleType(k: string) {
    setTypes((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  }

  function toggleParty(k: string) {
    setParties((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  }

  // Passende App-Seiten (statischer Index, sofort, ohne Server).
  const sites = useMemo(() => searchSites(term), [term]);

  // Nach Vorgangstyp gruppieren (fuer eine strukturierte Ansicht).
  const groups = useMemo(() => {
    if (!items) return [];
    const map = new Map<string, FeedItem[]>();
    for (const it of items) {
      const key = it.matter_type ?? "sonstiges";
      (map.get(key) ?? map.set(key, []).get(key)!).push(it);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [items]);

  return (
    <div className="flex flex-col gap-4">
      <label className="bm-input flex items-center gap-2">
        <IconSearch size={18} />
        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={t("suche.placeholder")}
          className="w-full bg-transparent outline-none"
          aria-label={t("suche.placeholder")}
        />
      </label>

      {term.trim().length >= 2 && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1.5">
            <span className="bm-sect px-1">Vorgangstyp</span>
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map((k) => {
                const on = types.includes(k);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => toggleType(k)}
                    aria-pressed={on}
                    className={`bm-btn${on ? " bm-btn--active" : ""}`}
                    style={{ padding: "0.2rem 0.7rem", fontSize: "0.72rem" }}
                  >
                    {matterTypeLabel(k)}
                  </button>
                );
              })}
            </div>
          </div>
          {partyOpts.length > 0 && (
            <Dropdown title="Fraktion / Initiative" badge={parties.length}>
              <ul className="flex flex-wrap gap-1.5">
                {partyOpts.map((p) => {
                  const on = parties.includes(p.key);
                  return (
                    <li key={p.key}>
                      <button
                        type="button"
                        onClick={() => toggleParty(p.key)}
                        aria-pressed={on}
                        className={`bm-btn${on ? " bm-btn--active" : ""}`}
                        style={{ padding: "0.2rem 0.7rem", fontSize: "0.72rem" }}
                      >
                        {p.label}
                        <span className="bm-mono ml-1" style={{ color: "var(--bm-text-muted)" }}>
                          {p.matter_count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Dropdown>
          )}
        </div>
      )}

      {term.trim().length < 2 ? (
        <p className="bm-sub px-1">{t("suche.hint")}</p>
      ) : (
        <>
          {/* Eigene Seiten zuerst – sofort, ohne Server. */}
          {sites.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="bm-sect px-1">Seiten im Bundesmonitor · {sites.length}</h2>
              <ul className="flex flex-col gap-2">
                {sites.map((s) => (
                  <li key={s.path}>
                    <Link href={s.path} className="bm-card bm-card--hover block">
                      <div className="text-[0.86rem] font-semibold">{s.titel}</div>
                      <div className="text-[0.72rem]" style={{ color: "var(--bm-text-muted)" }}>
                        {s.beschreibung}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {loading ? (
            <p className="text-sm" style={{ color: "var(--bm-text-muted)" }}>
              {t("ui.laedt")}
            </p>
          ) : error ? (
            sites.length === 0 ? (
              <a href="/einstellungen" className="bm-card block text-sm" style={{ color: "var(--bm-text-muted)" }}>
                {t("ui.serverFehler")}
              </a>
            ) : null
          ) : items && items.length > 0 ? (
            <>
              <h2 className="bm-sect px-1">Vorgänge im Bundestag · {items.length}</h2>
              {groups.map(([type, list]) => (
                <section key={type} className="flex flex-col gap-2">
                  <h3 className="bm-sub px-1">
                    {matterTypeLabel(type)} · {list.length}
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {list.map((item) => (
                      <li key={item.event_id}>
                        <FeedCard item={item} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </>
          ) : sites.length === 0 ? (
            <p className="bm-card text-sm" style={{ color: "var(--bm-text-muted)" }}>
              {t("suche.keine", { term: term.trim() })}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
