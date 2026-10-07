// Gamification rules: stars (FR-MISI-06), score/XP/rank (FR-MISI-07), badges (FR-MISI-08),
// level unlocking (FR-MISI-09) and concept mastery (FR-DASH-03). Pure functions only.

import { LEVELS, MISSIONS, missionsByLevel } from "@/content/missions";
import type { Concept } from "./types";

export const UNLOCK_RATIO = 0.7;

export interface StarInput {
  blocksUsed: number;
  optimalBlocks: number;
  failedAttempts: number;
  hintsUsed: number;
  maxHintLevel: number;
}

/**
 * 1–3 stars. Penalty points: inefficient solution (+1), failed attempts (+0.5 each after
 * the first, max +1), hints (+0.5 each, max +1.5, a level-3 hint adds +0.5).
 */
export function computeStars(i: StarInput): number {
  let penalty = 0;
  if (i.blocksUsed > i.optimalBlocks) penalty += 1;
  penalty += Math.min(1, Math.max(0, i.failedAttempts - 1) * 0.5);
  penalty += Math.min(1.5, i.hintsUsed * 0.5 + (i.maxHintLevel >= 3 ? 0.5 : 0));
  return Math.max(1, Math.min(3, 3 - Math.floor(penalty)));
}

export function computeScore(stars: number, hintsUsed: number, failedAttempts: number): number {
  return Math.max(50, 100 + stars * 50 - hintsUsed * 10 - Math.min(failedAttempts, 5) * 5);
}

export const RANKS = [
  { min: 0, name: "Penjelajah", emoji: "🧭" },
  { min: 800, name: "Petualang", emoji: "🗺️" },
  { min: 2000, name: "Jagoan Kode", emoji: "🦸" },
] as const;

export function rankFor(xp: number) {
  let current: (typeof RANKS)[number] = RANKS[0];
  for (const r of RANKS) if (xp >= r.min) current = r;
  const idx = RANKS.indexOf(current);
  const next = RANKS[idx + 1];
  return { ...current, next: next ?? null };
}

export interface ProgressLite {
  missionId: string;
  completed: boolean;
  stars: number;
  bestScore: number;
  attempts: number;
  hintsUsed: number;
}

export function starsInLevel(level: number, progress: ProgressLite[]): number {
  const ids = new Set(missionsByLevel(level).map((m) => m.id));
  return progress.filter((p) => ids.has(p.missionId)).reduce((s, p) => s + p.stars, 0);
}

export function maxStarsInLevel(level: number): number {
  return missionsByLevel(level).length * 3;
}

export function starsNeededToUnlock(level: number): number {
  if (level <= 1) return 0;
  return Math.ceil(maxStarsInLevel(level - 1) * UNLOCK_RATIO);
}

export function isLevelUnlocked(level: number, progress: ProgressLite[]): boolean {
  if (level <= 1) return true;
  return isLevelUnlocked(level - 1, progress) && starsInLevel(level - 1, progress) >= starsNeededToUnlock(level);
}

export type MissionState = "locked" | "open" | "done";

export function missionState(missionId: string, progress: ProgressLite[]): MissionState {
  const mission = MISSIONS.find((m) => m.id === missionId);
  if (!mission) return "locked";
  const p = progress.find((x) => x.missionId === missionId);
  if (p?.completed) return "done";
  if (!isLevelUnlocked(mission.level, progress)) return "locked";
  const list = missionsByLevel(mission.level);
  const idx = list.findIndex((m) => m.id === missionId);
  if (idx === 0) return "open";
  const prev = progress.find((x) => x.missionId === list[idx - 1].id);
  return prev?.completed ? "open" : "locked";
}

export function totals(progress: ProgressLite[]) {
  const stars = progress.reduce((s, p) => s + p.stars, 0);
  const score = progress.reduce((s, p) => s + p.bestScore, 0);
  const completed = progress.filter((p) => p.completed).length;
  const currentLevel = [...LEVELS].reverse().find((l) => isLevelUnlocked(l.level, progress))?.level ?? 1;
  return { stars, score, xp: score, completed, currentLevel, rank: rankFor(score) };
}

/* ------------------------------ Badges ------------------------------ */

export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const BADGES: BadgeDef[] = [
  { id: "first-mission", name: "Misi Pertama", emoji: "🚀", description: "Menyelesaikan misi pertama" },
  { id: "no-hint", name: "Tanpa Petunjuk", emoji: "🧠", description: "Dapat 3 bintang tanpa bantuan Bibi" },
  { id: "seq-master", name: "Master Urutan", emoji: "👣", description: "Menyelesaikan semua misi Level 1" },
  { id: "loop-master", name: "Master Looping", emoji: "🔁", description: "Menyelesaikan semua misi Level 2" },
  { id: "if-master", name: "Master Kondisi", emoji: "🔀", description: "Menyelesaikan semua misi Level 3" },
  { id: "star-collector", name: "Pengumpul Bintang", emoji: "🌟", description: "Mengumpulkan 30 bintang" },
  { id: "perfect", name: "Sempurna", emoji: "💯", description: "Semua misi dengan 3 bintang" },
];

export function badgeById(id: string) {
  return BADGES.find((b) => b.id === id);
}

/** Badges earned given updated progress and the latest attempt. */
export function evaluateBadges(
  progress: ProgressLite[],
  latest: { success: boolean; stars: number; hintsUsed: number },
): string[] {
  const earned: string[] = [];
  const doneIds = new Set(progress.filter((p) => p.completed).map((p) => p.missionId));
  const levelDone = (lvl: number) => missionsByLevel(lvl).every((m) => doneIds.has(m.id));
  if (doneIds.size >= 1) earned.push("first-mission");
  if (latest.success && latest.stars === 3 && latest.hintsUsed === 0) earned.push("no-hint");
  if (levelDone(1)) earned.push("seq-master");
  if (levelDone(2)) earned.push("loop-master");
  if (levelDone(3)) earned.push("if-master");
  if (progress.reduce((s, p) => s + p.stars, 0) >= 30) earned.push("star-collector");
  if (MISSIONS.every((m) => progress.find((p) => p.missionId === m.id)?.stars === 3)) earned.push("perfect");
  return earned;
}

/* -------------------------- Concept mastery -------------------------- */

export type Mastery = "Sudah Paham" | "Sedang Belajar" | "Perlu Bantuan" | "Belum Mulai";

export interface AttemptLite {
  missionId: string;
  success: boolean;
}

export function conceptMastery(
  concept: Concept,
  progress: ProgressLite[],
  attempts: AttemptLite[],
): { mastery: Mastery; completed: number; total: number; avgStars: number } {
  const level = LEVELS.find((l) => l.concept === concept)!.level;
  const missions = missionsByLevel(level);
  const ids = new Set(missions.map((m) => m.id));
  const prog = progress.filter((p) => ids.has(p.missionId));
  const done = prog.filter((p) => p.completed);
  const att = attempts.filter((a) => ids.has(a.missionId));
  const fails = att.filter((a) => !a.success).length;
  const avgStars = done.length ? done.reduce((s, p) => s + p.stars, 0) / done.length : 0;

  let mastery: Mastery;
  if (att.length === 0 && done.length === 0) mastery = "Belum Mulai";
  else if (done.length >= Math.ceil(missions.length * 0.8) && avgStars >= 2) mastery = "Sudah Paham";
  else if (fails >= 6 && fails > done.length * 3) mastery = "Perlu Bantuan";
  else mastery = "Sedang Belajar";

  return { mastery, completed: done.length, total: missions.length, avgStars };
}

