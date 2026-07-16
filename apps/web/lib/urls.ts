// Sichere externe Links: gescrapte/aus der API stammende URLs koennen ein
// gefaehrliches Schema tragen (z. B. `javascript:` oder `data:`), das beim
// Rendern als href zur Code-Ausfuehrung fuehren wuerde. safeExternalHref laesst
// ausschliesslich unbedenkliche Schemata durch und gibt sonst undefined zurueck
// (dann wird kein Link gerendert). Komponenten importieren die Funktion via
// `@/lib/urls`.

// Zugelassene Protokolle fuer sichtbare externe Links.
const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

// Gibt die URL nur zurueck, wenn sie parsebar ist und ihr Protokoll erlaubt ist;
// bei fehlenden, relativen oder fehlerhaften Eingaben undefined. new URL() wirft
// bei ungueltigen/relativen URLs - das wird bewusst als "nicht verlinkbar"
// behandelt (kein Raten, keine unsicheren Schemata durchreichen).
export function safeExternalHref(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return ALLOWED_PROTOCOLS.has(parsed.protocol) ? url : undefined;
  } catch {
    return undefined;
  }
}
