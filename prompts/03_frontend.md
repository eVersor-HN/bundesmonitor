# Prompt - Frontend

Baue die produktionsnahe Oberfläche für den DIP-MVP.

Seiten:

- `/` Feed
- `/anstehend`
- `/vorgang/[slug]`
- `/suche`
- `/quellenstatus`

Feed:

- stabile Cursor-Pagination
- neue Elemente nicht automatisch in den sichtbaren Bereich schieben
- Filterchips mit URL-Synchronisierung
- Skeletons, Fehlerzustand, leerer Zustand
- relative und absolute Zeit
- Status, Institution, Thema, Dokumentkennung
- Buttons Details, Original oeffnen, Merken

Detail:

- Kopfstatus
- kurze Zusammenfassung
- Zeitleiste
- Dokumente
- Quellen- und Datenqualitaetsblock
- verwandte Vorgange nur bei belastbarer Relation

Design:

- hell/dunkel
- keine Farbverlaeufe
- klare Karten, geringe visuelle Unruhe
- WCAG 2.2 AA
- 320 px bis Ultrawide
- keine Partei- oder Behoerdenlogos

Fuehre Playwright-Tests für Tastaturnavigation, Filterpersistenz, Feedpagination und Originalquellen-Link aus.
