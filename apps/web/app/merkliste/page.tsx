"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import { IconStar } from "@/app/components/icons";
import { getMerkliste, toggleMerken, type MerkItem } from "@/lib/config";
import { matterTypeLabel } from "@/lib/format";

// Merkliste: die vom Nutzer gemerkten Vorgänge, rein lokal auf dem Gerät. Kein
// Abruf nötig – Titel/Typ liegen im gespeicherten Eintrag.
export default function MerklistePage() {
  const [items, setItems] = useState<MerkItem[] | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(getMerkliste());
  }, []);

  function remove(m: MerkItem) {
    toggleMerken(m);
    setItems((prev) => (prev ? prev.filter((x) => x.slug !== m.slug) : prev));
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Merkliste" sub="Deine gemerkten Vorgänge – lokal auf diesem Gerät gespeichert." />

      {items === null ? (
        <p className="text-sm" style={{ color: "var(--bm-text-muted)" }}>
          Lädt…
        </p>
      ) : items.length === 0 ? (
        <p className="bm-card p-4 text-sm" style={{ color: "var(--bm-text-muted)" }}>
          Noch nichts gemerkt. Öffne einen Vorgang und tippe oben auf „Merken“, dann
          erscheint er hier.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((m) => (
            <li key={m.slug} className="bm-card flex items-center gap-3 p-3.5">
              <Link
                href={`/vorgang?slug=${encodeURIComponent(m.slug)}`}
                className="flex min-w-0 flex-1 flex-col"
              >
                <span className="line-clamp-2 text-[0.86rem] font-medium leading-snug">{m.title}</span>
                <span className="text-[0.72rem]" style={{ color: "var(--bm-text-muted)" }}>
                  {m.type ? matterTypeLabel(m.type) : "Vorgang"}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => remove(m)}
                aria-label="Aus Merkliste entfernen"
                title="Aus Merkliste entfernen"
                className="bm-btn bm-btn--active shrink-0"
                style={{ padding: "0.3rem 0.6rem", color: "var(--bm-accent)" }}
              >
                <IconStar filled />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
