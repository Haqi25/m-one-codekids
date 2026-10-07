// Immutable operations on the nested block program (used by the drag-and-drop editor).
// A "container key" identifies a list of blocks: "root" | `${blockId}:body` | `${blockId}:then` | `${blockId}:else`.

import type { Block, PaletteItem } from "./types";

export type ContainerKey = string;
export const ROOT: ContainerKey = "root";
export const MAX_DEPTH = 3;

let counter = 0;
export function newId(): string {
  counter += 1;
  return `b${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function fromPalette(item: PaletteItem, defaultCond?: string): Block {
  switch (item.type) {
    case "move":
      return { id: newId(), type: "move", dir: item.dir };
    case "repeat":
      return { id: newId(), type: "repeat", times: item.times ?? 2, body: [] };
    case "if":
      return { id: newId(), type: "if", cond: item.cond ?? defaultCond ?? "", then: [], else: [] };
    case "put":
      return { id: newId(), type: "put", box: item.box };
  }
}

function childLists(b: Block): [string, Block[]][] {
  if (b.type === "repeat") return [["body", b.body]];
  if (b.type === "if")
    return [
      ["then", b.then],
      ["else", b.else],
    ];
  return [];
}

function withList(b: Block, slot: string, list: Block[]): Block {
  if (b.type === "repeat" && slot === "body") return { ...b, body: list };
  if (b.type === "if" && slot === "then") return { ...b, then: list };
  if (b.type === "if" && slot === "else") return { ...b, else: list };
  return b;
}

/** Apply fn to the list identified by key. */
function mapList(program: Block[], key: ContainerKey, fn: (list: Block[]) => Block[]): Block[] {
  if (key === ROOT) return fn(program);
  const [ownerId, slot] = key.split(":");
  const walk = (list: Block[]): Block[] =>
    list.map((b) => {
      if (b.id === ownerId) {
        const current = childLists(b).find(([s]) => s === slot)?.[1];
        return current ? withList(b, slot, fn(current)) : b;
      }
      let next = b;
      for (const [s, l] of childLists(b)) next = withList(next, s, walk(l));
      return next;
    });
  return walk(program);
}

export function findBlock(program: Block[], id: string): Block | undefined {
  for (const b of program) {
    if (b.id === id) return b;
    for (const [, l] of childLists(b)) {
      const f = findBlock(l, id);
      if (f) return f;
    }
  }
  return undefined;
}

/** Locate the container and index of a block. */
export function locate(program: Block[], id: string, key: ContainerKey = ROOT): { key: ContainerKey; index: number } | null {
  for (let i = 0; i < program.length; i++) {
    const b = program[i];
    if (b.id === id) return { key, index: i };
    for (const [slot, l] of childLists(b)) {
      const f = locate(l, id, `${b.id}:${slot}`);
      if (f) return f;
    }
  }
  return null;
}

/** Depth of a container (root = 0). */
export function containerDepth(program: Block[], key: ContainerKey): number {
  if (key === ROOT) return 0;
  const ownerId = key.split(":")[0];
  const loc = locate(program, ownerId);
  return loc ? containerDepth(program, loc.key) + 1 : 0;
}

function subtreeDepth(b: Block): number {
  const lists = childLists(b);
  if (!lists.length) return 0;
  return 1 + Math.max(0, ...lists.flatMap(([, l]) => l.map(subtreeDepth)));
}

/** True if `key` is a container inside block `id` (cannot drop a block into itself). */
export function isInsideBlock(program: Block[], id: string, key: ContainerKey): boolean {
  if (key === ROOT) return false;
  const ownerId = key.split(":")[0];
  if (ownerId === id) return true;
  const loc = locate(program, ownerId);
  return loc ? isInsideBlock(program, id, loc.key) : false;
}

export function canInsert(program: Block[], key: ContainerKey, block: Block): boolean {
  return containerDepth(program, key) + subtreeDepth(block) <= MAX_DEPTH;
}

export function insertAt(program: Block[], key: ContainerKey, index: number, block: Block): Block[] {
  return mapList(program, key, (list) => {
    const next = [...list];
    next.splice(Math.max(0, Math.min(index, next.length)), 0, block);
    return next;
  });
}

export function removeBlock(program: Block[], id: string): Block[] {
  const walk = (list: Block[]): Block[] =>
    list
      .filter((b) => b.id !== id)
      .map((b) => {
        let next = b;
        for (const [s, l] of childLists(b)) next = withList(next, s, walk(l));
        return next;
      });
  return walk(program);
}

export function updateBlock(program: Block[], id: string, patch: Partial<Block>): Block[] {
  const walk = (list: Block[]): Block[] =>
    list.map((b) => {
      if (b.id === id) return { ...b, ...patch } as Block;
      let next = b;
      for (const [s, l] of childLists(b)) next = withList(next, s, walk(l));
      return next;
    });
  return walk(program);
}

export function moveBlock(program: Block[], id: string, key: ContainerKey, index: number): Block[] {
  const block = findBlock(program, id);
  const from = locate(program, id);
  if (!block || !from) return program;
  if (isInsideBlock(program, id, key)) return program;
  let target = index;
  if (from.key === key && from.index < index) target -= 1;
  const removed = removeBlock(program, id);
  if (!canInsert(removed, key, block)) return program;
  return insertAt(removed, key, target, block);
}

/** Move a block one step up/down within its container (keyboard-accessible reordering). */
export function nudgeBlock(program: Block[], id: string, delta: -1 | 1): Block[] {
  const loc = locate(program, id);
  if (!loc) return program;
  return mapList(program, loc.key, (list) => {
    const j = loc.index + delta;
    if (j < 0 || j >= list.length) return list;
    const next = [...list];
    [next[loc.index], next[j]] = [next[j], next[loc.index]];
    return next;
  });
}

/** Strip to a plain, validated structure (server-side sanitization of client programs). */
export function sanitizeProgram(input: unknown, depth = 0): Block[] {
  if (!Array.isArray(input) || depth > MAX_DEPTH) return [];
  const out: Block[] = [];
  for (const raw of input.slice(0, 60)) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const id = typeof r.id === "string" ? r.id.slice(0, 40) : newId();
    if (r.type === "move" && ["up", "down", "left", "right"].includes(r.dir as string)) {
      out.push({ id, type: "move", dir: r.dir as "up" });
    } else if (r.type === "repeat") {
      const times = Math.max(1, Math.min(9, Number(r.times) || 1));
      out.push({ id, type: "repeat", times, body: sanitizeProgram(r.body, depth + 1) });
    } else if (r.type === "if" && typeof r.cond === "string") {
      out.push({
        id,
        type: "if",
        cond: r.cond.slice(0, 40),
        then: sanitizeProgram(r.then, depth + 1),
        else: sanitizeProgram(r.else, depth + 1),
      });
    } else if (r.type === "put" && typeof r.box === "string") {
      out.push({ id, type: "put", box: r.box.slice(0, 40) });
    }
  }
  return out;
}

