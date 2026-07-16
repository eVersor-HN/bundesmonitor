# ADR 0002: Serverlose Architektur – Client direkt gegen DIP

- Status: akzeptiert
- Datum: 2026-07-13

## Kontext

Die App wird ausschließlich als Android-APK ausgeliefert (Capacitor-Hülle um den
statischen Next.js-Export `apps/web/out`); eine Web-/Browser-Variante ist nicht
vorgesehen. Bisher holte die App ihre normalisierten Daten von einem eigenen
Backend (`apps/api` + `apps/worker` + PostgreSQL/Redis), das DIP ingestiert und
über `/api/v1/*` ausliefert.

Ziel: **kein dauerhaft betriebener Server**. Nutzer sollen die App sofort
verwenden können; die Datenbeschaffung erfolgt direkt aus der amtlichen
DIP-Schnittstelle des Bundestages mit einem Nutzer-Schlüssel. Der öffentliche
DIP-Sammelschlüssel ist vorbelegt (1-Tipp-Start), ein eigener (bis zu 10 Jahre
gültiger) Schlüssel kann hinterlegt werden.

## Entscheidungen

1. **Client-direkter DIP-Abruf.** `apps/web/lib/dip.ts` spricht
   `https://search.dip.bundestag.de/api/v1` direkt an (`/vorgang`,
   `/vorgangsposition`, `/drucksache`), Schlüssel als `apikey`-Query. Die reinen
   Parser sind eine 1:1-Portierung von `packages/core/.../dip/parser.py` (gleiche
   Abbildung von Vorgangstyp, Partei, Slugs, Ereignistypen), damit die
   getestete, neutrale Normalisierung erhalten bleibt (CLAUDE.md Regeln 3, 5, 7).

2. **Unveränderte Lese-API-Signaturen.** `lib/api.ts` behält
   `fetchFeed/fetchMatter/fetchTimeline/fetchDocuments/fetchTopics/fetchStats/…`,
   ruft aber intern `dip.ts`. Blast-Radius = 0 für die bestehenden Seiten. Der
   stale-while-revalidate-Offline-Cache bleibt erhalten.

3. **CORS via CapacitorHttp.** `capacitor.config.ts` aktiviert das
   `CapacitorHttp`-Plugin; `fetch` läuft nativ außerhalb der WebView und umgeht
   das Browser-CORS, das `search.dip.bundestag.de` sonst blockieren würde. Da es
   keine Browser-Auslieferung gibt, entsteht kein CORS-Problem im Feld.

4. **Schlüssel-Onboarding.** Erststart-Dialog (`OnboardingDialog`) mit
   vorbelegtem öffentlichem Schlüssel (sofort nutzbar) und optionaler Eingabe
   eines eigenen Schlüssels inkl. Validierung per DIP-Test-Request. Speicherung
   lokal (localStorage), kein Konto (Datenschutz).

5. **Nicht-DIP-Daten werden gebündelt.** Nationale Kennzahlen liegen als
   statisches Asset `public/kennzahlen.json` im APK (`lib/live.ts` liest sie
   relativ, optional per `NEXT_PUBLIC_KENNZAHLEN_URL` extern). Länder-/Krimi-/
   Haushalts-/Steuerdaten waren bereits statisch im Bundle und bleiben es.

## Bewusste Degradierungen (pragmatischer Mix)

Serverlos nicht exakt reproduzierbar, weil sie eine DB-weite Aggregation über den
gesamten Bestand bräuchten:

- **Themen-Counts / Filter-Chips:** aus der aktuell geladenen Feed-Seite
  angenähert (`dipTopicCounts`), nicht über den Gesamtbestand. Feed-Filter
  (Partei/Ort/Thema/Typ/Volltext) wirken clientseitig auf die geladene Seite.
- **Statistik-Kacheln:** `matters`/`documents`/`events_7d` exakt aus DIP-`numFound`;
  `laws_promulgated` serverlos nicht bestimmbar → `0`.
- **Namentliche Abstimmungen:** stammen von bundestag.de (XLSX, kein API-Key),
  nicht aus DIP. Ausgeliefert als **gebündelter Snapshot**
  (`lib/data/votesSnapshot.ts`), out-of-band gepflegt. Leerer Snapshot zeigt
  „keine Abstimmungen" statt erfundener Zahlen (CLAUDE.md Regel 7).
- **App-Update-Hinweis:** ohne Server kein Live-Versionscheck; optional über eine
  statische `NEXT_PUBLIC_VERSION_URL` (z. B. GitHub-Release-Asset), sonst kein
  Hinweis.
- **Quellen-Historie / Korrektur- und Löscherkennung / `source_health` /
  Dead-Letter / Roh-Archiv:** entfallen im Direktabruf. `/status` zeigt nur die
  DIP-Erreichbarkeit. Damit wird die in CLAUDE.md geforderte Archivierung roher
  Antworten (Regel 2, 8) im serverlosen Betrieb **nicht** erfüllt – siehe Folgen.

## Folgen

- **Positiv:** kein Serverbetrieb/-kosten; Daten live und quellennah; deutlich
  kleinere Angriffsfläche; App sofort nutzbar.
- **Negativ / offen:** keine übergreifende Aggregation, keine Verlaufs-/
  Änderungserkennung, kein Rohdaten-Archiv. Das öffentliche Sammel-Schlüssel-
  Kontingent ist geteilt (Rate-Limit) – eigener Schlüssel wird empfohlen.
- Das Backend (`apps/api`, `apps/worker`, `packages/core`) bleibt im Repo für
  optionalen Eigenbetrieb/Tests, ist aber nicht mehr Voraussetzung der App.

## Alternativen

- **Serverless-Proxy** (Cloud Function hält den Schlüssel, cached, löst CORS):
  verworfen zugunsten „Nutzer bringt eigenen Schlüssel", da kein Betrieb gewünscht.
- **Vollständiges statisches Vorab-Bundle des DIP-Bestands:** verworfen (zu groß,
  veraltet zwischen Releases). Live-Abruf bevorzugt.
