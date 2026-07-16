"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

// In der nativen App (Capacitor-WebView) oeffnet ein <a target="_blank"> nichts:
// die WebView kann kein neues Fenster erzeugen. Dieser globale Handler faengt
// Klicks auf externe Links ab und oeffnet http/https in einem System-Browser-Tab
// (Chrome Custom Tab via @capacitor/browser); mailto/tel gehen per Navigation ans
// System (Mail-/Telefon-App). Interne App-Links (relative Pfade) bleiben unberuehrt.
export function ExternalLinkHandler() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href) return;
      if (/^https?:/i.test(href) && !href.startsWith(window.location.origin)) {
        e.preventDefault();
        void Browser.open({ url: href });
      } else if (/^(mailto:|tel:)/i.test(href)) {
        e.preventDefault();
        window.location.href = href;
      }
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
