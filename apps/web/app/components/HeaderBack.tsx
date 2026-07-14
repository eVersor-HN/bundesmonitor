"use client";

import { usePathname, useRouter } from "next/navigation";
import { IconArrowLeft } from "./icons";
import { useLang } from "./LangProvider";

// Zurueck-Button im Header, auf allen Unterseiten (nicht auf der Startseite).
export function HeaderBack() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLang();
  if (pathname === "/") return null;
  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label={t("ui.back")}
      className="bm-btn"
      style={{ padding: "0.35rem 0.5rem" }}
    >
      <IconArrowLeft size={18} />
    </button>
  );
}
