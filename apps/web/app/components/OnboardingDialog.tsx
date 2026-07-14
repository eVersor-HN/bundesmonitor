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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!getOnboarded()) setOpen(true);
  }, []);

  useEffect(() => {
    if (open) primaryRef.current?.focus();
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
      className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bm-onb-title"
    >
      <div className="bm-card w-full max-w-md p-5" style={{ maxHeight: "90dvh", overflowY: "auto" }}>
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
            Das Kontingent wird mit anderen geteilt.
          </p>
          {error && !showKeyInput && (
            <p className="text-xs" style={{ color: "var(--bm-status-down, #c0392b)" }} role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--bm-border)" }}>
          {!showKeyInput ? (
            <button
              type="button"
              onClick={() => setShowKeyInput(true)}
              className="bm-link text-left text-sm leading-tight"
            >
              Eigenen Schlüssel eintragen
              <span className="mt-0.5 block text-xs" style={{ color: "var(--bm-text-muted)" }}>
                schneller, unabhängig
              </span>
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <label htmlFor="bm-onb-key" className="text-sm font-semibold">
                Eigener DIP-API-Schlüssel
              </label>
              <p className="text-xs" style={{ color: "var(--bm-text-muted)" }}>
                Einen kostenlosen, personalisierten Schlüssel (bis zu 10 Jahre gültig) beantragst du
                auf der{" "}
                <a
                  className="underline"
                  href={DIP_HELP_URL}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  DIP-API-Hilfeseite
                </a>
                .
              </p>
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
                  style={{ padding: "0.3rem 0.7rem", fontSize: "0.75rem" }}
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
