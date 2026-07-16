"use client";

import { useEffect, useRef, useState } from "react";
import { checkDipKey, fetchPublicDipKey } from "@/lib/dip";
import { getOnboarded, setDipKey, setOnboarded, setPublicDipKey } from "@/lib/config";

// Erststart-Hinweisfenster. Bundesmonitor holt die Daten serverlos direkt aus
// der DIP-API des Bundestages. "Loslegen" laedt den aktuellen oeffentlichen
// Schluessel live von der DIP-Hilfeseite (kein Schluessel im APK eingebettet);
// wer einen eigenen (10-Jahres-)Schluessel hat, kann ihn hier hinterlegen.
// Erscheint nur, bis das Onboarding abgeschlossen ist.

const DIP_HELP_URL = "https://dip.bundestag.de/%C3%BCber-dip/hilfe/api";

export function OnboardingDialog() {
  const [open, setOpen] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyValue, setKeyValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!getOnboarded()) setOpen(true);
  }, []);

  useEffect(() => {
    if (open) primaryRef.current?.focus();
  }, [open]);

  // A11y: Fokus im Dialog halten (Tab/Shift+Tab), Escape schliesst, und der
  // Hintergrund wird fuer Tastatur und assistive Technik deaktiviert (inert).
  // Escape verwirft nur temporaer (kein setOnboarded) – der Dialog erscheint beim
  // naechsten Start erneut, statt den Nutzer ohne Datenzugang zurueckzulassen.
  useEffect(() => {
    if (!open) return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    // Nicht-null-Bindung fuer die Closures (TS behaelt die Verengung dort nicht).
    const node: HTMLDivElement = overlay;

    const parent = overlay.parentElement;
    const inerted: HTMLElement[] = [];
    if (parent) {
      for (const el of Array.from(parent.children)) {
        if (el !== overlay && el instanceof HTMLElement) {
          el.setAttribute("inert", "");
          el.setAttribute("aria-hidden", "true");
          inerted.push(el);
        }
      }
    }

    function focusable(): HTMLElement[] {
      const sel =
        'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])';
      return Array.from(node.querySelectorAll<HTMLElement>(sel)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (activeEl === first || !node.contains(activeEl)) {
          e.preventDefault();
          last.focus();
        }
      } else if (activeEl === last || !node.contains(activeEl)) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      for (const el of inerted) {
        el.removeAttribute("inert");
        el.removeAttribute("aria-hidden");
      }
    };
  }, [open]);

  if (!open) return null;

  function finish() {
    setOnboarded(true);
    setOpen(false);
  }

  // Loslegen: den aktuellen oeffentlichen Schluessel live von der DIP-Hilfeseite
  // holen, gegen die API validieren und speichern. Kein Schluessel im APK.
  async function acceptPublicKey() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const key = await fetchPublicDipKey();
    setBusy(false);
    if (key) {
      setPublicDipKey(key);
      finish();
    } else {
      setError(
        "Öffentlicher Schlüssel konnte nicht geladen werden (Netz/Seite). Bitte erneut versuchen oder eigenen Schlüssel eintragen.",
      );
    }
  }

  async function saveOwnKey() {
    const trimmed = keyValue.trim();
    if (!trimmed) {
      setError("Bitte einen Schlüssel einfügen.");
      return;
    }
    setBusy(true);
    setError(null);
    // Temporaer setzen, dann gegen DIP pruefen. Bei Fehlschlag zuruecksetzen,
    // damit die App weiter mit dem oeffentlichen Schluessel funktioniert.
    setDipKey(trimmed);
    const r = await checkDipKey();
    setBusy(false);
    if (r.ok) {
      finish();
    } else {
      setDipKey("");
      setError(`${r.message}. Bitte Schlüssel prüfen oder oben den öffentlichen laden.`);
    }
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setKeyValue(text.trim());
    } catch {
      // Kein Zugriff auf die Zwischenablage: Nutzer fuegt manuell ein.
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bm-onb-title"
    >
      <div className="bm-card bm-card--roomy w-full max-w-md" style={{ maxHeight: "90dvh", overflowY: "auto" }}>
        <h2 id="bm-onb-title" className="bm-h1 text-lg">
          Willkommen bei Bundesmonitor
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--bm-text-muted)" }}>
          Die App zeigt Vorgänge, Drucksachen und Termine des Bundestages –{" "}
          <strong>direkt aus der amtlichen DIP-Schnittstelle</strong>, ohne Umweg über einen
          eigenen Server. Dafür wird ein kostenloser Zugangsschlüssel des Bundestages verwendet.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <button
            ref={primaryRef}
            type="button"
            onClick={() => void acceptPublicKey()}
            disabled={busy}
            className="bm-btn bm-btn--primary w-full justify-center"
          >
            {busy ? "Lädt Schlüssel…" : "Loslegen (öffentlicher Schlüssel)"}
          </button>
          <p className="text-xs" style={{ color: "var(--bm-text-muted)" }}>
            Lädt den aktuellen öffentlichen Sammelschlüssel des Bundestages und legt sofort los.
            Geteiltes Kontingent · Haltbarkeit ca. 6 Monate.
          </p>
          {error && !showKeyInput && (
            <p className="text-xs" style={{ color: "var(--bm-status-down, #c0392b)" }} role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--bm-border)" }}>
          <div className="mb-2 flex flex-col gap-0.5">
            <span className="text-sm font-semibold">Eigener Schlüssel (optional)</span>
            <span className="text-xs" style={{ color: "var(--bm-text-muted)" }}>
              Schneller und unabhängig vom geteilten Kontingent · Haltbarkeit bis zu 10 Jahre.
            </span>
          </div>
          <a
            href={DIP_HELP_URL}
            rel="noopener noreferrer"
            target="_blank"
            className="bm-btn w-full justify-center"
          >
            Schlüssel beim Bundestag beantragen ↗
          </a>
          {!showKeyInput ? (
            <button
              type="button"
              onClick={() => setShowKeyInput(true)}
              className="bm-link mt-2 block text-left text-sm"
            >
              Schlüssel schon vorhanden? Hier eintragen
            </button>
          ) : (
            <div className="mt-2 flex flex-col gap-2">
              <label htmlFor="bm-onb-key" className="text-sm font-semibold">
                Eigenen Schlüssel eintragen
              </label>
              <div className="flex gap-2">
                <input
                  id="bm-onb-key"
                  type="text"
                  value={keyValue}
                  onChange={(e) => setKeyValue(e.target.value)}
                  className="bm-input bm-mono flex-1"
                  placeholder="z. B. I9FKdCn.aBcDeF…"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => void pasteFromClipboard()}
                  className="bm-btn"
                  style={{ padding: "0.4rem 0.8rem", minHeight: "2.75rem", fontSize: "0.75rem" }}
                >
                  Einfügen
                </button>
              </div>
              {error && (
                <p className="text-xs" style={{ color: "var(--bm-status-down, #c0392b)" }} role="alert">
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={() => void saveOwnKey()}
                disabled={busy}
                className="bm-btn bm-btn--primary w-full justify-center"
              >
                {busy ? "Prüfe…" : "Prüfen & speichern"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
