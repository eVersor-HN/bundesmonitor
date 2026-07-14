"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchDocuments, fetchMatter, fetchTimeline } from "@/lib/api";
import { dipWebVorgangUrl, idFromSlug } from "@/lib/dip";
import { isGemerkt, toggleMerken } from "@/lib/config";
import { formatDate, formatDateTime } from "@/lib/format";
import type { MatterDetail, MatterDocument, TimelineEvent } from "@/lib/types";
import { IconExternal, IconStar } from "./icons";
import { SpeakButton } from "./SpeakButton";
import { VotesList } from "./VotesList";
import { useLang } from "./LangProvider";

export function MatterClient() {
  const { t } = useLang();
  const slug = useSearchParams().get("slug") ?? "";
  const [matter, setMatter] = useState<MatterDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [documents, setDocuments] = useState<MatterDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [gemerkt, setGemerkt] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGemerkt(isGemerkt(slug));
  }, [slug]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const [m, t, d] = await Promise.all([
        fetchMatter(slug),
        fetchTimeline(slug),
        fetchDocuments(slug),
      ]);
      if (!active) return;
      setMatter(m);
      setTimeline(t ?? []);
      setDocuments(d ?? []);
      setLoading(false);
    };
    void run();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return <p className="text-sm">{t("ui.laedt")}</p>;
  }

  if (matter === null) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm" style={{ color: "var(--bm-text-muted)" }}>
          {t("vorgang.nichtGefunden")}
        </p>
      </div>
    );
  }

  // Originalquelle des Vorgangs (DIP-Webseite). Die Feed-Karte hat kein eigenes
  // Quelle-Ziel mehr (ein Tap-Ziel) - hier im Detail bleibt sie erreichbar.
  const sourceId = idFromSlug(slug);
  const sourceUrl = sourceId ? dipWebVorgangUrl(sourceId, matter.title) : null;

  // "Verwandtes": aus den Themen des Vorgangs abgeleitete Querlinks in den
  // gefilterten Feed. Nach Schema gruppiert (Beteiligte/Fraktion, Themen, Orte),
  // weil die DIP-API keine personen-/urheber-scharfe Abfrage erlaubt (f.person
  // wird ignoriert) – der Feed-Filter dagegen wirkt clientseitig zuverlässig.
  const parteien = matter.topics.filter((tp) => tp.scheme === "partei");
  const orte = matter.topics.filter((tp) => tp.scheme === "ort");
  const themen = matter.topics.filter((tp) => tp.scheme !== "partei" && tp.scheme !== "ort");
  const relGroups = [
    { label: "Beteiligte / Initiative", items: parteien, param: "party" },
    { label: "Themen", items: themen, param: "topic" },
    { label: "Orte", items: orte, param: "bundesland" },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-8">

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className="rounded-full px-2 py-0.5"
            style={{ background: "var(--bm-surface)", border: "1px solid var(--bm-border)" }}
          >
            {t(`type.${matter.matter_type}`)}
          </span>
          {matter.current_status && (
            <span style={{ color: "var(--bm-text-muted)" }}>{t("vorgang.stand")} {matter.current_status}</span>
          )}
          <SpeakButton
            text={`${t(`type.${matter.matter_type}`)}${
              matter.current_status ? `, ${matter.current_status}` : ""
            }: ${matter.title}. ${matter.description ?? ""}`}
            label={t("vorgang.vorlesen")}
          />
          <button
            type="button"
            onClick={() =>
              setGemerkt(
                toggleMerken({ slug: matter.slug, title: matter.title, type: matter.matter_type }),
              )
            }
            aria-pressed={gemerkt}
            className={`bm-btn ml-auto${gemerkt ? " bm-btn--active" : ""}`}
            style={{ padding: "0.2rem 0.6rem" }}
          >
            <IconStar filled={gemerkt} /> {gemerkt ? "Gemerkt" : "Merken"}
          </button>
        </div>
        <h1 className="text-lg font-semibold leading-snug tracking-tight">{matter.title}</h1>
        {matter.description && (
          <p className="max-w-2xl text-sm" style={{ color: "var(--bm-text-muted)" }}>
            {matter.description}
          </p>
        )}
        <dl
          className="flex flex-wrap gap-x-5 gap-y-1 text-xs"
          style={{ color: "var(--bm-text-muted)" }}
        >
          <div>
            <dt className="inline font-medium">{t("vorgang.erfasst")} </dt>
            <dd className="inline">{formatDate(matter.first_seen_at)}</dd>
          </div>
          {matter.identifiers.map((i) => (
            <div key={`${i.scheme}-${i.value}`}>
              <dt className="inline font-medium">{i.scheme}: </dt>
              <dd className="inline">{i.value}</dd>
            </div>
          ))}
        </dl>
        {sourceUrl && (
          <a
            className="bm-link inline-flex w-fit items-center gap-1 text-xs"
            href={sourceUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("ui.vorgangBeiDip")} <IconExternal />
          </a>
        )}
      </header>

      {relGroups.length > 0 && (
        <section aria-labelledby="rel-title" className="flex flex-col gap-4">
          <div>
            <h2 id="rel-title" className="text-lg font-semibold">Verwandtes</h2>
            <p className="text-sm" style={{ color: "var(--bm-text-muted)" }}>
              Weiter zu Vorgängen mit denselben Beteiligten, Themen oder Orten.
            </p>
          </div>
          {relGroups.map((g) => (
            <div key={g.label} className="flex flex-col gap-1.5">
              <span className="bm-sect">{g.label}</span>
              <ul className="flex flex-wrap gap-1.5">
                {g.items.map((tp) => (
                  <li key={tp.key}>
                    <Link
                      href={`/nib?${g.param}=${encodeURIComponent(tp.key)}`}
                      className="bm-chip transition-colors hover:border-[var(--bm-accent)] hover:text-[var(--bm-accent)]"
                      title={`Alle Vorgänge zu „${tp.label}“`}
                    >
                      {tp.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      <section aria-labelledby="votes-title" className="flex flex-col gap-4">
        <h2 id="votes-title" className="text-lg font-semibold">
          {t("votes.titel")}
        </h2>
        <VotesList matterSlug={slug ?? undefined} limit={5} />
      </section>

      <section aria-labelledby="timeline-title" className="flex flex-col gap-4">
        <h2 id="timeline-title" className="text-lg font-semibold">
          {t("vorgang.zeitleiste")}
        </h2>
        {timeline.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--bm-text-muted)" }}>
            {t("vorgang.keineEreignisse")}
          </p>
        ) : (
          <ol
            className="flex flex-col gap-5 border-l pl-5"
            style={{ borderColor: "var(--bm-border)", marginLeft: "4px" }}
          >
            {timeline.map((ev) => (
              <li key={ev.event_id} className="relative flex flex-col gap-0.5">
                <span
                  aria-hidden="true"
                  className="absolute h-2.5 w-2.5 rounded-full"
                  style={{
                    left: "calc(-1.25rem - 5px)",
                    top: "0.3rem",
                    background: "var(--bm-accent)",
                    boxShadow: "var(--bm-glow)",
                    outline: "3px solid color-mix(in srgb, var(--bm-accent) 16%, transparent)",
                  }}
                />
                <span className="bm-mono text-xs" style={{ color: "var(--bm-text-muted)" }}>
                  {formatDateTime(ev.published_at)}
                </span>
                  <span className="text-sm font-medium">{ev.title}</span>
                  {ev.status_after && (
                    <span className="text-xs" style={{ color: "var(--bm-text-muted)" }}>
                      {t("vorgang.status")} {ev.status_after}
                    </span>
                  )}
                {ev.source_url && (
                  <a
                    className="bm-link inline-flex w-fit items-center gap-1 text-xs"
                    href={ev.source_url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t("ui.originalSource")} <IconExternal />
                  </a>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="docs-title" className="flex flex-col gap-4">
        <h2 id="docs-title" className="text-lg font-semibold">
          {t("vorgang.dokumente")}
        </h2>
        {documents.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--bm-text-muted)" }}>
            {t("vorgang.keineDokumente")}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {documents.map((doc, i) => (
              <li
                key={`${doc.document_number ?? doc.url ?? i}`}
                className="bm-card flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 p-3"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{doc.title ?? "Drucksache"}</span>
                  <span className="text-xs" style={{ color: "var(--bm-text-muted)" }}>
                    {[doc.document_type, doc.document_number, doc.publisher]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
                <div
                  className="flex items-center gap-3 text-xs"
                  style={{ color: "var(--bm-text-muted)" }}
                >
                  <span className="bm-mono">{formatDate(doc.document_date)}</span>
                  {doc.url && (
                    <a
                      className="bm-link inline-flex items-center gap-1"
                      href={doc.url}
                      rel="noopener noreferrer"
                      target="_blank"
                      aria-label={`${doc.document_type ?? "Dokument"}${
                        doc.document_number ? ` ${doc.document_number}` : ""
                      } als PDF öffnen (DIP)`}
                    >
                      PDF <IconExternal />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
