import { PageHeader } from "@/app/components/PageHeader";
import { IconChevron, IconExternal } from "@/app/components/icons";
import { T } from "@/app/components/LangProvider";

// Mitmachen: amtliche Wege, wie Buergerinnen und Buerger selbst aktiv werden.
// Nur offizielle Anlaufstellen des Bundes / der Verfassungsorgane – keine
// privaten Plattformen. Kategorien sind aufklappbar (Akkordeon).

interface Weg {
  titel: string;
  desc: string;
  url: string;
  host: string;
}

const GRUPPEN: { titel: string; eintraege: Weg[] }[] = [
  {
    titel: "Mitbestimmen & beteiligen",
    eintraege: [
      {
        titel: "Petition beim Bundestag einreichen oder mitzeichnen",
        desc: "Jede Person kann sich mit Bitten und Beschwerden an den Bundestag wenden (Art. 17 Grundgesetz). Online einreichen, öffentliche Petitionen mitzeichnen – ab 50.000 Unterschriften wird öffentlich beraten.",
        url: "https://epetitionen.bundestag.de/",
        host: "epetitionen.bundestag.de",
      },
      {
        titel: "Abgeordnete finden und kontaktieren",
        desc: "Wer vertritt deinen Wahlkreis? Alle Abgeordneten mit Kontaktdaten, Ausschüssen und Biografie.",
        url: "https://www.bundestag.de/abgeordnete",
        host: "bundestag.de",
      },
      {
        titel: "Bürgerräte des Bundestages",
        desc: "Per Los ausgeloste Bürgerinnen und Bürger beraten den Bundestag zu einem Thema und geben Empfehlungen. Infos, Themen und Bewerbung.",
        url: "https://www.bundestag.de/buergerraete",
        host: "bundestag.de",
      },
      {
        titel: "Öffentliche Anhörungen & Ausschüsse verfolgen",
        desc: "In den Ausschüssen wird die eigentliche Sacharbeit geleistet. Öffentliche Anhörungen mit Sachverständigen lassen sich live und in der Mediathek verfolgen.",
        url: "https://www.bundestag.de/ausschuesse",
        host: "bundestag.de",
      },
    ],
  },
  {
    titel: "Wählen & Wahlen",
    eintraege: [
      {
        titel: "Wahltermine, Wahlrecht & Briefwahl",
        desc: "Amtliche Wahltermine, wer wählen darf, Briefwahl beantragen – von der Bundeswahlleiterin.",
        url: "https://www.bundeswahlleiterin.de/",
        host: "bundeswahlleiterin.de",
      },
      {
        titel: "Wahlhelfer:in werden",
        desc: "Wahlen brauchen Hunderttausende Freiwillige im Wahllokal. Melden kannst du dich bei deiner Stadt/Gemeinde; die Grundlagen erklärt die Bundeswahlleiterin.",
        url: "https://www.bundeswahlleiterin.de/",
        host: "bundeswahlleiterin.de",
      },
    ],
  },
  {
    titel: "Ehrenamt & Freiwilligendienste",
    eintraege: [
      {
        titel: "Bundesfreiwilligendienst (BFD)",
        desc: "Sich freiwillig für das Gemeinwohl engagieren – in sozialen, ökologischen, kulturellen Einrichtungen. Für alle Altersgruppen.",
        url: "https://www.bundesfreiwilligendienst.de/",
        host: "bundesfreiwilligendienst.de",
      },
      {
        titel: "Freiwilliges Soziales / Ökologisches Jahr",
        desc: "FSJ und FÖJ: ein Jahr Engagement mit Bildungsanteil, meist für junge Menschen. Überblick beim zuständigen Bundesministerium (BMFSFJ).",
        url: "https://www.bmfsfj.de/",
        host: "bmfsfj.de",
      },
      {
        titel: "Technisches Hilfswerk (THW) – ehrenamtlich helfen",
        desc: "Die Bundesanstalt THW hilft bei Katastrophen im In- und Ausland und lebt vom Ehrenamt. Mitmachen und Ortsverband finden.",
        url: "https://www.thw.de/",
        host: "thw.de",
      },
      {
        titel: "Engagement & Ehrenamt finden",
        desc: "Die Deutsche Stiftung für Engagement und Ehrenamt unterstützt freiwilliges Engagement und bündelt Angebote zum Mitmachen.",
        url: "https://www.d-s-e-e.de/",
        host: "d-s-e-e.de",
      },
    ],
  },
  {
    titel: "Informieren & kontrollieren",
    eintraege: [
      {
        titel: "Bundestag live & Mediathek",
        desc: "Debatten und Anhörungen live verfolgen oder jederzeit nachschauen – die parlamentarische Arbeit ist öffentlich.",
        url: "https://www.bundestag.de/mediathek",
        host: "bundestag.de",
      },
      {
        titel: "Bundeshaushalt einsehen",
        desc: "Wofür der Bund Geld ausgibt – alle Einzelpläne, Kapitel und Titel im amtlichen Haushaltsportal.",
        url: "https://www.bundeshaushalt.de/",
        host: "bundeshaushalt.de",
      },
      {
        titel: "Lobbyregister einsehen",
        desc: "Wer versucht, auf Gesetzgebung und Regierung Einfluss zu nehmen? Das offizielle Register der Interessenvertretungen.",
        url: "https://www.lobbyregister.bundestag.de/",
        host: "lobbyregister.bundestag.de",
      },
      {
        titel: "Politische Bildung (bpb)",
        desc: "Neutrale Hintergründe, Dossiers und Erklärungen der Bundeszentrale für politische Bildung.",
        url: "https://www.bpb.de/",
        host: "bpb.de",
      },
      {
        titel: "Bundestag besuchen",
        desc: "Plenarsitzungen live erleben, Kuppel besuchen, Führungen – kostenlos nach Anmeldung.",
        url: "https://www.bundestag.de/besuche",
        host: "bundestag.de",
      },
    ],
  },
  {
    titel: "Fragen & Auskunft",
    eintraege: [
      {
        titel: "Amtliche Auskunft nach dem Informationsfreiheitsgesetz",
        desc: "Jede Person kann bei Bundesbehörden Zugang zu amtlichen Informationen beantragen (IFG). Der BfDI erklärt das Verfahren und hilft bei Streit.",
        url: "https://www.bfdi.bund.de/DE/Buerger/Inhalte/Informationsfreiheit/IFG.html",
        host: "bfdi.bund.de",
      },
      {
        titel: "Direkt an die Bundesregierung schreiben",
        desc: "Fragen und Anliegen direkt an die Bundesregierung richten.",
        url: "https://www.bundesregierung.de/breg-de/service/kontakt",
        host: "bundesregierung.de",
      },
      {
        titel: "Statistiken selbst recherchieren",
        desc: "Zahlen zu Bevölkerung, Wirtschaft, Preisen und mehr – direkt beim Statistischen Bundesamt (Destatis / GENESIS-Datenbank).",
        url: "https://www.destatis.de/",
        host: "destatis.de",
      },
    ],
  },
  {
    titel: "Beschweren & melden",
    eintraege: [
      {
        titel: "Beschwerde über Bundespolizei",
        desc: "Der unabhängige Polizeibeauftragte des Bundes nimmt Beschwerden über Bundespolizei, BKA und die Polizei des Bundestages entgegen – auch anonym.",
        url: "https://www.polizeibeauftragter.bund.de/",
        host: "polizeibeauftragter.bund.de",
      },
      {
        titel: "Datenschutz-Beschwerde",
        desc: "Bei Datenschutzverstößen durch Bundesbehörden, Post- oder Telekomdienste: Beschwerde bei der Bundesbeauftragten für den Datenschutz (BfDI).",
        url: "https://www.bfdi.bund.de/",
        host: "bfdi.bund.de",
      },
      {
        titel: "Für Soldatinnen und Soldaten: Wehrbeauftragte",
        desc: "Eingaben an die Wehrbeauftragte des Bundestages – ohne Dienstweg, für alle Angehörigen der Bundeswehr.",
        url: "https://www.bundestag.de/parlament/wehrbeauftragte",
        host: "bundestag.de",
      },
      {
        titel: "Hinweise geben (externe Meldestelle des Bundes)",
        desc: "Verstöße gegen bestimmte Vorschriften vertraulich melden – über die externe Meldestelle des Bundes beim Bundesamt für Justiz (Hinweisgeberschutz).",
        url: "https://www.bundesjustizamt.de/",
        host: "bundesjustizamt.de",
      },
    ],
  },
];

export default function MitmachenPage() {
  return (
    <div className="flex flex-col gap-3">
      <PageHeader title={<T k="nav.mitmachen" />} sub={<T k="mitmachen.sub" />} />

      {GRUPPEN.map((g, i) => (
        <details key={g.titel} className="bm-acc bm-card overflow-hidden" open={i === 0}>
          <summary className="flex items-center justify-between gap-2 p-3.5">
            <span className="text-[0.92rem] font-semibold">{g.titel}</span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="text-[0.66rem]" style={{ color: "var(--bm-text-muted)" }}>
                {g.eintraege.length}
              </span>
              <IconChevron className="bm-chev" />
            </span>
          </summary>
          <ul className="flex flex-col gap-2 px-3.5 pb-3.5">
            {g.eintraege.map((w) => (
              <li key={w.url}>
                <a
                  href={w.url}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="flex flex-col gap-1 rounded-lg border p-3 transition-colors"
                  style={{ borderColor: "var(--bm-border)", background: "var(--bm-surface-2)" }}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-[0.82rem] font-semibold leading-snug">{w.titel}</span>
                    <IconExternal className="shrink-0 self-center" />
                  </span>
                  <span
                    className="text-[0.72rem] leading-relaxed"
                    style={{ color: "var(--bm-text-muted)" }}
                  >
                    {w.desc}
                  </span>
                  <span className="bm-mono text-[0.64rem]" style={{ color: "var(--bm-accent)" }}>
                    {w.host}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
