// Core types for mission content and the visual block program.

export type Dir = "up" | "down" | "left" | "right";
export type Concept = "sequencing" | "looping" | "conditional";

/** A visual block in the child's program. */
export type Block =
  | { id: string; type: "move"; dir: Dir }
  | { id: string; type: "repeat"; times: number; body: Block[] }
  | { id: string; type: "if"; cond: string; then: Block[]; else: Block[] }
  | { id: string; type: "put"; box: string };

export type BlockType = Block["type"];

/** Palette entry (template without id). */
export type PaletteItem =
  | { type: "move"; dir: Dir }
  | { type: "repeat"; times?: number }
  | { type: "if"; cond?: string }
  | { type: "put"; box: string };

export interface Pos {
  x: number;
  y: number;
}

export interface GridItem {
  x: number;
  y: number;
  emoji: string;
  label: string;
  /** If set, items must be collected in ascending order. */
  order?: number;
  /** Value added to the counter when collected (e.g. 3 apples). */
  value?: number;
}

export interface GridBoard {
  kind: "grid";
  width: number;
  height: number;
  start: Pos;
  goal: Pos & { emoji: string; label: string };
  walls: (Pos & { emoji?: string })[];
  items: GridItem[];
  /** Optional counter shown while running, e.g. "Apel" for multiplication. */
  counterLabel?: string;
  /** Background theme emoji used for decoration. */
  theme?: string;
}

export interface SortCondition {
  id: string;
  /** Text shown inside the IF block, e.g. "bilangan genap". */
  label: string;
}

export interface SortBox {
  id: string;
  label: string;
  emoji: string;
  color: "blue" | "red" | "green" | "yellow";
}

export interface SortItem {
  emoji: string;
  label: string;
  tags: string[];
  /** Box this item must end up in. */
  answer: string;
}

export interface SortBoard {
  kind: "sort";
  conditions: SortCondition[];
  boxes: SortBox[];
  items: SortItem[];
}

export type Board = GridBoard | SortBoard;

export interface Mission {
  id: string;
  level: 1 | 2 | 3;
  order: number;
  title: string;
  subject: "Matematika" | "IPA" | "Logika";
  /** Max 2 short sentences (FR-MISI-03). */
  story: string;
  goal: string;
  board: Board;
  palette: PaletteItem[];
  /** Fewest blocks for an ideal solution (3-star efficiency). */
  optimalBlocks: number;
  /** Hard cap on blocks; encourages loops in Level 2. */
  maxBlocks?: number;
  /** Block types that must appear (e.g. "repeat"). */
  mustUse?: BlockType[];
  /** Authored tiered hints, used as fallback when AI is unavailable. */
  hints: [string, string, string];
  /** Reference solution (never sent to Bibi output, used for tests & leak detection). */
  solution: Block[];
}

export interface LevelInfo {
  level: 1 | 2 | 3;
  concept: Concept;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
}

