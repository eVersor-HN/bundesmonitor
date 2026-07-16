# ADR 0003: Parteifarben als neutrale Identifikation (mit Theme-Tokens)

- Status: akzeptiert
- Datum: 2026-07-16

## Kontext

In der Oberfläche werden Fraktionen/Parteien an mehreren Stellen (Akteure,
Sitzverteilung, Parteienübersicht) farblich gekennzeichnet. Die Farbwerte lagen
bisher **hartkodiert und dupliziert** in einzelnen Komponenten
(`AkteureSelector.tsx`, ggf. `SeatsBar`/`ParteienClient`) und waren **nicht
theme-abhängig**: mehrere Werte (z. B. CDU-Grau `#5b6572`, Linke-Magenta
`#be3075`) haben auf der dunklen Oberfläche `#121b2b` zu schwachen Kontrast.

Das steht im Spannungsverhältnis zu einer selbstgesetzten Notiz im Stylesheet
(„keine Partei-/Ministeriumsfarben") und wurde deshalb als tragweite
Entscheidung dokumentiert. CLAUDE.md **Regel 10** verbietet ausdrücklich das
Kopieren von **Logos** (Bundesadler, Ministerien, Parteien) und fordert eigene
neutrale Icons — sie verbietet **nicht** Farben. **Regel 5** verbietet politische
**Bewertung**, Sentiment-Ranking und Framing durch Adjektive.

## Entscheidung

1. **Parteifarben bleiben — als sachliche Identifikation, nicht als Wertung.**
   Eine Fraktion an ihrer etablierten Farbe wiederzuerkennen ist neutrale
   Zuordnung (wie ein Kürzel), kein Framing. Keine Farbe wird wertend eingesetzt
   (kein „gut/schlecht", keine Rangfolge, keine Adjektive). Damit vereinbar mit
   Regel 5; Regel 10 ist nicht berührt (es werden keine Logos kopiert).

2. **Zentralisierung in Theme-Tokens.** Alle Parteifarben liegen als
   Design-Tokens in `globals.css`
   (`--bm-party-spd|cdu|csu|gruene|fdp|afd|linke|fraktionslos`) mit **eigenen
   Werten für Hell und Dunkel**. Komponenten mappen nur noch den Partei-Schlüssel
   auf den Token — **eine** Quelle der Wahrheit, keine duplizierten Hex-Listen.

3. **Barrierefreiheit.** Die Dunkel-Varianten sind so gewählt, dass Text/Flächen
   gegenüber der dunklen Oberfläche mindestens ~3:1 erreichen. Farbe ist nie der
   **einzige** Informationsträger — der Parteiname/das Kürzel steht immer dabei
   (WCAG 1.4.1).

## Folgen

- **Positiv:** konsistente, wiedererkennbare, theme-sichere Kennzeichnung; keine
  verstreuten Hardcodes mehr; eine Stelle zum Pflegen.
- **Negativ / offen:** die Farben sind bewusst an reale Parteifarben angelehnt —
  wer strikte Farbneutralität will, kann die Tokens später auf eine
  Azur-Abstufung + Labels umstellen, ohne Komponenten anzufassen.

## Alternativen

- **Nur Akzent (Azur) + Labels, keine Parteifarben:** verworfen — schlechtere
  Wiedererkennbarkeit bei Sitzverteilung/Vergleichen, ohne Neutralitätsgewinn
  (Farbe hier ist Zuordnung, keine Wertung).
- **Status quo (hartkodiert je Komponente):** verworfen — Duplikate,
  Dark-Mode-Kontrastprobleme, kein einheitliches Pflegemodell.
