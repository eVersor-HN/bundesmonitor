"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMdBGroups } from "@/lib/api";
import type { FraktionGruppe } from "@/lib/dip";
import { PageHeader } from "./PageHeader";

// Akteure > Parteien > Personen. Alle Mitglieder des Bundestages (Wahlperiode 21),
// live aus DIP /person, nach Fraktion gruppiert. Ohne ?f: Fraktions-Uebersicht;
// mit ?f=<slug>: die Abgeordneten dieser Fraktion (durchsuchbar).
export function ParteienClient() {
  const slug = useSearchParams().get("f") ?? "";
  const [groups, setGroups] = useState<FraktionGruppe[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    void fetchMdBGroups().then((g) => {
      if (!active) return;
      setGroups(g);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Abgeordnete" sub="Mitglieder des Bundestages nach Fraktion." />
        <p className="text-sm" style={{ color: "var(--bm-text-muted)" }}>
          Lädt Abgeordnete aus der DIP-Schnittstelle…
        </p>
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Abgeordnete" sub="Mitglieder des Bundestages nach Fraktion." />
        <p className="text-sm" style={{ color: "var(--bm-text-muted)" }}>
          Keine Daten verfügbar (offline oder DIP nicht erreichbar). Später erneut versuchen.
        </p>
      </div>
    );
  }

  const current = groups.find((g) => g.slug === slug) ?? null;

  // --- Fraktion-Detail: einzelne Abgeordnete ---
  if (slug && current) {
    const needle = q.trim().toLowerCase();
    const filtered = needle
      ? current.mdbs.filter((m) => m.name.toLowerCase().includes(needle))
      : current.mdbs;
    return (
      <div className="flex flex-col gap-4">
        <PageHeader
          title={current.fraktion}
          sub={`${current.count} Abgeordnete (Wahlperiode 21) · live aus DIP`}
        />
        <Link href="/akteure/parteien" className="bm-link w-fit text-sm">
          ← Alle Fraktionen
        </Link>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name suchen…"
          className="bm-input"
          aria-label="Abgeordnete suchen"
        />
        <ul className="flex flex-col gap-2">
          {filtered.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
              style={{ borderColor: "var(--bm-border)", background: "var(--bm-surface)" }}
            >
              <span className="min-w-0 truncate text-sm font-medium">{m.name}</span>
              {m.rolle && m.rolle !== "MdB" && <span className="bm-chip shrink-0">{m.rolle}</span>}
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="text-sm" style={{ color: "var(--bm-text-muted)" }}>
              Kein Treffer.
            </li>
          )}
        </ul>
      </div>
    );
  }

  // --- Fraktion-Uebersicht ---
  const total = groups.reduce((s, g) => s + g.count, 0);
  const max = groups[0]?.count ?? 1;
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Abgeordnete nach Fraktion"
        sub={`${total} Mitglieder des Bundestages (Wahlperiode 21), live aus der DIP-Schnittstelle. Fraktion antippen für die Personen.`}
      />
      <ul className="flex flex-col gap-2">
        {groups.map((g) => (
          <li key={g.slug}>
            <Link href={`/akteure/parteien?f=${g.slug}`} className="bm-card bm-card--hover block p-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-medium">{g.fraktion}</span>
                <span className="bm-mono text-sm font-semibold" style={{ color: "var(--bm-accent)" }}>
                  {g.count}&nbsp;→
                </span>
              </div>
              <div
                className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: "var(--bm-surface-2)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(3, (g.count / max) * 100)}%`, background: "var(--bm-accent)" }}
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <p className="px-1 text-[0.7rem] leading-relaxed" style={{ color: "var(--bm-text-muted)" }}>
        Quelle: DIP-Personenindex des Bundestages (Wahlperiode&nbsp;21), live abgerufen über{" "}
        <a
          className="bm-link"
          href="https://search.dip.bundestag.de"
          rel="noopener noreferrer"
          target="_blank"
        >
          search.dip.bundestag.de
        </a>
        . Gezeigt werden die dort geführten Abgeordneten – die Zahlen können leicht von der
        amtlichen Sitzverteilung abweichen (Nachrücker, Datenstand). Die offizielle
        Sitzverteilung steht in der Grafik im Tab Neu im Bundestag.
      </p>
    </div>
  );
}
