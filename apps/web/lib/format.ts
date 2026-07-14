// Deutsche Datums-/Zahlenformate und Beschriftungen.

const DATE_FMT = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const DATETIME_FMT = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(iso: string | null): string {
  if (!iso) return "–";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "–" : DATE_FMT.format(d);
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "–";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "–" : DATETIME_FMT.format(d);
}

const MATTER_TYPE_LABELS: Record<string, string> = {
  gesetzgebung: "Gesetzgebung",
  antrag: "Antrag",
  anfrage: "Anfrage",
  bericht: "Bericht",
  wahlpruefung: "Wahlprüfung",
  sonstiges: "Sonstiges",
};

export function matterTypeLabel(type: string): string {
  return MATTER_TYPE_LABELS[type] ?? type;
}
