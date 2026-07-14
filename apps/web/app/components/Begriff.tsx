"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { GLOSSAR } from "@/lib/glossar";
import { useLang } from "./LangProvider";

// Tippbarer Fachbegriff: gepunktet unterstrichen; ein Tipp oeffnet ein
// kleines Erklaer-Popup (Glossar). Schliessen per X, Tipp daneben oder Escape.
export function Begriff({ k, children }: { k: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const eintrag = GLOSSAR[k];
  const { t } = useLang();

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!eintrag) return <>{children}</>;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="cursor-help"
        style={{
          font: "inherit",
          color: "var(--bm-accent)",
          textDecoration: "underline dotted",
          textDecorationThickness: "1px",
          textUnderlineOffset: "3px",
        }}
        title={`Was bedeutet „${eintrag.titel}“?`}
      >
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Erklärung: ${eintrag.titel}`}
          onClick={() => setOpen(false)}
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="bm-card bm-fadeup w-full max-w-sm p-4"
            onClick={(e) => e.stopPropagation()}
            style={{ borderColor: "color-mix(in srgb, var(--bm-accent) 40%, var(--bm-border))" }}
          >
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold" style={{ color: "var(--bm-accent)" }}>
                {eintrag.titel}
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("begriff.schliessen")}
                className="bm-btn"
                style={{ padding: "0.1rem 0.55rem", fontSize: "0.8rem" }}
              >
                ✕
              </button>
            </div>
            <p className="text-[0.82rem] leading-relaxed">{eintrag.text}</p>
          </div>
        </div>
      )}
    </>
  );
}
