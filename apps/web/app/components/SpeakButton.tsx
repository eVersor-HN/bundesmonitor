"use client";

import { useEffect, useState } from "react";
import { IconSpeaker } from "./icons";

// Vorlesen per Sprachausgabe des Geraets (Web Speech API). Erneutes Tippen
// stoppt. Wird ausgeblendet, wenn das Geraet keine Sprachausgabe kann –
// Screenreader (TalkBack) funktionieren unabhaengig davon ueber die
// aria-Auszeichnung der Seiten.
export function SpeakButton({ text, label = "Vorlesen" }: { text: string; label?: string }) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported) return null;

  function toggle() {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = document.documentElement.getAttribute("lang") === "de" ? "de-DE" : document.documentElement.getAttribute("lang") ?? "de-DE";
    u.rate = 1;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.speak(u);
    setSpeaking(true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      aria-label={speaking ? "Vorlesen stoppen" : label}
      title={speaking ? "Vorlesen stoppen" : label}
      className="bm-btn"
      style={{
        padding: "0.2rem 0.5rem",
        fontSize: "0.68rem",
        color: speaking ? "var(--bm-accent)" : undefined,
        borderColor: speaking ? "var(--bm-accent)" : undefined,
      }}
    >
      <IconSpeaker size={13} />
      {speaking ? "Stopp" : ""}
    </button>
  );
}
