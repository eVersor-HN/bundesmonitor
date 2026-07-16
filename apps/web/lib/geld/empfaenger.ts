// „Wem gibt der Staat Geld?" – benannte Zuschüsse, Zuwendungen und Beiträge aus
// dem Bundeshaushalt, thematisch gruppiert. Es werden ausschließlich die amtlichen
// Zweckbestimmungen (Haushaltstitel) und ihre Soll-Beträge verwendet – keine
// erfundenen Zahlen (CLAUDE.md Regel 1/7). Quelle: bundeshaushalt.de (siehe
// HAUSHALT.meta). Manche Titel benennen eine einzelne Organisation
// („Zuschuss an die Deutsche Welle"), andere ein Programm – der Originaltitel
// wird deshalb unverändert angezeigt.

import { HAUSHALT, kurzLabel } from "./haushaltsdaten";

export interface EmpfaengerItem {
  label: string; // amtliche Zweckbestimmung, unverändert
  value: number; // Soll in Euro
  einzelplanNr: string;
  ministerium: string;
}

export interface EmpfaengerGruppe {
  key: string;
  title: string;
  total: number;
  items: EmpfaengerItem[];
}

// Wortgrenzen-Regex je Kategorie; die erste Übereinstimmung gewinnt. Bewusst
// eng gefasst, damit z. B. „Kooperation" nicht als „Oper" oder „Transport" nicht
// als „Sport" erkannt wird.
const CATS: { key: string; title: string; re: RegExp }[] = [
  {
    key: "kultur",
    title: "Kultur, Kunst & Medien",
    re: /\b(deutsche welle|deutschlandradio|kulturell|kultur(?:stiftung|gut|maßnahmen|einrichtung)?|museum|museen|theater|oper\b|opern|orchester|musik|film|bibliothek|kulturbesitz|festspiele|künste|kunstwerk|kunsthalle|denkmal|gedenkstätte|gedenkort|literatur|tanz|documenta|biennale|bauhaus|humboldt forum)/i,
  },
  {
    key: "zivil",
    title: "Zivilgesellschaft, Engagement & Ehrenamt",
    re: /\b(engagement|ehrenamt|freiwillig\w*|demokratie leben|mehrgeneration\w*|zivilgesellschaft\w*|bürgerschaftl\w*|selbsthilfe|gesellschaftlichen zusammenhalt|extremismus\w*)/i,
  },
  {
    key: "welt",
    title: "Entwicklung & Internationales",
    re: /\b(politischen stiftungen|politische stiftungen|politischer stiftungen|engagement global|entwicklungswichtig\w*|humanitär\w*|welternährung\w*|kirchen|privater deutscher träger|meinungsfreiheit)/i,
  },
  {
    key: "wissen",
    title: "Wissenschaft & Austausch",
    re: /\b(goethe-institut|akademischer austausch|humboldt-stiftung|deutschlandstipendium|stipendi\w*|hochschul\w*|studenten)/i,
  },
  {
    key: "glaube",
    title: "Religion, Minderheiten & Erinnerung",
    re: /\b(jüdisch\w*|sorbisch\w*|kirchentag|religionsgemeinschaft|vertriebene|kultur und geschichte im östlich)/i,
  },
  {
    key: "sozial",
    title: "Soziale Stiftungen & Fonds",
    re: /\b(conterganstiftung|mutter und kind|frühe hilfen|künstlersozialkasse)/i,
  },
  {
    key: "sport",
    title: "Sport",
    re: /\b(sport|sports|olympi\w*|doping|athlet\w*|trainingswissenschaft)/i,
  },
];

// Ausschluss von systemischen Transfers und internen Verwaltungsposten, die
// keine „Empfänger" im zivilgesellschaftlichen Sinn sind.
const EXCLUDE: RegExp[] = [
  /rentenversicherung/i,
  /krankenversicherung/i,
  /versorgung/i,
  /\bbeamt/i,
  /trennungsgeld/i,
  /dienstreise/i,
  /dienstbez/i,
  /bewirtschaftung/i,
  /\bmieten\b/i,
  /beschaffung/i,
  /it-verfahren/i,
  /\bpersonal/i,
  /waffen/i,
  /sanitätsgerät/i,
  /landtransport/i,
  /entgelte für wissenschaftler/i,
  /raumfahrt/i,
  /überregionale forschungsförderung/i,
  /innovativer transfer/i,
  /vorhaltecharter/i,
  /baukostenzuschüsse schiene/i,
];

const MIN_VALUE = 1_000_000; // ab 1 Mio €, um Rauschen zu vermeiden

let cache: EmpfaengerGruppe[] | null = null;

export function empfaengerGruppen(): EmpfaengerGruppe[] {
  if (cache) return cache;
  const groups = new Map<string, EmpfaengerGruppe>();
  for (const c of CATS) groups.set(c.key, { key: c.key, title: c.title, total: 0, items: [] });

  for (const e of HAUSHALT.einzelplaene) {
    for (const kap of e.kapitel) {
      for (const t of kap.titel) {
        if (t.value < MIN_VALUE) continue;
        if (EXCLUDE.some((r) => r.test(t.label))) continue;
        const cat = CATS.find((c) => c.re.test(t.label));
        if (!cat) continue;
        const g = groups.get(cat.key)!;
        g.items.push({
          label: t.label,
          value: t.value,
          einzelplanNr: e.nr,
          ministerium: kurzLabel(e.label),
        });
      }
    }
  }

  const result: EmpfaengerGruppe[] = [];
  for (const c of CATS) {
    const g = groups.get(c.key)!;
    if (g.items.length === 0) continue;
    g.items.sort((a, b) => b.value - a.value);
    g.total = g.items.reduce((s, x) => s + x.value, 0);
    result.push(g);
  }
  result.sort((a, b) => b.total - a.total);
  cache = result;
  return result;
}

export function empfaengerGesamt(): number {
  return empfaengerGruppen().reduce((s, g) => s + g.total, 0);
}
