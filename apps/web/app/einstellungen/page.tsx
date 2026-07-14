"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { checkDipKey, fetchPublicDipKey } from "@/lib/dip";
import { LocalNotifications } from "@capacitor/local-notifications";
import {
  getCvd,
  getDipKey,
  getFontScale,
  getLand,
  getNotify,
  getRefreshMinutes,
  hasOwnDipKey,
  setCvd,
  setDipKey,
  setPublicDipKey,
  setFontScale,
  setLand,
  setNotify,
  setRefreshMinutes,
  type FontScale,
} from "@/lib/config";
import { IconMonitor, IconMoon, IconSun } from "@/app/components/icons";
import { useLang } from "@/app/components/LangProvider";
import { fetchTopics } from "@/lib/api";
import { LANGS } from "@/lib/i18n";
import { LAENDER } from "@/lib/laender";

type Theme = "system" | "light" | "dark";

function applyTheme(t: Theme) {
  const root = document.documentElement;
  if (t === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", t);
  window.localStorage.setItem("bm:theme", t);
}

const DIP_HELP_URL = "https://dip.bundestag.de/%C3%BCber-dip/hilfe/api";
const DIP_MAIL = "parlamentsdokumentation@bundestag.de";

const PAYPAL_URL = "https://paypal.me/FAMarco";
const BTC_ADDRESS = "bc1qv92c3eyeqvhgfnez7spfd7v2aytkhpshsl65yv";

// -------- Wiederverwendbare, ruhige Formular-Bausteine --------

function Group({ title, accent = false, children }: {
  title: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className="bm-card bm-group"
      style={accent ? { background: "color-mix(in srgb, var(--bm-accent) 5%, var(--bm-surface))" } : undefined}
    >
      <h2 className="bm-group__title bm-sect" style={accent ? { color: "var(--bm-accent)" } : undefined}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, hint, htmlFor, stack = false, children }: {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  htmlFor?: string;
  stack?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`bm-field${stack ? " bm-field--stack" : ""}`}>
      <div className="bm-field__text">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="bm-field__label">{label}</label>
        ) : (
          <span className="bm-field__label">{label}</span>
        )}
        {hint && <span className="bm-field__hint">{hint}</span>}
      </div>
      <div className="bm-field__control">{children}</div>
    </div>
  );
}

function Seg({ ariaLabel, options, current, onChange }: {
  ariaLabel: string;
  options: { value: string; label: string; icon?: React.ReactNode }[];
  current: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="bm-seg" role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={current === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Switch({ checked, onClick, label }: {
  checked: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onClick} className="bm-switch" />
  );
}

function Chevron() {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" style={{ color: "var(--bm-text-muted)", flex: "none" }}
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export default function SettingsPage() {
  const { lang, setLang, t } = useLang();
  const [dipKey, setDipKeyInput] = useState("");
  const [ownKey, setOwnKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [conn, setConn] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");
  const [refreshMin, setRefreshMin] = useState(5);
  const [notifyOn, setNotifyOn] = useState(false);
  const [myLand, setMyLand] = useState("");
  const [fontScale, setFontScaleState] = useState<FontScale>("normal");
  const [cvdOn, setCvdOn] = useState(false);
  const [btcCopied, setBtcCopied] = useState(false);

  async function copyBtc() {
    try {
      await navigator.clipboard.writeText(BTC_ADDRESS);
      setBtcCopied(true);
      setTimeout(() => setBtcCopied(false), 1600);
    } catch {
      /* Zwischenablage nicht verfuegbar */
    }
  }

  // SSR-sichere Hydration aus localStorage (erst nach dem Mount verfuegbar).
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    // Eigenen Schluessel anzeigen; der oeffentliche Default bleibt verborgen.
    setDipKeyInput(hasOwnDipKey() ? getDipKey() : "");
    setOwnKey(hasOwnDipKey());
    setTheme((window.localStorage.getItem("bm:theme") as Theme | null) ?? "system");
    setRefreshMin(getRefreshMinutes());
    setNotifyOn(getNotify());
    setMyLand(getLand()?.name ?? "");
    setFontScaleState(getFontScale());
    setCvdOn(getCvd());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function chooseFontScale(v: FontScale) {
    setFontScaleState(v);
    setFontScale(v);
  }

  function toggleCvd() {
    const next = !cvdOn;
    setCvdOn(next);
    setCvd(next);
  }

  // Aktualisierungs-Intervall gilt sofort (wie die uebrigen Optionen), damit es
  // keinen separaten Speichern-Schritt braucht.
  function chooseRefresh(value: number) {
    setRefreshMin(value);
    setRefreshMinutes(value);
  }

  async function chooseLand(name: string) {
    setMyLand(name);
    if (!name) {
      setLand(null);
      return;
    }
    // Topic-Key des Landes nachschlagen (falls Server erreichbar), damit die
    // Dashboard-Kachel direkt auf die gefilterte Region-Ansicht verlinkt.
    let topicKey: string | null = null;
    try {
      const topics = await fetchTopics("ort");
      topicKey = topics?.find((t) => t.label === name)?.key ?? null;
    } catch {
      topicKey = null;
    }
    setLand({ name, topicKey });
  }

  async function toggleNotify() {
    if (notifyOn) {
      setNotify(false);
      setNotifyOn(false);
      return;
    }
    try {
      const res = await LocalNotifications.requestPermissions();
      const granted = res.display === "granted";
      setNotify(granted);
      setNotifyOn(granted);
    } catch {
      // Browser ohne Plugin: lokal aktivieren.
      setNotify(true);
      setNotifyOn(true);
    }
  }

  function chooseTheme(t: Theme) {
    setTheme(t);
    applyTheme(t);
  }

  const themeOptions: { value: string; label: string; icon: React.ReactNode }[] = [
    { value: "system", label: t("opt.system"), icon: <IconMonitor size={16} /> },
    { value: "light", label: t("opt.hell"), icon: <IconSun size={16} /> },
    { value: "dark", label: t("opt.dunkel"), icon: <IconMoon size={16} /> },
  ];

  function save() {
    setDipKey(dipKey);
    setOwnKey(!!dipKey.trim());
    setRefreshMinutes(refreshMin);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // Eigenen Schluessel gegen die DIP-API pruefen. Bei Erfolg speichern; bei
  // Fehlschlag zuruecksetzen, damit die App mit dem oeffentlichen Schluessel
  // weiterlaeuft.
  async function validateKey() {
    setBusy(true);
    setConn("prüfe…");
    const trimmed = dipKey.trim();
    // Nur einen tatsaechlich eingetippten eigenen Schluessel speichern und
    // pruefen. Ist das Feld leer, den aktuell aktiven (oeffentlichen) Schluessel
    // pruefen, OHNE ihn zu ueberschreiben – sonst wuerde gegen einen leeren
    // Schluessel geprueft ("ungueltig", obwohl der oeffentliche gueltig ist).
    if (trimmed) setDipKey(trimmed);
    const r = await checkDipKey();
    if (r.ok) {
      setOwnKey(!!trimmed);
      setConn(`✓ ${r.message}`);
    } else {
      setConn(`✗ ${r.message}`);
    }
    setBusy(false);
  }

  // Eigenen Schluessel entfernen und den aktuellen oeffentlichen Schluessel live
  // von der DIP-Hilfeseite holen (kein Schluessel im APK eingebettet).
  async function loadPublicKey() {
    setBusy(true);
    setConn("lade öffentlichen Schlüssel…");
    setDipKey(""); // eigenen Schluessel entfernen
    setDipKeyInput("");
    setOwnKey(false);
    const key = await fetchPublicDipKey();
    if (key) {
      setPublicDipKey(key);
      setConn("✓ öffentlicher Schlüssel geladen");
    } else {
      setConn("✗ konnte nicht geladen werden (Netz/Seite)");
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="bm-h1">{t("ui.options")}</h1>
        <p className="bm-sub mt-0.5">{t("opt.lokal")}</p>
      </div>

      {/* -------- Für dich -------- */}
      <Group title="Für dich">
        <Field label={t("dash.land")} hint={t("opt.landSub")} htmlFor="myLand">
          <select
            id="myLand"
            value={myLand}
            onChange={(e) => void chooseLand(e.target.value)}
            className="bm-input bm-input--auto"
          >
            <option value="">{t("opt.landKeins")}</option>
            {LAENDER.map((l) => (
              <option key={l.abbr} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        </Field>
      </Group>

      {/* -------- Darstellung -------- */}
      <Group title="Darstellung">
        <Field label={t("opt.design")}>
          <Seg
            ariaLabel={t("opt.design")}
            current={theme}
            onChange={(v) => chooseTheme(v as Theme)}
            options={themeOptions}
          />
        </Field>
        <Field label={t("ui.language")} hint={t("opt.spracheHinweis")} htmlFor="lang">
          <select
            id="lang"
            value={lang}
            onChange={(e) => setLang(e.target.value as (typeof LANGS)[number]["code"])}
            className="bm-input bm-input--auto"
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code} lang={l.code} dir={l.rtl ? "rtl" : "ltr"}>
                {l.label}
              </option>
            ))}
          </select>
        </Field>
      </Group>

      {/* -------- Barrierefreiheit -------- */}
      <Group title={t("opt.a11y")}>
        <Field label={t("opt.textgroesse")}>
          <Seg
            ariaLabel={t("opt.textgroesse")}
            current={fontScale}
            onChange={(v) => chooseFontScale(v as FontScale)}
            options={[
              { value: "normal", label: t("opt.standard") },
              { value: "gross", label: t("opt.gross") },
              { value: "sehrgross", label: t("opt.sehrGross") },
            ]}
          />
        </Field>
        <Field label="Farbsehschwäche-Modus" hint={t("opt.cvdSub")}>
          <Switch checked={cvdOn} onClick={toggleCvd} label="Farbsehschwäche-Modus" />
        </Field>
        <p className="bm-field__hint" style={{ padding: "0.2rem 0 0.7rem" }}>
          {t("opt.vorlesenHinweis")}
        </p>
      </Group>

      {/* -------- Benachrichtigungen & Aktualisierung -------- */}
      <Group title="Benachrichtigungen & Aktualisierung">
        <Field label={t("opt.notify")} hint={t("opt.notifySub")}>
          <Switch checked={notifyOn} onClick={() => void toggleNotify()} label={t("opt.notify")} />
        </Field>
        <Field label={t("opt.refresh")} hint={t("opt.refreshSub")} htmlFor="refreshMin">
          <input
            id="refreshMin"
            type="number"
            inputMode="numeric"
            min={0}
            max={1440}
            value={refreshMin}
            onChange={(e) => chooseRefresh(Number.parseInt(e.target.value || "0", 10))}
            className="bm-input bm-mono"
            style={{ width: "4.5rem", textAlign: "center" }}
          />
          <span className="bm-field__hint">{t("opt.minuten")}</span>
        </Field>
      </Group>

      {/* -------- Datenzugang (DIP) -------- */}
      <Group title="Datenzugang (DIP)">
        <p className="bm-field__hint" style={{ padding: "0.2rem 0 0.1rem" }}>
          Bundesmonitor holt die Daten direkt aus der amtlichen DIP-Schnittstelle des
          Bundestages – ohne eigenen Server. Ohne eigenen Schlüssel wird der öffentliche
          Sammelschlüssel verwendet (geteiltes Kontingent).
        </p>
        <div className="bm-field bm-field--stack">
          <div className="bm-field__text">
            <label htmlFor="dipKey" className="bm-field__label">
              Eigener DIP-API-Schlüssel {ownKey ? "(aktiv)" : "(optional)"}
            </label>
            <span className="bm-field__hint">
              Mit eigenem Schlüssel bist du schneller und unabhängig vom geteilten
              Kontingent. Einen kostenlosen, personalisierten Schlüssel (bis zu 10 Jahre
              gültig) bekommst du formlos per E-Mail an{" "}
              <a className="bm-link" href={`mailto:${DIP_MAIL}`}>{DIP_MAIL}</a>{" "}
              – Details:{" "}
              <a className="bm-link" href={DIP_HELP_URL} rel="noopener noreferrer" target="_blank">
                DIP-API-Hilfe
              </a>.
            </span>
          </div>
          <div className="bm-field__control">
            <input
              id="dipKey"
              type="text"
              value={dipKey}
              onChange={(e) => setDipKeyInput(e.target.value)}
              className="bm-input bm-mono"
              placeholder="z. B. I9FKdCn.aBcDeF…"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => void validateKey()} disabled={busy} className="bm-btn">
                Schlüssel prüfen
              </button>
              <button type="button" onClick={() => void loadPublicKey()} disabled={busy} className="bm-btn">
                {ownKey ? "Öffentlichen Schlüssel nutzen" : "Öffentlichen Schlüssel neu laden"}
              </button>
              <button type="button" onClick={save} className="bm-btn bm-btn--primary">
                {t("opt.speichern")}
              </button>
            </div>
            {(conn || saved) && (
              <span className="max-w-full truncate text-xs" style={{ color: saved ? "var(--bm-status-healthy)" : "var(--bm-text-muted)" }}>
                {saved ? t("opt.gespeichert") : conn}
              </span>
            )}
          </div>
        </div>
      </Group>

      {/* -------- Projekt unterstützen -------- */}
      <Group title="Projekt unterstützen" accent>
        <p className="bm-field__hint" style={{ padding: "0.2rem 0 0.1rem" }}>
          Bundesmonitor ist kostenlos, werbefrei und bleibt unabhängig. Wenn dir das etwas
          wert ist, hältst du das Projekt mit einer kleinen Spende am Leben – danke. ♥
        </p>
        <Field label="PayPal" hint="Einmalig oder regelmäßig – paypal.me/FAMarco">
          <a href={PAYPAL_URL} rel="noopener noreferrer" target="_blank" className="bm-btn bm-btn--primary">
            PayPal öffnen
          </a>
        </Field>
        <Field
          label="Bitcoin"
          hint={<code className="bm-mono" style={{ wordBreak: "break-all" }}>{BTC_ADDRESS}</code>}
        >
          <button type="button" onClick={() => void copyBtc()} className="bm-btn">
            {btcCopied ? "✓ kopiert" : "Adresse kopieren"}
          </button>
        </Field>
      </Group>

      {/* -------- Info & Rechtliches -------- */}
      <Group title="Info & Rechtliches">
        <Link href="/status" className="bm-field bm-linkrow">
          <span className="bm-field__label">{t("opt.quellenstatus")}</span>
          <Chevron />
        </Link>
        <Link href="/ueber" className="bm-field bm-linkrow">
          <span className="bm-field__label">{t("opt.ueber")}</span>
          <Chevron />
        </Link>
        <Link href="/rechtliches" className="bm-field bm-linkrow">
          <span className="bm-field__label">{t("opt.rechtliches")}</span>
          <Chevron />
        </Link>
      </Group>
    </div>
  );
}
