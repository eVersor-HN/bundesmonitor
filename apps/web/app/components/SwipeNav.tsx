"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// Horizontaler Wisch wechselt zum Nachbar-Tab. Reihenfolge MUSS der BottomNav
// entsprechen: Start → Parlament (/nib) → Geld → Akteure → Suche → Mehr.
const TABS = ["/", "/nib", "/geld", "/akteure", "/suche", "/mehr"];

function tabIndex(pathname: string): number {
  // Exakte Root, sonst Präfix – dieselbe Logik wie die aktive Nav-Markierung.
  return TABS.findIndex((href) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`),
  );
}

// Wisch ignorieren, wenn er in einem horizontal scrollbaren Element beginnt
// (Tabellen/Diagramme mit overflow-x), damit deren Scrollen nicht gekapert wird.
function startsInScroller(target: EventTarget | null): boolean {
  let node = target instanceof HTMLElement ? target : null;
  while (node && node !== document.body) {
    if (node.scrollWidth > node.clientWidth + 4) {
      const ox = getComputedStyle(node).overflowX;
      if (ox === "auto" || ox === "scroll") return true;
    }
    node = node.parentElement;
  }
  return false;
}

export function SwipeNav() {
  const router = useRouter();
  const pathname = usePathname();
  const start = useRef<{ x: number; y: number; t: number; ok: boolean } | null>(null);

  useEffect(() => {
    function onStart(e: TouchEvent) {
      if (e.touches.length !== 1) {
        start.current = null;
        return;
      }
      const tch = e.touches[0];
      start.current = { x: tch.clientX, y: tch.clientY, t: Date.now(), ok: !startsInScroller(e.target) };
    }
    function onEnd(e: TouchEvent) {
      const s = start.current;
      start.current = null;
      if (!s || !s.ok) return;
      const tch = e.changedTouches[0];
      const dx = tch.clientX - s.x;
      const dy = tch.clientY - s.y;
      if (Date.now() - s.t > 800) return; // zu langsam
      if (Math.abs(dx) < 64) return; // zu kurz
      if (Math.abs(dx) < Math.abs(dy) * 1.6) return; // nicht überwiegend horizontal
      const idx = tabIndex(pathname);
      if (idx < 0) return; // nicht auf einem der Tabs → nichts tun
      const next = dx < 0 ? idx + 1 : idx - 1; // nach links wischen = vorwärts
      if (next < 0 || next >= TABS.length) return;
      router.push(TABS[next]);
    }
    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchend", onEnd);
    };
  }, [pathname, router]);

  return null;
}
