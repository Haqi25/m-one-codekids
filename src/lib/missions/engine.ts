// Pure, deterministic mission engine: runs a block program against a board.
// Kept free of React so it can be unit-tested (PRD 5.5).

import type { Block, BlockType, Dir, GridBoard, Mission, Pos, SortBoard } from "./types";

export const DIR_DELTA: Record<Dir, Pos> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export const DIR_LABEL: Record<Dir, string> = {
  up: "Atas",
  down: "Bawah",
  left: "Kiri",
  right: "Kanan",
};

export const DIR_ARROW: Record<Dir, string> = {
  up: "⬆️",
  down: "⬇️",
  left: "⬅️",
  right: "➡️",
};

const MAX_STEPS = 300;

/* ------------------------------------------------------------------ */
/* Program helpers                                                     */
/* ------------------------------------------------------------------ */

export function countBlocks(blocks: Block[]): number {
  let n = 0;
  for (const b of blocks) {
    n += 1;
    if (b.type === "repeat") n += countBlocks(b.body);
    if (b.type === "if") n += countBlocks(b.then) + countBlocks(b.else);
  }
  return n;
}

export function usedTypes(blocks: Block[], acc = new Set<BlockType>()): Set<BlockType> {
  for (const b of blocks) {
    acc.add(b.type);
    if (b.type === "repeat") usedTypes(b.body, acc);
    if (b.type === "if") {
      usedTypes(b.then, acc);
      usedTypes(b.else, acc);
    }
  }
  return acc;
}

/** Human-readable program text, used as context for Bibi AI (FR-AI-02). */
export function describeProgram(blocks: Block[], mission?: Mission, indent = ""): string {
  if (blocks.length === 0) return `${indent}(kosong)`;
  const condLabel = (id: string) =>
    mission?.board.kind === "sort"
      ? mission.board.conditions.find((c) => c.id === id)?.label ?? id
      : id;
  const boxLabel = (id: string) =>
    mission?.board.kind === "sort" ? mission.board.boxes.find((b) => b.id === id)?.label ?? id : id;
  return blocks
    .map((b, i) => {
      const n = `${indent}${i + 1}.`;
      switch (b.type) {
        case "move":
          return `${n} gerak ${DIR_LABEL[b.dir].toLowerCase()}`;
        case "put":
          return `${n} masukkan ke ${boxLabel(b.box)}`;
        case "repeat":
          return `${n} ulangi ${b.times}x:\n${describeProgram(b.body, mission, indent + "   ")}`;
        case "if":
          return `${n} jika ${condLabel(b.cond)} maka:\n${describeProgram(b.then, mission, indent + "   ")}\n${indent}   jika tidak:\n${describeProgram(b.else, mission, indent + "   ")}`;
      }
    })
    .join("\n");
}

/* ------------------------------------------------------------------ */
/* Results                                                             */
/* ------------------------------------------------------------------ */

export type FailReason =
  | "empty"
  | "bump"
  | "wrong-order"
  | "missing-items"
  | "not-at-goal"
  | "too-many-blocks"
  | "must-use"
  | "no-box"
  | "wrong-box"
  | "too-long";

export interface GridFrame {
  pos: Pos;
  collected: number[];
  counter: number;
  event?: "move" | "collect" | "bump" | "wrong-order" | "goal";
  blockId?: string;
}

export interface SortFrame {
  itemIndex: number;
  box: string | null;
  correct: boolean;
  /** Blocks visited while deciding this item (for highlighting). */
  trail: string[];
}

export interface RunResult {
  success: boolean;
  reason?: FailReason;
  /** Extra info for feedback (e.g. bumped wall label, wrong item). */
  detail?: string;
  gridFrames?: GridFrame[];
  sortFrames?: SortFrame[];
  blocksUsed: number;
}

/* ------------------------------------------------------------------ */
/* Grid engine                                                         */
/* ------------------------------------------------------------------ */

export function runGrid(board: GridBoard, program: Block[]): Omit<RunResult, "blocksUsed"> {
  let pos: Pos = { ...board.start };
  const collected: number[] = [];
  let counter = 0;
  const frames: GridFrame[] = [{ pos, collected: [], counter }];
  let steps = 0;
  let failure = null as { reason: FailReason; detail?: string } | null;

  const isWall = (p: Pos) => board.walls.some((w) => w.x === p.x && w.y === p.y);

  const exec = (blocks: Block[]): boolean => {
    for (const b of blocks) {
      if (failure) return false;
      if (++steps > MAX_STEPS) {
        failure = { reason: "too-long" };
        return false;
      }
      if (b.type === "move") {
        const d = DIR_DELTA[b.dir];
        const next = { x: pos.x + d.x, y: pos.y + d.y };
        const outside = next.x < 0 || next.y < 0 || next.x >= board.width || next.y >= board.height;
        if (outside || isWall(next)) {
          const wall = board.walls.find((w) => w.x === next.x && w.y === next.y);
          failure = { reason: "bump", detail: outside ? "pinggir papan" : wall?.emoji ?? "rintangan" };
          frames.push({ pos, collected: [...collected], counter, event: "bump", blockId: b.id });
          return false;
        }
        pos = next;
        let event: GridFrame["event"] = "move";
        const idx = board.items.findIndex((it) => it.x === pos.x && it.y === pos.y);
        if (idx >= 0 && !collected.includes(idx)) {
          const item = board.items[idx];
          if (item.order !== undefined) {
            const pendingEarlier = board.items.some(
              (other, j) =>
                other.order !== undefined && other.order < item.order! && !collected.includes(j),
            );
            if (pendingEarlier) {
              failure = { reason: "wrong-order", detail: item.label };
              frames.push({ pos, collected: [...collected], counter, event: "wrong-order", blockId: b.id });
              return false;
            }
          }
          collected.push(idx);
          counter += item.value ?? 1;
          event = "collect";
        } else if (pos.x === board.goal.x && pos.y === board.goal.y) {
          event = "goal";
        }
        frames.push({ pos, collected: [...collected], counter, event, blockId: b.id });
      } else if (b.type === "repeat") {
        for (let i = 0; i < b.times; i++) if (!exec(b.body)) return false;
      }
      // "if" and "put" are not meaningful on a grid board; ignored.
    }
    return true;
  };

  exec(program);

  if (failure) return { success: false, ...failure, gridFrames: frames };
  if (collected.length < board.items.length) {
    const missing = board.items.find((_, i) => !collected.includes(i));
    return { success: false, reason: "missing-items", detail: missing?.label, gridFrames: frames };
  }
  if (pos.x !== board.goal.x || pos.y !== board.goal.y) {
    return { success: false, reason: "not-at-goal", detail: board.goal.label, gridFrames: frames };
  }
  return { success: true, gridFrames: frames };
}

/* ------------------------------------------------------------------ */
/* Sort engine (conditionals)                                          */
/* ------------------------------------------------------------------ */

export function runSort(board: SortBoard, program: Block[]): Omit<RunResult, "blocksUsed"> {
  const frames: SortFrame[] = [];
  let tooLong = false;

  board.items.forEach((item, itemIndex) => {
    let box = null as string | null;
    let steps = 0;
    const trail: string[] = [];
    const exec = (blocks: Block[]): boolean => {
      for (const b of blocks) {
        if (box !== null) return false;
        if (++steps > MAX_STEPS) {
          tooLong = true;
          return false;
        }
        trail.push(b.id);
        if (b.type === "put") {
          box = b.box;
          return false;
        }
        if (b.type === "if") {
          const branch = item.tags.includes(b.cond) ? b.then : b.else;
          if (!exec(branch)) return false;
        }
        if (b.type === "repeat") {
          for (let i = 0; i < b.times; i++) if (!exec(b.body)) return false;
        }
      }
      return true;
    };
    exec(program);
    frames.push({ itemIndex, box, correct: box === item.answer, trail });
  });

  if (tooLong) return { success: false, reason: "too-long", sortFrames: frames };
  const firstBad = frames.find((f) => !f.correct);
  if (firstBad) {
    const item = board.items[firstBad.itemIndex];
    return {
      success: false,
      reason: firstBad.box === null ? "no-box" : "wrong-box",
      detail: item.label,
      sortFrames: frames,
    };
  }
  return { success: true, sortFrames: frames };
}

/* ------------------------------------------------------------------ */
/* Public entry point                                                  */
/* ------------------------------------------------------------------ */

export function runMission(mission: Mission, program: Block[]): RunResult {
  const blocksUsed = countBlocks(program);
  if (program.length === 0) return { success: false, reason: "empty", blocksUsed };

  const base = mission.board.kind === "grid" ? runGrid(mission.board, program) : runSort(mission.board, program);
  if (!base.success) return { ...base, blocksUsed };

  // Program works; check mission constraints (encourage loops / conditionals).
  if (mission.mustUse) {
    const used = usedTypes(program);
    const missing = mission.mustUse.find((t) => !used.has(t));
    if (missing) return { ...base, success: false, reason: "must-use", detail: missing, blocksUsed };
  }
  if (mission.maxBlocks !== undefined && blocksUsed > mission.maxBlocks) {
    return { ...base, success: false, reason: "too-many-blocks", detail: String(mission.maxBlocks), blocksUsed };
  }
  return { ...base, blocksUsed };
}

const BLOCK_NAME: Record<BlockType, string> = {
  move: "Gerak",
  repeat: "Ulangi",
  if: "Jika",
  put: "Masukkan",
};

/** Always-positive feedback text (NFR-UX-04: no punishing "GAGAL" screens). */
export function feedbackFor(result: RunResult): string {
  switch (result.reason) {
    case undefined:
      return "Hebat! Misi berhasil! 🎉";
    case "empty":
      return "Yuk, seret blok ke area program dulu, lalu tekan Jalankan! 🧩";
    case "bump":
      return `Ups, kamu menabrak ${result.detail}. Hampir! Coba cek arah blokmu ya. 🙂`;
    case "wrong-order":
      return `Eits, "${result.detail}" belum waktunya! Urutannya perlu dicek lagi. 🔢`;
    case "missing-items":
      return `Sedikit lagi! Masih ada "${result.detail}" yang belum diambil. ✨`;
    case "not-at-goal":
      return `Bagus, tinggal sedikit lagi menuju ${result.detail}! 🏁`;
    case "too-many-blocks":
      return `Jalannya sudah benar! 👏 Sekarang coba pakai blok Ulangi supaya cukup ${result.detail} blok saja.`;
    case "must-use":
      return `Keren, hampir! Misi ini perlu memakai blok ${BLOCK_NAME[result.detail as BlockType] ?? result.detail}. 💡`;
    case "no-box":
      return `"${result.detail}" belum masuk kotak mana pun. Pastikan setiap jalur punya blok Masukkan. 📦`;
    case "wrong-box":
      return `"${result.detail}" masuk kotak yang kurang tepat. Coba periksa syarat JIKA-nya! 🤔`;
    case "too-long":
      return "Programnya terlalu panjang sampai karaktermu kelelahan. Coba buat lebih sederhana! 😅";
  }
}
