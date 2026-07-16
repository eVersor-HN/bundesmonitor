"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { fetchLive, getCachedLive, type LiveData } from "@/lib/live";

const Ctx = createContext<LiveData | null>(null);

export function KennzahlenProvider({ children }: { children: ReactNode }) {
  const [live, setLive] = useState<LiveData | null>(null);

  useEffect(() => {
    // Erst den lokalen Cache anzeigen (kein Flackern), dann frisch nachladen.
    const cached = getCachedLive();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (cached) setLive(cached);
    void fetchLive().then((d) => d && setLive(d));
  }, []);

  // Globales "alles aktualisieren" (z. B. Ziehen nach unten am Seitenanfang).
  useEffect(() => {
    const onRefresh = () => void fetchLive().then((d) => d && setLive(d));
    window.addEventListener("bm:refresh", onRefresh);
    return () => window.removeEventListener("bm:refresh", onRefresh);
  }, []);

  return <Ctx.Provider value={live}>{children}</Ctx.Provider>;
}

export function useLive(): LiveData | null {
  return useContext(Ctx);
}
