"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { IconChevron } from "./icons";

// Aufklappbarer Abschnitt (Disclosure). Zeigt optional die Anzahl aktiver
// Einträge als Badge.
export function Dropdown({
  title,
  badge = 0,
  defaultOpen = false,
  children,
}: {
  title: string;
  badge?: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bm-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          {title}
          {badge > 0 && (
            <span
              className="bm-mono rounded-full px-1.5 text-[0.68rem]"
              style={{
                color: "var(--bm-accent)",
                border: "1px solid color-mix(in srgb, var(--bm-accent) 45%, transparent)",
              }}
            >
              {badge}
            </span>
          )}
        </span>
        <span
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.15s ease",
            color: "var(--bm-text-muted)",
          }}
        >
          <IconChevron />
        </span>
      </button>
      {open && (
        <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: "var(--bm-border)" }}>
          {children}
        </div>
      )}
    </div>
  );
}
