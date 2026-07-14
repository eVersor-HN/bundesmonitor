import type { MetadataRoute } from "next";

// Statisch erzeugen (noetig fuer output: export / die Capacitor-APK).
export const dynamic = "force-static";

// Web-App-Manifest: macht Bundesmonitor auf dem Handy installierbar
// ("Zum Startbildschirm hinzufuegen") und im Standalone-Modus lauffaehig.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bundesmonitor",
    short_name: "Bundesmonitor",
    description:
      "Quellenbasierter, chronologischer Monitor fuer Handlungen, Planungen und " +
      "Geldfluesse des Bundes.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfbfa",
    theme_color: "#1f5c8b",
    lang: "de",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
