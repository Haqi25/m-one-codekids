// Shared, client-safe constants.

export const AVATARS = ["🐱", "🐶", "🦊", "🐼", "🐸", "🐰", "🦁", "🐵", "🐯", "🐧", "🦄", "🐢"] as const;

export const GRADES = [1, 2, 3, 4, 5, 6] as const;

/** Bibi rate limits (FR-AI-08). */
export const BIBI_LIMIT_PER_MISSION_PER_DAY = 10;
export const BIBI_LIMIT_PER_DAY = 40;

export const QUICK_QUESTIONS = [
  "Aku bingung mulai dari mana 🤔",
  "Jelaskan pakai contoh dong 🍎",
  "Kenapa programku belum berhasil? 🧩",
  "Apa maksud misi ini? 📜",
] as const;

