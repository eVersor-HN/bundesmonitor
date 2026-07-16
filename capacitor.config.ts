import type { CapacitorConfig } from "@capacitor/cli";

// Bundesmonitor als native Android-Huelle um die statisch exportierte Web-App.
// Die Oberflaeche liegt im APK (apps/web/out); Daten holt sie serverlos direkt
// von der DIP-API des Bundestages (mit Nutzer-Schluessel).
//
// CapacitorHttp patcht window.fetch/XMLHttpRequest und leitet Requests nativ
// (ausserhalb der WebView) - damit umgeht der DIP-Direktabruf das Browser-CORS,
// das search.dip.bundestag.de sonst blockieren wuerde.
// Kein cleartext/allowMixedContent: die App spricht ausschliesslich HTTPS
// (DIP-API, Gist). So bleibt der Standard-Schutz gegen Klartext-Traffic aktiv.
const config: CapacitorConfig = {
  appId: "de.bundesmonitor.app",
  appName: "Bundesmonitor",
  webDir: "apps/web/out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
