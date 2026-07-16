import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { AppBackHandler } from "./components/AppBackHandler";
import { BottomNav } from "./components/BottomNav";
import { ExternalLinkHandler } from "./components/ExternalLinkHandler";
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
  // Monitor-Scope: Kreis-Radar mit Live-Puls-Kurve (EKG-artig) und Live-Node,
  // dazu ein dezenter Chromatic-Aberration-Ghost (Magenta) fuer den Cyberpunk-
  // Touch. Passt zum Namen (Bundes-MONITOR), zum HUD-Look und zum Live-Puls im
  // Dashboard – neutral, kein Hoheitszeichen.
  return (
    <svg
      width="27"
      height="27"
      viewBox="0 0 32 32"
      aria-hidden="true"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Chromatic-Ghost (Magenta), leicht versetzt */}
      <g transform="translate(1 -0.6)" opacity="0.4" stroke="#ff3d9a" strokeWidth="1.5">
        <circle cx="16" cy="16" r="12" />
        <path d="M6.5 16.5h5l2-5 3 9.5 2-4.5h7" />
      </g>
      {/* Front (Akzent): Scope-Ring + Live-Puls */}
      <g stroke="var(--bm-accent)" strokeWidth="1.85">
        <circle cx="16" cy="16" r="12" />
        <path d="M6.5 16.5h5l2-5 3 9.5 2-4.5h7" />
      </g>
      {/* Live-Node am Ende der Kurve */}
      <circle cx="25.5" cy="16.5" r="1.5" fill="var(--bm-accent)" stroke="none" />
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
        <ExternalLinkHandler />
        <AppBackHandler />
        <NotificationManager />
        <OnboardingDialog />
          </KennzahlenProvider>
        </LangProvider>
      </body>
    </html>
  );
}
