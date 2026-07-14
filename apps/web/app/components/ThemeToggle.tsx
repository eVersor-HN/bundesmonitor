"use client";

import { useEffect, useState } from "react";
import { IconMonitor, IconMoon, IconSun } from "./icons";

type Theme = "system" | "light" | "dark";
const ORDER: Theme[] = ["system", "light", "dark"];
const STORAGE = "bm:theme";

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = (window.localStorage.getItem(STORAGE) as Theme | null) ?? "system";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(stored);
  }, []);

  function cycle() {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    setTheme(next);
    window.localStorage.setItem(STORAGE, next);
    apply(next);
  }

  const label =
    theme === "system" ? "System" : theme === "light" ? "Hell" : "Dunkel";

  return (
    <button
      type="button"
      onClick={cycle}
      className="bm-btn"
      style={{ padding: "0.35rem 0.6rem" }}
      aria-label={`Design: ${label} (umschalten)`}
      title={`Design: ${label}`}
    >
      {theme === "system" ? (
        <IconMonitor size={18} />
      ) : theme === "light" ? (
        <IconSun size={18} />
      ) : (
        <IconMoon size={18} />
      )}
      <span className="hidden sm:inline text-xs">{label}</span>
    </button>
  );
}
