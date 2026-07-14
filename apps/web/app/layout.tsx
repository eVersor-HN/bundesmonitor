import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { AppBackHandler } from "./components/AppBackHandler";
import { BottomNav } from "./components/BottomNav";
import { SwipeNav } from "./components/SwipeNav";
import { IconGear } from "./components/icons";
import { KennzahlenProvider } from "./components/KennzahlenProvider";
import { LangProvider } from "./components/LangProvider";
import { NotificationManager } from "./components/NotificationManager";
import { OnboardingDialog } from "./components/OnboardingDialog";
import { UpdateBanner } from "./components/UpdateBanner";

export const metadata: Metadata = {
  applicationName: "Bundesmonitor",
  title: "Bundesmonitor",
  description:
    "Quellenbasierter, chronologischer Monitor für Handlungen, Planungen, " +
    "Entscheidungen, Geldflüsse und Termine des Bundes.",
  appleWebApp: { capable: true, title: "Bundesmonitor", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Vollbild bis in den Displayausschnitt; Safe-Area-Insets stehen per env() bereit.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f5f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f19" },
  ],
};

// Verhindert Theme-Flackern: setzt data-theme vor dem ersten Paint.
const noFlashTheme = `(function(){try{var t=localStorage.getItem('bm:theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}var l=localStorage.getItem('bm:lang');if(l){document.documentElement.setAttribute('lang',l);document.documentElement.setAttribute('dir',l==='ar'?'rtl':'ltr');}var f=localStorage.getItem('bm:fontScale');if(f==='gross'||f==='sehrgross'){document.documentElement.setAttribute('data-fontscale',f);}if(localStorage.getItem('bm:cvd')==='1'){document.documentElement.setAttribute('data-cvd','1');}}catch(e){}})();`;

function BrandMark() {
  // "Visier": Fadenkreuz-Ring mit "M" (Monitor) - die Macht im Visier.
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 32 32"
      aria-hidden="true"
      fill="none"
      stroke="var(--bm-accent)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="16" cy="16" r="9.5" />
      <line x1="16" y1="4.5" x2="16" y2="1.8" />
      <line x1="16" y1="27.5" x2="16" y2="30.2" />
      <line x1="4.5" y1="16" x2="1.8" y2="16" />
      <line x1="27.5" y1="16" x2="30.2" y2="16" />
      <path d="M11.9 20.4V12l4.1 3.5L20.1 12v8.4" />
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <script dangerouslySetInnerHTML={{ __html: noFlashTheme }} />
        <LangProvider>
          <KennzahlenProvider>
          <a
            href="#hauptinhalt"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black"
        >
          Zum Hauptinhalt springen
        </a>

        <header
          className="sticky top-0 z-30 border-b"
          style={{
            borderColor: "var(--bm-border)",
            background: "var(--bm-surface)",
            paddingTop: "env(safe-area-inset-top)",
          }}
        >
          <div className="mx-auto flex max-w-5xl items-center gap-2 px-3 py-2.5">
            <Link href="/" className="flex min-w-0 items-center gap-2">
              <BrandMark />
              <span
                className="bm-glow-text whitespace-nowrap text-sm font-semibold tracking-[0.06em]"
                style={{ fontFamily: "var(--bm-mono)" }}
              >
                BUNDES<span style={{ color: "var(--bm-accent)" }}>MONITOR</span>
              </span>
            </Link>

            <Link
              href="/einstellungen"
              className="bm-btn ml-auto"
              style={{ padding: "0.4rem 0.5rem" }}
              aria-label="Optionen"
            >
              <IconGear size={18} />
            </Link>
          </div>
        </header>

        <main
          id="hauptinhalt"
          className="relative z-0 mx-auto max-w-5xl px-4 pb-24 pt-6"
          style={{ background: "var(--bm-bg)", minHeight: "100dvh", isolation: "isolate" }}
        >
          <UpdateBanner />
          {children}
        </main>

        <BottomNav />
        <SwipeNav />
        <AppBackHandler />
        <NotificationManager />
        <OnboardingDialog />
          </KennzahlenProvider>
        </LangProvider>
      </body>
    </html>
  );
}
