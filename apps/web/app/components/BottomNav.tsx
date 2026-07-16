"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { IconChart, IconGrid, IconMonitor, IconPulse, IconSearch, IconUsers } from "./icons";
import { useLang } from "./LangProvider";

// Entitäts-Achsen statt gemischter Themen-Tabs: Start (Überblick), Parlament
// (Live-Feed/Vorgänge, Route bleibt /nib), Geld, Akteure, Suche, Mehr (Statistik,
// Mitmachen, Anstehend, Rechtliches …). Reihenfolge MUSS SwipeNav entsprechen.
const ITEMS: { href: string; key: string; label?: string; icon: ReactNode }[] = [
  { href: "/", key: "nav.jetzt", icon: <IconMonitor /> },
  { href: "/nib", key: "nav.parlament", icon: <IconPulse /> },
  { href: "/geld", key: "nav.geld", icon: <IconChart /> },
  { href: "/akteure", key: "nav.akteure", icon: <IconUsers /> },
  { href: "/suche", key: "nav.suche", icon: <IconSearch size={22} /> },
  { href: "/mehr", key: "nav.mehr", icon: <IconGrid /> },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLang();

  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t"
      style={{
        borderColor: "var(--bm-border)",
        background: "var(--bm-surface)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <ul className="mx-auto flex max-w-xl items-stretch justify-around">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center gap-1 px-0.5 py-2 text-[0.64rem]"
                style={{ color: active ? "var(--bm-accent)" : "var(--bm-text-muted)" }}
              >
                <span
                  className="flex h-8 w-12 items-center justify-center rounded-full transition-colors"
                  style={
                    active
                      ? {
                          background: "color-mix(in srgb, var(--bm-accent) 15%, transparent)",
                          boxShadow: "var(--bm-glow)",
                        }
                      : undefined
                  }
                >
                  {item.icon}
                </span>
                <span className="max-w-full truncate">{item.label ?? t(item.key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
