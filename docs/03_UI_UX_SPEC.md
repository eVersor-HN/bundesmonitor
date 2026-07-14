# UI- und UX-Spezifikation

## Gestaltungsrichtung

Modern, ruhig, präzise und neutral. Keine Parteifarben, keine patriotische Inszenierung und keine visuelle Nachahmung offizieller Bundeswebseiten.

### Design-Tokens

- Hintergrund hell: `#F6F7F9`
- Karten hell: `#FFFFFF`
- Text primaer: `#111827`
- Text sekundaer: `#5B6472`
- Rahmen: `#DDE2E8`
- Primaer: `#165D8F`
- Primaer dunkel: `#0B3957`
- Akzent für Geld: `#8A6A00`
- Erfolg: `#16794A`
- Warnung: `#A35B00`
- Kritisch: `#B42318`
- Info: `#2457A7`

Dark Mode analog mit mindestens WCAG-AA-Kontrast. Farben niemals als einzige Statusinformation verwenden.

### Typografie

Systemschrift oder `Inter`, mit tabellarischen Ziffern für Beträge. Basis 16 px. Zeilenlaenge im Lesetext maximal 75 Zeichen.

## Layout

Desktop ab 1200 px:

- 240 px Seitenleiste
- flexibler Hauptbereich, maximal 860 px für Feed
- 320 px rechte Kontextspalte für `Heute`, `Anstehend`, Quellenstatus

Tablet:

- einklappbare Seitenleiste
- keine dauerhafte rechte Spalte

Mobil:

- eine Spalte
- sticky Filterleiste
- Bottom Navigation
- Feedkarten ohne horizontales Scrollen

## Komponenten

### Live-Leiste

Oben im Feed:

- `Datenstand 08:12`
- gruener, gelber oder roter Gesamtstatus
- Anzahl neuer Einträge seit letztem Besuch
- Button `Neue Einträge anzeigen`, damit der Feed beim Lesen nicht springt

### Status-Chips

Beispiele:

- Angekündigt
- Eingebracht
- In Beratung
- Abstimmung anstehend
- Beschlossen
- Bundesrat befasst
- Verkündet
- In Kraft
- Mittel geplant
- Bewilligt
- Ausschreibung offen
- Zuschlag erteilt
- Korrigiert
- Abgesagt

Jeder Chip besitzt Icon, Text und maschinenlesbares `aria-label`.

### Geldanzeige

Immer in dieser Reihenfolge:

```text
250 Mio. EUR
Bewilligt | Laufzeit 2026-2029
Empfänger: ...
```

Nicht einfach `250 Mio. EUR investiert` schreiben, wenn nur ein Haushaltsansatz oder eine Verpflichtung vorliegt.

### Quellenblock

- Name der amtlichen Quelle
- Dokumentkennung
- Veroeffentlicht am
- Von Bundesmonitor entdeckt am
- Original oeffnen
- archivierte Version/Hash anzeigen

### Zeitleiste

- neuestes Ereignis oben auf Mobilgeraeten
- chronologisch links nach rechts auf breiten Detailseiten optional
- jeden Schritt mit Status, Datum, Institution und Dokument verknüpfen
- verworfene, korrigierte und ersetzte Schritte sichtbar lassen

## Microcopy

Gut:

- `Im Bundeshaushalt 2027 veranschlagt`
- `Vom Bundestag beschlossen; Bundesrat noch ausstehend`
- `Laut Förderkatalog bewilligt, dort jedoch erst mit Verzögerung veröffentlicht`
- `Keine Auszahlung in der Quelle ausgewiesen`

Schlecht:

- `Die Regierung verschenkt 50 Millionen`
- `Steuergeld fließt an ...`, wenn nur eine Planung vorliegt
- `Endgueltig beschlossen`, bevor Verkündung oder erforderliche Zustimmung erfolgt ist

## Barrierefreiheit

- vollstaendige Tastaturbedienung
- Skip Links
- sichtbare Fokusrahmen
- keine Hover-only-Informationen
- Diagramme besitzen Tabellenalternative
- `prefers-reduced-motion` beachten
- klare Sprache; juristische Originalbegriffe per Glossar erklären
- Datumswerte maschinenlesbar als `<time datetime>`
- Screenreader-Texte für Icons und Status

## Visuelles Zielbild

Siehe `prototype/index.html`. Es ist ein Designreferenz-Prototyp, kein Produktionscode.
