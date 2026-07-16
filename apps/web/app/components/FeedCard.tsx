"use client";

import Link from "next/link";
import { memo } from "react";
import type { FeedItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { safeExternalHref } from "@/lib/urls";
import { IconExternal } from "./icons";
import { SpeakButton } from "./SpeakButton";
import { useLang } from "./LangProvider";

// Kategorische, nicht wertende Akzentfarbe je Vorgangstyp.
const TYPE_COLOR: Record<string, string> = {
  gesetzgebung: "var(--bm-accent)",
  antrag: "var(--bm-accent-2)",
  anfrage: "var(--bm-type-anfrage)",
  bericht: "var(--bm-type-bericht)",
  wahlpruefung: "var(--bm-type-wahlpruefung)",
  sonstiges: "var(--bm-text-muted)",
};

// Kurzlabel + ausgeschriebener Titel (Tooltip) je Quelle.
function sourceLabel(name: string | null): { short: string; long: string } | null {
  if (!name) return null;
  if (name.startsWith("DIP"))
    return { short: "DIP", long: "Dokumentations- und Informationssystem des Bundestages" };
  if (name.startsWith("Bundesgesetzblatt"))
    return { short: "BGBl", long: "Bundesgesetzblatt (amtliche Verkündung von Gesetzen)" };
  if (name.startsWith("Bundesregierung"))
    return { short: "Bundesregierung", long: "Pressemitteilung der Bundesregierung" };
  return { short: name, long: name };
}

export const FeedCard = memo(function FeedCard({ item }: { item: FeedItem }) {
  const { t } = useLang();
  const color = item.matter_type ? (TYPE_COLOR[item.matter_type] ?? "var(--bm-text-muted)") : "var(--bm-accent-2)";
  const src = sourceLabel(item.source_name);
  const detailHref = item.matter_slug
    ? `/vorgang?slug=${encodeURIComponent(item.matter_slug)}`
    : null;
  // Ein einziges Tap-Ziel je Karte: bevorzugt die interne Uebersicht, sonst die
  // Originalquelle. Der ganze Kartenkoerper ist per "stretched link" anklickbar.
  // Externe Quell-URL nur ueber safeExternalHref (gescrapte Daten) verlinken.
  const safeSourceUrl = safeExternalHref(item.source_url);
  // Separater Quelle-Link nur, wenn das Haupt-Tap-Ziel die interne Uebersicht ist
  // (sonst waere er ein Duplikat der Karte). Liegt per z-Index ueber dem Overlay.
  const showSourceLink = !!detailHref && !!safeSourceUrl;

  return (
    <article className="bm-card bm-card--hover bm-accentbar relative px-3 py-2.5 pl-4">
      <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
        {src && (
          <span className="bm-chip" style={{ color: "var(--bm-accent)" }} title={src.long}>
            {src.short}
          </span>
        )}
        <span className="bm-chip">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ background: color }}
          />
          {item.matter_type ? t(`type.${item.matter_type}`) : t("type.meldung")}
        </span>
        {item.current_status && (
          <span className="text-xs" style={{ color: "var(--bm-text-muted)" }}>
            {item.current_status}
          </span>
        )}
        <span className="bm-mono ml-auto text-[0.72rem]" style={{ color: "var(--bm-text-muted)" }}>
          {formatDate(item.published_at)}
        </span>
        <span className="relative z-10 inline-flex">
          <SpeakButton
            text={`${item.matter_type ? t(`type.${item.matter_type}`) : t("type.meldung")}${
              item.current_status ? `, Status ${item.current_status}` : ""
            }: ${item.title}. ${formatDate(item.published_at)}.`}
            label={t("card.vorlesen")}
          />
        </span>
      </div>

      <h3 className="line-clamp-2 text-[0.88rem] font-medium leading-snug">
        {detailHref ? (
          <Link
            href={detailHref}
            className="transition-colors hover:text-[var(--bm-accent)] before:absolute before:inset-0 before:content-['']"
          >
            {item.title}
          </Link>
        ) : safeSourceUrl ? (
          <a
            href={safeSourceUrl}
            rel="noopener noreferrer"
            target="_blank"
            className="transition-colors hover:text-[var(--bm-accent)] before:absolute before:inset-0 before:content-['']"
          >
            {item.title}
          </a>
        ) : (
          item.title
        )}
      </h3>

      {showSourceLink && safeSourceUrl && (
        <a
          className="bm-link relative z-10 mt-1 inline-flex w-fit items-center gap-1 text-[0.7rem]"
          href={safeSourceUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t("ui.vorgangBeiDip")} <IconExternal />
        </a>
      )}
    </article>
  );
});
