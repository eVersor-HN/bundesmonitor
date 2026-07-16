"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { TopicCount } from "@/lib/types";
import { withParam } from "@/lib/urlfilter";
import { Dropdown } from "./Dropdown";
import { useLang } from "./LangProvider";
import { IconStar } from "./icons";

const STORAGE_KEY = "bm:favorites";

function loadFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function TopicFilter({
  topics,
  activeTopics,
  basePath = "/",
}: {
  topics: TopicCount[];
  activeTopics: string[];
  basePath?: string;
}) {
  const { t } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorites(loadFavorites());
  }, []);

  const persist = useCallback((next: string[]) => {
    setFavorites(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* localStorage nicht verfügbar */
    }
  }, []);

  const toggleFavorite = useCallback(
    (key: string) => {
      persist(favorites.includes(key) ? favorites.filter((k) => k !== key) : [...favorites, key]);
    },
    [favorites, persist],
  );

  const applyTopics = useCallback(
    (keys: string[]) => {
      const qs = withParam(searchParams, "topic", keys);
      router.push(qs ? `${basePath}?${qs}` : basePath);
    },
    [router, basePath, searchParams],
  );

  // Stabile alphabetische Reihenfolge (de-Locale), damit die Liste nicht nach
  // Trefferzahl springt und Themen immer an derselben Stelle stehen.
  const sortedTopics = [...topics].sort((a, b) => a.label.localeCompare(b.label, "de"));
  const favoriteTopics = sortedTopics.filter((t) => favorites.includes(t.key));
  const isFiltered = activeTopics.length > 0;

  return (
    <Dropdown title={t("feed.meineThemen")} badge={activeTopics.length}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => applyTopics(favorites)}
          disabled={favorites.length === 0}
          className="bm-btn"
          style={{ padding: "0.25rem 0.7rem", fontSize: "0.72rem" }}
        >
          Nur meine Themen
        </button>
        {isFiltered && (
          <button
            type="button"
            onClick={() => applyTopics([])}
            className="bm-btn"
            style={{ padding: "0.25rem 0.7rem", fontSize: "0.72rem" }}
          >
            Filter zurücksetzen
          </button>
        )}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="bm-link ml-auto text-xs"
          aria-expanded={expanded}
        >
          {expanded ? "Liste schließen" : "Themen verwalten"}
        </button>
      </div>

      {favoriteTopics.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {favoriteTopics.map((t) => (
            <li key={t.key}>
              <button
                type="button"
                onClick={() => applyTopics([t.key])}
                className={`bm-btn${activeTopics.includes(t.key) ? " bm-btn--active" : ""}`}
                style={{ padding: "0.2rem 0.7rem", fontSize: "0.72rem" }}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs" style={{ color: "var(--bm-text-muted)" }}>
          Noch keine Favoriten. Über „Themen verwalten“ markieren.
        </p>
      )}

      {expanded && (
        <div className="mt-3">
          <p className="mb-2 text-xs" style={{ color: "var(--bm-text-muted)" }}>
            Themen aus amtlichen DIP-Metadaten. Favoriten liegen nur lokal auf diesem Gerät.
          </p>
          <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto pr-1">
            {sortedTopics.map((t) => {
              const starred = favorites.includes(t.key);
              return (
                <li key={t.key} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-baseline gap-1.5">
                    <span className="min-w-0 truncate">{t.label}</span>
                    <span className="bm-mono shrink-0 text-xs" style={{ color: "var(--bm-text-muted)" }}>
                      {t.matter_count}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(t.key)}
                    aria-pressed={starred}
                    aria-label={starred ? `${t.label} entfernen` : `${t.label} merken`}
                    className="bm-btn inline-flex shrink-0 items-center gap-1 whitespace-nowrap"
                    style={{
                      padding: "0.15rem 0.6rem",
                      fontSize: "0.72rem",
                      color: starred ? "var(--bm-accent)" : undefined,
                      borderColor: starred ? "var(--bm-accent)" : undefined,
                    }}
                  >
                    <IconStar filled={starred} size={13} />
                    {starred ? "Favorit" : "merken"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Dropdown>
  );
}
