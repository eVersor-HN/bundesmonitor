# Quellenkatalog

Stand der Prüfung: 12.07.2026. Vor Implementierung immer aktuelle Dokumentation und Nutzungsbedingungen erneut prüfen.

## Prioritaet A - MVP

### 1. DIP - Dokumentations- und Informationssystem für Parlamentsmaterialien

- Zweck: Vorgange, Vorgangspositionen, Aktivitaeten, Personen, Drucksachen und Plenarprotokolle
- Zugriff: REST API, JSON/XML, API-Key erforderlich
- Basis: `https://search.dip.bundestag.de/api/v1`
- OpenAPI: `https://search.dip.bundestag.de/api/v1/openapi.yaml`
- Aktualisierungsabfrage: `f.aktualisiert.start`
- Besonderheit: laut Dokumentation etwa 15 Minuten Zeitversatz; Abfragefenster ueberlappen
- Parallelitaet: nicht mehr als 25 gleichzeitige API-Anfragen
- Polling MVP: alle 15 Minuten, 30 Minuten Ueberlappung

### 2. Bundesregierung RSS

- Kompakt: `https://www.bundesregierung.de/service/rss/breg-de/1151242/feed.xml`
- Pressemitteilungen: `https://www.bundesregierung.de/service/rss/breg-de/1151244/feed.xml`
- Bulletin: `https://www.bundesregierung.de/service/rss/breg-de/2318648/feed.xml`
- Ergänzend HTML: Kabinettsergebnisse, Pressekonferenzen, Reden, Livestreams
- Polling: alle 5 Minuten

### 3. Regierungspressekonferenzen

- Liste: `https://www.bundesregierung.de/breg-de/aktuelles/pressekonferenzen`
- Inhalt: Wortprotokolle/Mitschriften, Themenliste, teils Video
- Methode: HTML-Collector mit strukturiertem Textparser
- Polling: alle 15 Minuten an Konferenztagen, sonst stuendlich

### 4. Bundespressekonferenz

- Termine: `https://www.bundespressekonferenz.de/pressekonferenzen/termine`
- Inhalt: Regierungspressekonferenzen und weitere Pressekonferenzen
- Methode: vorsichtiger HTML-Collector; Termine können entfallen oder geändert werden
- Wichtig: BPK ist ein Journalistenverein, keine Bundesbehoerde. Entsprechend kennzeichnen.
- Streams können zugangsbeschraenkt sein; keine Umgehung implementieren.

### 5. Bundesrat

- Tagesordnungen: `https://www.bundesrat.de/DE/plenum/to-plenum/to-plenum-node.html`
- RSS-Uebersicht: `https://www.bundesrat.de/DE/service-navi/rss/rss-node.html`
- Feeds umfassen unter anderem neue Beratungsvorgaenge, Drucksachen, Plenarprotokolle und Ausschusstermine.
- Besonderheit: Tagesordnungen können bis Sitzungsbeginn durch Nachträge veraendert werden.
- Polling: RSS 5 Minuten, Tagesordnungsseiten 15 Minuten in den letzten 48 Stunden vor Sitzung

### 6. Bundesgesetzblatt

- Datenservice: `https://www.recht.bund.de/de/service/webservice/webservice.html`
- RSS Teil I: `https://www.recht.bund.de/rss/feeds/rss_bgbl-1.xml`
- RSS Teil II analog über Datenservice ermitteln und nicht blind annehmen
- Zweck: rechtlich massgebliche Verkuendungen, ELI-Permalinks
- Polling: 5 Minuten

### 7. Bundestag RSS und offene Daten

- RSS-Uebersicht: `https://www.bundestag.de/services/rss/`
- Ausschuss-Tagesordnungen: `https://www.bundestag.de/static/appdata/includes/rss/tagesordnungen.rss`
- Plenarprotokolle: `https://www.bundestag.de/static/appdata/includes/rss/plenarprotokolle.rss`
- Open Data: `https://www.bundestag.de/services/opendata`
- Plenartagesordnungen: `https://www.bundestag.de/parlament/plenum/tagesordnungen`
- Namentliche Abstimmungen: `https://www.bundestag.de/parlament/plenum/abstimmung/liste`
- Formate: XML, JSON, XLSX, PDF, HTML

## Prioritaet B - Geld und Transparenz

### 8. Bundeshaushalt

- Portal: `https://www.bundeshaushalt.de/`
- Download: `https://www.bundeshaushalt.de/DE/Download-Portal/download-portal.html`
- Daten: Soll/Ist, Einzelplaene, Haushaltsjahre, Sondervermoegen
- Lizenzhinweis: oeffentliche Daten dürfen verarbeitet und zusammengefuehrt werden; rechtlich verbindlich bleibt das offizielle Dokument.
- Frequenz: taeglich und bei Haushaltsereignissen zusätzlich

### 9. Förderkatalog des Bundes

- Start: `https://foerderportal.bund.de/foekat/jsp/StartAction.do`
- Inhalt: insbesondere Forschungs-, Entwicklungs- und Innovationsvorhaben
- Export: Ergebnislisten unter anderem als Text/Excel/PDF je nach Portalzustand
- Harte Einschraenkung: nicht vollständig; Veröffentlichung frühestens 60 Tage nach Bewilligung
- Anzeige in App: immer Warnhinweis zur Abdeckung

### 10. BMZ-Transparenzportal und IATI

- Portal: `https://www.bmz.de/de/ministerium/zahlen-fakten/bmz-transparenzportal`
- Standard: IATI XML
- Inhalt: Projekte, Regionen, Sektoren, Laufzeiten, Organisationen und Finanzinformationen
- Ergänzend GovData und IATI Registry verwenden
- Frequenz: taeglich

### 11. Oeffentliche Vergaben

- service.bund.de RSS: `https://www.service.bund.de/Content/DE/Service/RSS/rss_node.html`
- Datenservice Oeffentlicher Einkauf: `https://www.bescha.bund.de/DE/ElektronischerEinkauf/Datenservice_Oeffentlicher_Einkauf/Datenservice-Oeffentlicher-Einkauf_node.html`
- Bundesportal Vergabe: `https://verwaltung.bund.de/portal/DE/info-pages/vergabe`
- EU-weite Verfahren: eForms/TED als rechtlich massgebliche Ergänzung
- Unterscheide Ausschreibung, Berichtigung, Aufhebung, Zuschlag und Auftragsaenderung.

### 12. Bundesanzeiger - Amtlicher Teil

- Suche: `https://www.bundesanzeiger.de/pub/de/suche-amtlicher-teil`
- Inhalt: Bekanntmachungen, Ausschreibungen, Hinweise und bestimmte Rechtsverordnungen
- Einzelveroeffentlichungen meist HTML plus PDF
- Kein aggressives Scraping. Vor Produktionsbetrieb technische und rechtliche Freigabe prüfen.

### 13. BMF-Daten und Subventionsbericht

- Daten/Berichte: `https://www.bundesfinanzministerium.de/Web/DE/Themen/Oeffentliche_Finanzen/Daten-und-Berichte/daten-und-berichte.html`
- Subventionsberichte: periodisch, nicht Echtzeit
- Nutzen: Einordnung von Finanzhilfen und Steuerverguenstigungen

## Prioritaet C - Beteiligung und Kontrolle

### 14. Lobbyregister

- Info/API: `https://www.lobbyregister.bundestag.de/informationen-und-hilfe/open-data-1049716`
- API V2, YAML/Swagger, API-Key erforderlich
- Umfassender lesender Zugriff auf oeffentliche Registerinhalte
- Änderungen als eigene Ereignisse speichern, alte Versionen behalten

### 15. Petitionen

- Portal: `https://epetitionen.bundestag.de/`
- Mitzeichnungsfrist: `https://epetitionen.bundestag.de/epet/petuebersicht/mz.nc.html`
- Keine offizielle stabile API gefunden. HTML nur mit konservativem Polling und Parser-Fixtures.
- Nicht alle eingereichten Petitionen werden veröffentlicht.

### 16. Bundesrechnungshof

- Veröffentlichungen: `https://www.bundesrechnungshof.de/DE/2_veroeffentlichungen/veroeffentlichungen_node.html`
- Inhalt: Bemerkungen, Sonderberichte, Beratungsberichte und Pruefmitteilungen, soweit veröffentlichbar
- Kategorie `Kontrolle`, nicht als Regierungsposition darstellen

### 17. Bundeswahlleiterin

- Wahltermine: `https://www.bundeswahlleiterin.de/service/wahltermine.html`
- Open Data: über Startseite/Wahlbereiche
- Hinweis: genaue Termine erst nach offizieller Bekanntgabe; Landes- und Kommunalangaben teils ohne Gewaehr

### 18. GovData

- Portal: `https://www.govdata.de/`
- CKAN API: `https://www.govdata.de/ckan/api`
- Metadatenkatalog und SPARQL verfügbar
- GovData ist ein Katalog, nicht zwingend die Primaerquelle. Immer zur herausgebenden Stelle zurueckverlinken.

## Ministerien und nachgeordnete Behörden

Die aktuelle Liste der Ressorts aus der offiziellen Ministeriumsuebersicht laden und als `organizations` versionieren:

`https://www.bundesregierung.de/breg-de/bundesregierung/bundesministerien`

Vorgehen:

1. Ressortliste und offizielle Domains entdecken.
2. Pro Domain RSS/Atom, Sitemap und Pressebereich prüfen.
3. Einen separaten Source Adapter je CMS-Familie bauen, nicht einen fragilen Universalscraper.
4. Nachgeordnete Behörden erst nach den Ressorts hinzufuegen.

## Quellenqualitaetsstufen

- **A:** amtliche API oder signierter/amtlicher Datenfeed
- **B:** offizieller RSS/Atom-Feed
- **C:** offizielle strukturierte HTML-Seite
- **D:** offizielles PDF/Office-Dokument
- **E:** sekundaere Quelle, nur zur Entdeckung; nie alleinige Tatsachengrundlage
