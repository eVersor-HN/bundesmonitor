"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useLang } from "./LangProvider";

const THRESHOLD = 70;
const MIN_SPIN_MS = 800;
const DONE_MS = 1100;

type Phase = "idle" | "pull" | "refreshing" | "done";

function Spinner() {
  return (
    <svg
      className="bm-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="var(--bm-border)" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="var(--bm-accent)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Nach unten ziehen am Seitenanfang -> aktualisieren, mit klar lesbarem Feedback.
export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
}) {
  const { t } = useLang();
  const [phase, setPhase] = useState<Phase>("idle");
  const [pull, setPull] = useState(0);
  const startY = useRef<number | null>(null);
  const pullRef = useRef(0);
  const phaseRef = useRef<Phase>("idle");
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  function setPhaseBoth(p: Phase) {
    phaseRef.current = p;
    setPhase(p);
  }

  useEffect(() => {
    function onStart(e: TouchEvent) {
      startY.current =
        phaseRef.current === "idle" && window.scrollY <= 0 ? e.touches[0].clientY : null;
    }
    function onMove(e: TouchEvent) {
      if (startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0 && window.scrollY <= 0) {
        const p = Math.min(delta * 0.5, 110);
        pullRef.current = p;
        setPull(p);
        if (phaseRef.current !== "pull") setPhaseBoth("pull");
      } else {
        pullRef.current = 0;
        setPull(0);
        if (phaseRef.current === "pull") setPhaseBoth("idle");
      }
    }
    async function onEnd() {
      if (startY.current === null) return;
      startY.current = null;
      const pulled = pullRef.current;
      pullRef.current = 0;
      setPull(0);
      if (pulled > THRESHOLD) {
        setPhaseBoth("refreshing");
        const started = Date.now();
        try {
          await onRefreshRef.current();
        } finally {
          const wait = Math.max(0, MIN_SPIN_MS - (Date.now() - started));
          window.setTimeout(() => {
            setPhaseBoth("done");
            window.setTimeout(() => setPhaseBoth("idle"), DONE_MS);
          }, wait);
        }
      } else {
        setPhaseBoth("idle");
      }
    }
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

  const active = phase === "refreshing" || phase === "done";
  const height = active ? 46 : pull;

  return (
    <div>
      <div
        role="status"
        aria-live="polite"
        className="flex items-center justify-center gap-2 overflow-hidden text-sm font-medium"
        style={{
          height,
          color: "var(--bm-accent)",
          transition: phase === "pull" ? "none" : "height 0.25s ease",
        }}
      >
        {phase === "refreshing" && (
          <>
            <Spinner /> {t("ptr.laufend")}
          </>
        )}
        {phase === "done" && <span>{t("ptr.fertig")}</span>}
        {phase === "pull" &&
          (pull > THRESHOLD ? t("ptr.loslassen") : t("ptr.ziehen"))}
      </div>
      <div>{children}</div>
    </div>
  );
}
