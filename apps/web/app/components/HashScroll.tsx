"use client";

import { useEffect } from "react";

// Scrollt nach der Navigation zum Anker aus dem URL-Hash. Nötig, weil manche
// Zielsektionen (z. B. auf /anstehend) beim ersten Frame noch `null` rendern
// (sie warten auf einen Client-Timer). Zum Zeitpunkt der Next.js-Hash-Navigation
// ist das Ziel dann leer -> es wird nicht gescrollt. Wir warten daher per
// requestAnimationFrame, bis die Sektion echten Inhalt (Höhe > 0) hat, und
// scrollen erst dann. `scroll-mt-*` am Ziel sorgt für den Header-Abstand.
export function HashScroll() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    let raf = 0;
    let tries = 0;
    const tick = () => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().height > 0) {
        el.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
      // Höchstens ~40 Frames warten, dann aufgeben (Sektion bleibt evtl. leer).
      if (tries++ < 40) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
