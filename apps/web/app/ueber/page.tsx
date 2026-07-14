import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Über Bundesmonitor",
  description:
    "Was Bundesmonitor ist, wie es unabhängig betrieben wird und wie man das " +
    "Projekt unterstützen kann.",
};

const PAYPAL_URL = "https://paypal.me/FAMarco";
const BITCOIN_ADDRESS = "bc1qv92c3eyeqvhgfnez7spfd7v2aytkhpshsl65yv";
const GITHUB_URL = "https://github.com/eVersor-HN";
const DEV_NAME = "Marco Aurelio Fattizzo";

export default function UeberPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h1 className="bm-h1">Über Bundesmonitor</h1>
        <p className="max-w-2xl" style={{ color: "var(--bm-text-muted)" }}>
          Bundesmonitor ist ein unabhängiges, nicht-kommerzielles Projekt. Es
          bereitet öffentlich zugängliche amtliche Quellen automatisiert auf und
          verlinkt für jede Aussage die Originalveröffentlichung. Es ist kein
          Angebot der Bundesregierung oder des Deutschen Bundestages und trifft
          keine politische Bewertung.
        </p>
      </section>

      <section
        aria-labelledby="dev-title"
        className="rounded-lg border p-5"
        style={{ borderColor: "var(--bm-border)", background: "var(--bm-surface)" }}
      >
        <h2 id="dev-title" className="mb-1 text-lg font-semibold">
          Über den Entwickler
        </h2>
        <p className="mb-4 text-sm" style={{ color: "var(--bm-text-muted)" }}>
          Bundesmonitor wird unabhängig und in Eigenregie entwickelt – von{" "}
          <strong style={{ color: "var(--bm-text)" }}>{DEV_NAME}</strong>. Ziel ist eine neutrale,
          quellengestützte und barrierefreie Sicht auf das Handeln des Bundes. Der Quellcode ist
          quelloffen (MIT-Lizenz).
        </p>
        <ul className="flex flex-col gap-3">
          <li className="flex flex-col gap-1">
            <span className="text-sm font-medium">GitHub</span>
            <a className="bm-link" href={GITHUB_URL} rel="noopener noreferrer" target="_blank">
              github.com/eVersor-HN
            </a>
          </li>
        </ul>
      </section>

      <section
        aria-labelledby="support-title"
        className="rounded-lg border p-5"
        style={{ borderColor: "var(--bm-border)", background: "var(--bm-surface)" }}
      >
        <h2 id="support-title" className="mb-1 text-lg font-semibold">
          Dieses Projekt unterstützen
        </h2>
        <p className="mb-4 text-sm" style={{ color: "var(--bm-text-muted)" }}>
          Bundesmonitor wird unabhängig entwickelt und betrieben. Freiwillige
          Beiträge helfen, Betrieb und Weiterentwicklung zu finanzieren. Eine
          Unterstützung hat keinen Einfluss auf die dargestellten Inhalte.
        </p>
        <ul className="flex flex-col gap-4">
          <li className="flex flex-col gap-1">
            <span className="text-sm font-medium">PayPal</span>
            <a
              className="underline"
              href={PAYPAL_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              paypal.me/FAMarco
            </a>
          </li>
          <li className="flex flex-col gap-1">
            <span className="text-sm font-medium">Bitcoin</span>
            <code
              className="select-all break-all rounded px-2 py-1 text-sm"
              style={{ background: "var(--bm-bg)", border: "1px solid var(--bm-border)" }}
            >
              {BITCOIN_ADDRESS}
            </code>
          </li>
        </ul>
      </section>

      <section aria-labelledby="impressum-title" className="flex flex-col gap-2">
        <h2 id="impressum-title" className="text-lg font-semibold">
          Impressum und Datenschutz
        </h2>
        <p className="text-sm" style={{ color: "var(--bm-text-muted)" }}>
          Platzhalter. Vor dem öffentlichen Start sind Anbieterkennzeichnung
          (§ 5 DDG), Datenschutzinformation, redaktionelle Verantwortlichkeit und
          Haftungshinweise rechtlich zu prüfen und hier zu ergänzen. Bis dahin
          werden hier keine erfundenen Angaben dargestellt.
        </p>
      </section>
    </div>
  );
}
