// Gebuendelter Snapshot der namentlichen Abstimmungen (amtliche XLSX-Daten von
// bundestag.de). Im serverlosen Betrieb kann der Client die XLSX-Dateien nicht
// live scrapen/parsen; deshalb wird ein out-of-band gepflegter Snapshot ins APK
// gebuendelt. Aktualisierung erfolgt ueber App-Updates.
//
// Quelle: https://www.bundestag.de/parlament/plenum/abstimmung/liste
// Stand wird in VOTES_SNAPSHOT_STAND gepflegt.

import type { RollCallVote } from "../types";

export const VOTES_SNAPSHOT_STAND = "2026-07-10";

// Wird in einem eigenen Arbeitsschritt mit den aktuellen amtlichen Daten
// befuellt. Leerer Snapshot => die App zeigt "keine Abstimmungen" statt falscher
// Zahlen (CLAUDE.md: bei Unsicherheit nichts erfinden).
export const VOTES_SNAPSHOT: RollCallVote[] = [];
