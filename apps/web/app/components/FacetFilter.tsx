"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchTopics } from "@/lib/api";
import type { TopicCount } from "@/lib/types";
import { toggleInParam } from "@/lib/urlfilter";
import { useLang } from "./LangProvider";
import { Dropdown } from "./Dropdown";

const BUNDESLAENDER = new Set([
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
]);

function Chips({
  items,
  active,
  onToggle,
}: {
  items: TopicCount[];
  active: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((t) => {
        const on = active.includes(t.key);
        return (
          <li key={t.key}>
            <button
              type="button"
              onClick={() => onToggle(t.key)}
              aria-pressed={on}
              className={`bm-btn${on ? " bm-btn--active" : ""}`}
              style={{ padding: "0.2rem 0.7rem", fontSize: "0.72rem" }}
            >
              {t.label}
              <span className="bm-mono ml-1" style={{ color: "var(--bm-text-muted)" }}>
                {t.matter_count}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function FacetFilter({ basePath = "/themen" }: { basePath?: string }) {
  const { t } = useLang();
  const router = useRouter();
  const sp = useSearchParams();
  const [parties, setParties] = useState<TopicCount[]>([]);
  const [orte, setOrte] = useState<TopicCount[]>([]);

  useEffect(() => {
    void fetchTopics("partei").then((t) => t && setParties(t));
    void fetchTopics("ort").then(
      (t) => t && setOrte(t.filter((o) => BUNDESLAENDER.has(o.label))),
    );
  }, []);

  function toggle(name: string, key: string) {
    const qs = toggleInParam(sp, name, key);
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  if (parties.length === 0 && orte.length === 0) return null;

  const activeParty = sp.getAll("party");
  const activeOrt = sp.getAll("bundesland");

  return (
    <div className="flex flex-col gap-2">
      {parties.length > 0 && (
        <Dropdown title={t("feed.partei")} badge={activeParty.length}>
          <Chips items={parties} active={activeParty} onToggle={(k) => toggle("party", k)} />
        </Dropdown>
      )}
      {orte.length > 0 && (
        <Dropdown title={t("feed.bundesland")} badge={activeOrt.length}>
          <Chips items={orte} active={activeOrt} onToggle={(k) => toggle("bundesland", k)} />
        </Dropdown>
      )}
    </div>
  );
}
