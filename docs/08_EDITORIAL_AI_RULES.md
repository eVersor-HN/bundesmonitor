# Redaktionelle und KI-Regeln

## Ausgabeebenen

1. **Originaltitel** - unverändert
2. **Neutrale Kurzfassung** - maximal zwei Saetze
3. **Einordnung** - optional: Verfahrensstand, naechster Schritt, Geldstatus

## Zusammenfassungs-Prompt

```text
Fasse ausschließlich die beigefuegte amtliche Quelle zusammen. Schreibe neutrales, klares Deutsch. Erfinde keine Motive, Auswirkungen, Empfänger, Beträge oder Termine. Unterscheide Planung, Antrag, Beschluss, Bewilligung, Vergabe, Auszahlung, Verkündung und Inkrafttreten. Gib für jede Aussage die IDs der belegenden Quellensegmente aus. Wenn eine Information fehlt oder mehrdeutig ist, setze sie auf null und benenne die Unsicherheit. Keine politische Bewertung, kein Lob, keine Kritik, keine emotionalen Adjektive.
```

## Strukturierte KI-Antwort

```json
{
  "summary": "...",
  "status": "...",
  "next_step": "...",
  "money": [],
  "claims": [
    {"text": "...", "evidence_segment_ids": ["s12", "s13"]}
  ],
  "uncertainties": []
}
```

## Validierung

- Jeder Claim braucht mindestens ein Segment.
- Beträge müssen exakt im Quellsegment vorkommen oder aus strukturierten Quelldaten stammen.
- Datumswerte werden nicht aus relativen Formulierungen ohne Referenzdatum abgeleitet.
- Organisations- und Personennamen gegen normalisierte Entitaeten prüfen.
- Bei Widerspruch gewinnt die neuere amtliche Version, alte Version bleibt sichtbar.
- KI darf keine Vorgange automatisch mit niedriger Konfidenz zusammenfuehren.

## Sprachregeln

Verwende:

- `Die Bundesregierung kündigte an ...`
- `Der Entwurf sieht vor ...`
- `Der Bundestag beschloss ...`
- `Im Haushalt sind ... veranschlagt.`
- `Der Förderkatalog weist eine Bewilligung aus.`
- `Die Quelle nennt keine Auszahlung.`

Vermeide:

- `verschenkt`, `verpulvert`, `rettet`, `skandaloes`, `historisch`, `massiv`, sofern nicht Teil eines klar gekennzeichneten Zitats
- unbestimmtes `Deutschland zahlt`, wenn eine bestimmte Behörde oder Finanzierungsform bekannt ist
- `investiert`, wenn nur ein Planansatz vorliegt

## KI-Ausfall

Die App bleibt ohne KI voll funktionsfaehig. Bei Ausfall werden Originaltitel und strukturierte Metadaten angezeigt. Keine Blockade der Importpipeline.
