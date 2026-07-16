"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchTopics } from "@/lib/api";
import { PageHeader } from "@/app/components/PageHeader";
import type { TopicCount } from "@/lib/types";

// Themen-Hub: Sachgebiete aus DIP als Bindeglied. Jedes Thema führt in den nach
// diesem Sachgebiet gefilterten Parlaments-Feed. Die Häufigkeit stammt aus der
// zuletzt geladenen Feed-Seite (Näherung, siehe lib/dip.ts dipTopicCounts).
export default function ThemenPage() {
  const [topics, setTopics] = useState<TopicCount[] | null>(null);

  useEffect(() => {
    void fetchTopics("sachgebiet").then((t) => setTopics(t ?? []));
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Themen"
        sub="Sachgebiete des Bundestags – tippe ein Thema für alle zugehörigen Vorgänge."
      />

      {topics === null ? (
        <p className="text-sm" style={{ color: "var(--bm-text-muted)" }}>
          Lädt…
        </p>
      ) : topics.length === 0 ? (
        <p className="bm-card p-4 text-sm" style={{ color: "var(--bm-text-muted)" }}>
          Derzeit keine Themen geladen. Prüfe den Datenzugang unter „Mehr → Quellenstatus“.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <li key={t.key}>
              <Link
                href={`/nib?topic=${encodeURIComponent(t.key)}`}
                className="bm-btn"
                style={{ padding: "0.35rem 0.8rem", fontSize: "0.8rem" }}
                title={`Alle Vorgänge zum Thema „${t.label}“`}
              >
                {t.label}
                <span className="bm-mono ml-1.5" style={{ color: "var(--bm-text-muted)" }}>
                  {t.matter_count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
