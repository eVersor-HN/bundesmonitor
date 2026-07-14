# Bundesmonitor

**Quellenbasierter, chronologischer Monitor für Handlungen, Planungen, Entscheidungen, Geldflüsse und Termine des Bundes.**

Bundesmonitor macht in Sekunden sichtbar, *was die Regierung tut, wofür Geld ausgegeben wird und wie hoch z. B. die Kriminalität ist* – neutral, quellengestützt und ohne Wertung. Jede sichtbare Tatsachenbehauptung verweist auf die amtliche Originalquelle.

> Zielbild: **Was ist neu? Wer ist verantwortlich? Welchen Status hat es? Geht es um Geld? Was passiert als Nächstes? Wo ist die Originalquelle?** – beantwortet auf einen Blick.

---

## Warum Bundesmonitor?

Was der Bund tut, ist öffentlich – aber über Dutzende amtliche Portale verstreut, in Verwaltungssprache verpackt und kaum im Zusammenhang zu erfassen. Wer wissen will, welches Gesetz gerade läuft, wer es eingebracht hat, wie abgestimmt wurde und wohin Steuergeld fließt, muss heute an vielen Stellen suchen.

Bundesmonitor bündelt diese amtlichen Quellen an **einem** Ort und macht in Sekunden nachvollziehbar, **was Bundestag und Bundesregierung tun, wofür Geld ausgegeben wird und was als Nächstes ansteht** – neutral, ohne Wertung, und mit einem Link zur Originalquelle an jeder einzelnen Aussage.

Der Sinn dahinter: **Transparenz senkt die Hürde zur Mitbestimmung.** Ein einfacher Überblick für alle, die nur schnell wissen wollen, was los ist – und ein lückenloser Drilldown bis ins Detail für alle, die tiefer graben. Kostenlos, werbefrei, unabhängig und quelloffen.

---

## Projekt unterstützen

Bundesmonitor ist kostenlos, werbefrei und unabhängig. Wer das Projekt am Leben halten möchte:

- **PayPal:** [paypal.me/FAMarco](https://paypal.me/FAMarco)
- **Bitcoin:** `bc1qv92c3eyeqvhgfnez7spfd7v2aytkhpshsl65yv`

---

## Highlights

- **Live-Feed** aller Vorgänge, Drucksachen und Termine des Bundestages – direkt aus der amtlichen **DIP-Schnittstelle**.
- **Geld:** Schuldenstand (Live-Hochrechnung), Haushalt, Ressorts und **„Wem gibt der Staat Geld?"** (benannte Zuschüsse an NGOs, Kultur, Ehrenamt u. a. aus dem Bundeshaushalt).
- **Zahlen:** Kriminalität (PKS), Bevölkerung, Wirtschaftslage (Inflation, Arbeitslosenquote, BIP) – je Bundesland und bundesweit.
- **Akteure:** Regierung, Abgeordnete, Diäten und Bezüge.
- **Barrierefreiheit:** WCAG 2.2 AA im Blick, Textgrößen, Farbenblind-Modus, Screenreader-freundlich, deutsche Datums-/Zahlenformate.
- **Mehrsprachige Oberfläche** (Deutsch + weitere), amtliche Inhalte bleiben im Original.

## Architektur (serverlos)

Die ausgelieferte **Android-App** ist eine [Capacitor](https://capacitorjs.com/)-Hülle um einen statisch exportierten [Next.js](https://nextjs.org/)-Build. Sie kommt **ohne eigenen Server** aus:

- Daten werden **direkt aus der DIP-API** des Bundestages geladen (`apps/web/lib/dip.ts`). Das `CapacitorHttp`-Plugin routet die Anfragen nativ und umgeht so Browser-CORS.
- Nicht über DIP verfügbare Kennzahlen (Haushalt, Statistik) sind als geprüfte, quellenbelegte Datensätze ins App-Bundle eingebettet.
- Der **öffentliche DIP-Zugangsschlüssel** ist **nicht** in der App eingebettet: Beim ersten Start lädt die App ihn aus einer kleinen, zentral gepflegten JSON und validiert ihn gegen die API. Rotiert der Bundestag den Schlüssel, genügt eine Aktualisierung dieser JSON – installierte Apps ziehen automatisch nach. Wer mag, hinterlegt einen eigenen (bis zu 10 Jahre gültigen) Schlüssel.

Das Repository enthält zusätzlich ein optionales Backend (`apps/api`, `apps/worker`, `packages/core`) für den Eigenbetrieb; für die App ist es **nicht erforderlich**. Details: [`docs/adr/0002-serverlose-architektur-dip-direkt.md`](docs/adr/0002-serverlose-architektur-dip-direkt.md).

### Monorepo

| Pfad | Inhalt |
|---|---|
| `apps/web` | Next.js-Oberfläche (App Router, TypeScript, Tailwind) – wird statisch exportiert und in die App gebündelt |
| `android/` | Capacitor-Android-Projekt (nicht versioniert; aus `apps/web/out` erzeugt) |
| `apps/api`, `apps/worker`, `packages/core` | Optionales Backend für Eigenbetrieb (FastAPI, Celery, Ingestion/Normalisierung) |
| `docs/adr` | Architecture Decision Records |

## Build (Android-APK)

Voraussetzungen: Node ≥ 20, Android SDK, JDK.

```bash
npm ci
# Statischen Web-Export erzeugen und ins native Projekt kopieren
BUILD_TARGET=export npm run build:web
npx cap sync android
# App-Icons aus den Quellgrafiken in assets/ generieren (einmalig / bei Icon-Änderung)
npx capacitor-assets generate --android
# APK bauen
cd android && ./gradlew assembleDebug
```

Die APK liegt anschließend unter `android/app/build/outputs/apk/debug/`. Mindest-Android-Version: **7.0** (API 24).

## Datenquellen

Alle angezeigten Fakten stammen aus amtlichen Quellen. Es gelten jeweils deren Nutzungsbedingungen; Namensnennung erfolgt in der App an jeder Zahl bzw. Detailseite.

- **Deutscher Bundestag – DIP** (Dokumentations- und Informationssystem für Parlamentsmaterialien): Vorgänge, Drucksachen, Termine. <https://dip.bundestag.de/über-dip/hilfe/api>
- **Bundesministerium der Finanzen – Bundeshaushalt**: Einzelpläne, Zuschüsse/Zuwendungen. <https://www.bundeshaushalt.de/>
- **Statistisches Bundesamt (Destatis)**: Öffentliche Schulden, Bevölkerung, Wirtschaft (u. a. Datenlizenz Deutschland – Namensnennung 2.0). <https://www.destatis.de/>
- **Bundeskriminalamt (BKA) – Polizeiliche Kriminalstatistik (PKS)**: Kriminalitätszahlen. <https://www.bka.de/>
- **Bundesgesetzblatt (recht.bund.de)**, **Bundesregierung** u. a. für Verkündungen und Meldungen.

Die Marke, das Wappen und Logos des Bundes, der Ministerien oder Parteien werden **nicht** verwendet; die App nutzt ausschließlich eigene, neutrale Symbole.

## Grundsätze

- Keine politische Bewertung, kein Sentiment-Ranking, kein Framing durch Adjektive.
- Getrennte Zeitstempel (`veröffentlicht`, `ereignet`, `entdeckt`, `aktualisiert`, `wirksam`).
- Geldstatus werden nie zusammengeworfen (Plan, Soll, Ist, Verpflichtung, Bewilligung, Vergabe, Auszahlung).
- Bei Unsicherheit wird `unbekannt` gespeichert, nicht geraten.
- KI-gestützte Zusammenfassungen sind – falls vorhanden – klar gekennzeichnet und erzeugen keine neuen Fakten.

## Haftungsausschluss (Disclaimer)

Bundesmonitor ist ein **unabhängiges, nicht-amtliches** Bürgerinformations-Projekt und steht in **keiner Verbindung** zum Deutschen Bundestag, zur Bundesregierung, zu Ministerien oder Parteien. Die App **bereitet amtliche Daten auf**, ist aber selbst **keine amtliche Quelle**. Trotz sorgfältiger, quellengestützter Aufbereitung kann keine Gewähr für Richtigkeit, Vollständigkeit und Aktualität übernommen werden – **maßgeblich sind stets die verlinkten Originalquellen**. Die App bietet keine rechtliche, finanzielle oder politische Beratung. Die Nutzung erfolgt auf eigene Verantwortung.

## Lizenz

Quellcode: **MIT** – siehe [`LICENSE`](LICENSE). Angezeigte Daten unterliegen den Bedingungen der jeweiligen amtlichen Stelle (siehe „Datenquellen").
