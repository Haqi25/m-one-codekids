"use client";

// Web Speech API text-to-speech helper for Bibi AI (FR-AI-06).
// Allows children with emerging literacy to hear Bibi's guidance out loud in a warm, cheerful female voice.

import { useState, useEffect } from "react";

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * React hook to safely check speech synthesis support without SSR hydration mismatch.
 */
export function useSpeechSupported(): boolean {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isSpeechSupported());
  }, []);

  return supported;
}

export function cleanTextForSpeech(text: string): string {
  return text
    // Remove markdown formatting
    .replace(/[*_#`~>]/g, "")
    // Remove URLs
    .replace(/https?:\/\/\S+/g, "")
    // Remove emojis so the speech engine doesn't read out emoji descriptions
    .replace(/[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    // Remove leftover symbols and collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Specifically finds a female voice, prioritizing Indonesian female voices like
 * "Microsoft Gadis Online (Natural)", "Google Bahasa Indonesia", "Damayanti", "Siti".
 */
export function getBibiFemaleVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return undefined;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return undefined;

  // Filter Indonesian voices
  const idVoices = voices.filter(
    (v) =>
      v.lang.toLowerCase().startsWith("id") ||
      v.lang.toLowerCase().includes("id-id") ||
      v.name.toLowerCase().includes("indonesia")
  );

  // Female keywords commonly found in browser voices
  const femaleKeywords = [
    "gadis",
    "female",
    "wanita",
    "perempuan",
    "damayanti",
    "siti",
    "indah",
    "putri",
    "ayu",
    "wulan",
    "lestari",
    "google", // Google Bahasa Indonesia is a gentle female voice
  ];

  // Male keywords to filter out
  const maleKeywords = ["ardi", "male", "pria", "laki", "david", "george", "guy"];

  if (idVoices.length > 0) {
    // 1. Look for explicit female Indonesian voice (e.g. "Microsoft Gadis", "Damayanti", "Google Bahasa Indonesia")
    const femaleIdVoice = idVoices.find((v) => {
      const name = v.name.toLowerCase();
      const isFemale = femaleKeywords.some((k) => name.includes(k));
      const isMale = maleKeywords.some((k) => name.includes(k));
      return isFemale && !isMale;
    });
    if (femaleIdVoice) return femaleIdVoice;

    // 2. Look for any Indonesian voice that is NOT marked as male
    const notMaleIdVoice = idVoices.find((v) => {
      const name = v.name.toLowerCase();
      return !maleKeywords.some((k) => name.includes(k));
    });
    if (notMaleIdVoice) return notMaleIdVoice;

    // 3. Fallback to first available Indonesian voice
    return idVoices[0];
  }

  // 4. If no Indonesian voice, try any available female voice
  const fallbackFemale = voices.find((v) => {
    const name = v.name.toLowerCase();
    return femaleKeywords.some((k) => name.includes(k)) && !maleKeywords.some((k) => name.includes(k));
  });

  return fallbackFemale;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore cancel errors
    }
  }
  activeUtterance = null;
}

export function speakBibiText(
  text: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: unknown) => void;
  }
) {
  if (!isSpeechSupported()) {
    callbacks?.onEnd?.();
    return;
  }

  stopSpeaking();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    callbacks?.onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleaned);
  activeUtterance = utterance;

  // Mascot persona: Warm, friendly, cheerful female character
  // Pitch 1.25 - 1.3 gives a bright, feminine, comforting tone for Bibi
  utterance.pitch = 1.3;
  utterance.rate = 0.95;

  const femaleVoice = getBibiFemaleVoice();
  if (femaleVoice) {
    utterance.voice = femaleVoice;
    utterance.lang = femaleVoice.lang;
  } else {
    utterance.lang = "id-ID";
  }

  utterance.onstart = () => {
    callbacks?.onStart?.();
  };

  utterance.onend = () => {
    if (activeUtterance === utterance) {
      activeUtterance = null;
    }
    callbacks?.onEnd?.();
  };

  utterance.onerror = (e) => {
    if (activeUtterance === utterance) {
      activeUtterance = null;
    }
    callbacks?.onError?.(e);
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    callbacks?.onError?.(err);
  }
}
