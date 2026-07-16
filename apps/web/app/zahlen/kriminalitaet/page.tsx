import { KriminalitaetClient } from "./KriminalitaetClient";

// Kriminalitaet (PKS). Serverseitig statisch exportiert; die eigentliche Ansicht
// laedt clientseitig die jaehrlich aktualisierten Live-Zahlen (Fallback:
// eingebaute Werte). Siehe KriminalitaetClient und lib/liveStats.
export default function KriminalitaetPage() {
  return <KriminalitaetClient />;
}
