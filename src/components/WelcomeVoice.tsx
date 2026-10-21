"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { SPEECH_LANG, type Locale } from "@/lib/i18n/types";

const SESSION_KEY = "bandhanmil_welcome_spoken";

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}

/** Marathi TTS is rare on Windows; fall back to Hindi (Devanagari) then English. */
function pickVoice(
  locale: Locale,
  voices: SpeechSynthesisVoice[],
): { voice: SpeechSynthesisVoice | null; lang: string } {
  const wanted = SPEECH_LANG[locale].toLowerCase();
  const prefix = wanted.slice(0, 2);

  const byLang = (pred: (lang: string) => boolean) =>
    voices.find((v) => pred(v.lang.toLowerCase())) ?? null;

  if (locale === "mr") {
    const mr =
      byLang((l) => l === "mr-in" || l.startsWith("mr")) ??
      byLang((l) => l.includes("marathi"));
    if (mr) return { voice: mr, lang: mr.lang || "mr-IN" };

    // Hindi voices can speak Marathi Devanagari text; mr-IN alone often stays silent
    const hi =
      byLang((l) => l === "hi-in" || l.startsWith("hi")) ??
      byLang((l) => l.includes("hindi"));
    if (hi) return { voice: hi, lang: hi.lang || "hi-IN" };

    const enIn = byLang((l) => l === "en-in" || l.startsWith("en"));
    return { voice: enIn, lang: enIn?.lang || "hi-IN" };
  }

  const exact =
    byLang((l) => l === wanted) ??
    byLang((l) => l.startsWith(prefix)) ??
    null;

  return {
    voice: exact,
    lang: exact?.lang || SPEECH_LANG[locale],
  };
}

function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  const existing = loadVoices();
  if (existing.length > 0) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const done = () => {
      window.speechSynthesis.onvoiceschanged = null;
      resolve(loadVoices());
    };
    window.speechSynthesis.onvoiceschanged = done;
    window.setTimeout(done, 700);
  });
}

export function WelcomeVoice() {
  const { locale, t } = useLocale();
  const [needsTap, setNeedsTap] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const lastSpokenLocale = useRef<string | null>(null);

  const speak = useCallback(async () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setNeedsTap(false);
      return;
    }

    const text = t("voice.welcome");
    const voices = await waitForVoices();
    const { voice, lang } = pickVoice(locale, voices);

    window.speechSynthesis.cancel();

    // Chrome sometimes needs a kick after cancel
    try {
      window.speechSynthesis.resume();
    } catch {
      // ignore
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = locale === "mr" ? 0.9 : 0.95;
    if (voice) utter.voice = voice;

    if (locale === "mr" && voice && !voice.lang.toLowerCase().startsWith("mr")) {
      setStatusNote(
        voice.lang.toLowerCase().startsWith("hi")
          ? "मराठी मजकूर हिंदी आवाजात वाचला जातो (डिव्हाइसवर मराठी आवाज नाही)"
          : null,
      );
    } else {
      setStatusNote(null);
    }

    utter.onstart = () => {
      setPlaying(true);
      setNeedsTap(false);
      lastSpokenLocale.current = locale;
      try {
        sessionStorage.setItem(SESSION_KEY, locale);
      } catch {
        // ignore
      }
    };
    utter.onend = () => setPlaying(false);
    utter.onerror = () => {
      setPlaying(false);
      setNeedsTap(true);
    };

    window.speechSynthesis.speak(utter);

    // If still not speaking (autoplay / silent mr-IN), show tap
    window.setTimeout(() => {
      if (!window.speechSynthesis.speaking && lastSpokenLocale.current !== locale) {
        setNeedsTap(true);
      }
    }, 600);
  }, [locale, t]);

  // Auto-play / re-play when locale changes
  useEffect(() => {
    let cancelled = false;

    try {
      const spoken = sessionStorage.getItem(SESSION_KEY);
      if (spoken === locale) {
        setNeedsTap(false);
        return;
      }
    } catch {
      // ignore
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (cancelled) return;
      void speak().then(() => {
        if (cancelled) return;
        window.setTimeout(() => {
          if (
            !cancelled &&
            !window.speechSynthesis.speaking &&
            lastSpokenLocale.current !== locale
          ) {
            setNeedsTap(true);
          }
        }, 900);
      });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.speechSynthesis.cancel();
    };
  }, [locale, speak]);

  if (!needsTap && !playing && !statusNote) return null;

  return (
    <div className="welcome-voice-bar" role="status">
      {playing ? (
        <span>{t("voice.playing")}</span>
      ) : needsTap ? (
        <button type="button" className="welcome-voice-btn" onClick={() => void speak()}>
          {t("voice.tapToHear")}
        </button>
      ) : null}
      {statusNote && !playing ? (
        <span className="welcome-voice-note">{statusNote}</span>
      ) : null}
    </div>
  );
}
