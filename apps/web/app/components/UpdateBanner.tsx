"use client";

import { useEffect, useState } from "react";
import { fetchAppVersion, type AppVersionInfo } from "@/lib/api";
import { APP_VERSION_CODE } from "@/lib/version";

// Zeigt einen dezenten Hinweis, sobald der Server eine neuere App-Version
// meldet (versionCode groesser als der eingebaute). Ein Tipp auf "Herunterladen"
// oeffnet den Download der neuen Version. Pro Version wegklickbar.
const DISMISS_KEY = "bm:updateDismissed";

export function UpdateBanner() {
  const [info, setInfo] = useState<AppVersionInfo | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    void fetchAppVersion().then((v) => {
      if (!v || typeof v.versionCode !== "number") return;
      if (v.versionCode <= APP_VERSION_CODE) return;
      const seen = Number(window.localStorage.getItem(DISMISS_KEY) ?? "0");
      setInfo(v);
      setDismissed(seen >= v.versionCode);
    });
  }, []);

  if (!info || dismissed) return null;

  function close() {
    if (info) window.localStorage.setItem(DISMISS_KEY, String(info.versionCode));
    setDismissed(true);
  }

  return (
    <div
      className="bm-card mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 p-3"
      style={{ borderColor: "color-mix(in srgb, var(--bm-accent) 45%, var(--bm-border))" }}
      role="status"
    >
      <div className="min-w-0 flex-1">
        <div className="text-[0.82rem] font-semibold">
          Neue Version {info.versionName} verfügbar
        </div>
        {info.notes && (
          <div className="text-[0.72rem]" style={{ color: "var(--bm-text-muted)" }}>
            {info.notes}
          </div>
        )}
      </div>
      <a
        href={info.downloadUrl}
        rel="noopener noreferrer"
        target="_blank"
        className="bm-btn bm-btn--primary"
        style={{ padding: "0.3rem 0.8rem", fontSize: "0.78rem" }}
      >
        Herunterladen
      </a>
      <button
        type="button"
        onClick={close}
        aria-label="Hinweis schließen"
        className="bm-btn"
        style={{ padding: "0.2rem 0.5rem", fontSize: "0.8rem" }}
      >
        ✕
      </button>
    </div>
  );
}
