"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  applyLang,
  getStoredLang,
  translate,
  type Lang,
  type TranslateVars,
} from "@/lib/i18n";

type LangCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: string, vars?: TranslateVars) => string;
};

const Ctx = createContext<LangCtx>({ lang: "de", setLang: () => {}, t: (k) => k });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("de");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLangState(getStoredLang());
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    applyLang(l);
  }

  return (
    <Ctx.Provider value={{ lang, setLang, t: (k, vars) => translate(lang, k, vars) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLang(): LangCtx {
  return useContext(Ctx);
}

export function T({ k, vars }: { k: string; vars?: TranslateVars }) {
  const { t } = useLang();
  return <>{t(k, vars)}</>;
}
