"use client";

import { App } from "@capacitor/app";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLang } from "./LangProvider";

// Android-Zurück: auf Unterseiten navigiert es zurueck, auf der Startseite kommt
// ein Beenden-Dialog. Nur im nativen App-Kontext aktiv (im Browser ohne Wirkung).
export function AppBackHandler() {
  const { t } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    let remove: (() => void) | undefined;
    App.addListener("backButton", () => {
      if (pathRef.current !== "/") router.back();
      else setConfirm(true);
    })
      .then((h) => {
        remove = () => void h.remove();
      })
      .catch(() => {});
    return () => remove?.();
  }, [router]);

  if (!confirm) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.55)" }}
      role="dialog"
      aria-modal="true"
      onClick={() => setConfirm(false)}
    >
      <div className="bm-card w-full max-w-xs p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-semibold">{t("exit.frage")}</h2>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="bm-btn" onClick={() => setConfirm(false)}>
            {t("exit.abbrechen")}
          </button>
          <button
            type="button"
            className="bm-btn bm-btn--primary"
            onClick={() => void App.exitApp()}
          >
            {t("exit.beenden")}
          </button>
        </div>
      </div>
    </div>
  );
}
