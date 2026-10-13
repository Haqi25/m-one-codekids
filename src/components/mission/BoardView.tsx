"use client";

import type { Board, GridBoard, SortBoard, Block, RunResult, GridFrame, SortFrame, Mission } from "@/lib/missions/types";
import { useEffect, useState } from "react";
import { runMission } from "@/lib/missions/engine";

interface Props {
  board: Board;
  mission?: Mission;
  program: Block[];
  onResult: (res: RunResult) => void;
}

export function BoardView({ board, mission, program, onResult }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameIdx, setFrameIdx] = useState(0);
  const [frames, setFrames] = useState<any[]>([]); // GridFrame[] or SortFrame[]
  
  const activeMission: Mission = mission || {
    board,
    palette: [],
    solution: [],
    hints: ["", "", ""],
    id: "",
    level: 1,
    order: 1,
    title: "",
    subject: "Logika",
    story: "",
    goal: "",
    optimalBlocks: 1,
  };

  useEffect(() => {
    if (isPlaying && frameIdx < frames.length - 1) {
      const timer = setTimeout(() => setFrameIdx((i) => i + 1), board.kind === "sort" ? 850 : 600);
      return () => clearTimeout(timer);
    } else if (isPlaying && frameIdx >= frames.length - 1) {
      setIsPlaying(false);
      // Wait for last animation to finish, then report result
      setTimeout(() => {
        onResult(runMission(activeMission, program));
      }, 500);
    }
  }, [isPlaying, frameIdx, frames, board, program, onResult, activeMission]);

  const handlePlay = () => {
    const res = runMission(activeMission, program);
    if (res.reason === "empty") {
      onResult(res);
      return;
    }
    setFrames(board.kind === "grid" ? (res.gridFrames || []) : (res.sortFrames || []));
    setFrameIdx(0);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setFrameIdx(0);
    setFrames([]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative bg-sky-200/50 rounded-3xl p-4 border-4 border-navy/10 overflow-hidden shadow-inner flex items-center justify-center min-h-[340px]">
        {board.kind === "grid" ? (
          <GridView board={board} frame={frames[frameIdx] as GridFrame} />
        ) : (
          <SortView
            board={board}
            frames={frames as SortFrame[]}
            currentIdx={frameIdx}
            isPlaying={isPlaying}
          />
        )}
      </div>
      
      <div className="flex gap-2 justify-center">
        {!isPlaying && frames.length === 0 ? (
          <button onClick={handlePlay} className="btn-primary flex-1 max-w-[200px] cursor-pointer">
            ▶️ Jalankan
          </button>
        ) : (
          <button onClick={handleReset} className="btn-ghost flex-1 max-w-[200px] cursor-pointer font-bold">
            🔄 Ulangi
          </button>
        )}
      </div>
    </div>
  );
}

function GridView({ board, frame }: { board: GridBoard; frame?: GridFrame }) {
  const f = frame || { pos: board.start, collected: [], counter: 0 };
  return (
    <div 
      className="grid gap-1 bg-white p-2 rounded-2xl shadow-sm"
      style={{ gridTemplateColumns: `repeat(${board.width}, 3rem)`, gridTemplateRows: `repeat(${board.height}, 3rem)` }}
    >
      {Array.from({ length: board.height * board.width }).map((_, i) => {
        const x = i % board.width;
        const y = Math.floor(i / board.width);
        const isGoal = board.goal.x === x && board.goal.y === y;
        const isWall = board.walls.find((w) => w.x === x && w.y === y);
        const itemIdx = board.items.findIndex((it) => it.x === x && it.y === y);
        const item = itemIdx >= 0 ? board.items[itemIdx] : null;
        const isCollected = item !== null && f.collected.includes(itemIdx);
        
        return (
          <div key={i} className={`relative flex items-center justify-center rounded-xl text-3xl ${isWall ? 'bg-navy/5' : 'bg-peach-200/50 border-2 border-peach-300'}`}>
            {isGoal && <span className="absolute opacity-50 z-0">{board.goal.emoji}</span>}
            {isWall && <span className="z-10">{isWall.emoji || "🧱"}</span>}
            {item && !isCollected && <span className="z-10">{item.emoji}</span>}
            
            {/* Player Character */}
            {f.pos.x === x && f.pos.y === y && (
              <span className={`absolute z-20 transition-transform duration-500 text-4xl ${f.event === 'bump' || f.event === 'wrong-order' ? 'animate-shake' : ''} ${f.event === 'goal' ? 'animate-bounce-soft' : ''}`}>
                🦊
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SortView({
  board,
  frames,
  currentIdx,
  isPlaying,
}: {
  board: SortBoard;
  frames: SortFrame[];
  currentIdx: number;
  isPlaying: boolean;
}) {
  const hasStarted = frames.length > 0;
  const currentFrame = hasStarted ? frames[currentIdx] : null;
  const activeItem = currentFrame ? board.items[currentFrame.itemIndex] : null;
  const activeBox = currentFrame ? board.boxes.find((b) => b.id === currentFrame.box) : null;

  return (
    <div className="flex flex-col h-full w-full justify-between items-center gap-4 py-2">
      {/* 1. Queue / Conveyor Belt */}
      <div className="w-full">
        <div className="text-xs font-bold text-navy/70 mb-1.5 flex items-center justify-between px-2">
          <span>📦 Benda yang Akan Disortir ({board.items.length}):</span>
          <span className="text-[11px] text-ink/60 font-medium">Masuk satu per satu</span>
        </div>
        <div className="flex gap-2 bg-white/70 p-2.5 rounded-2xl overflow-x-auto max-w-full border border-navy/10 shadow-inner">
          {board.items.map((item, i) => {
            const isProcessed = hasStarted && i < currentIdx;
            const isCurrent = hasStarted && i === currentIdx;

            return (
              <div
                key={i}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 transition-all shrink-0 text-sm font-bold ${
                  isCurrent
                    ? "bg-amber-100 border-sun scale-105 shadow-md animate-bounce-soft text-navy"
                    : isProcessed
                    ? "bg-slate-100/60 border-slate-200 opacity-40 text-slate-500"
                    : "bg-white border-navy/15 text-navy shadow-sm"
                }`}
              >
                <span className="text-xl">{item.emoji}</span>
                <span>{item.label}</span>
                {isProcessed && <span className="text-xs text-leaf-700">✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Fox Courier Action Zone (Middle) */}
      <div className="w-full bg-white rounded-2xl p-3.5 border-2 border-navy/15 shadow-sm text-center">
        {hasStarted && activeItem ? (
          <div className="flex flex-col items-center justify-center gap-2.5 animate-pop-in">
            <div className="flex items-center gap-3">
              <span className="text-4xl animate-bounce-soft">🦊</span>
              <div className="bg-peach/30 border border-peach px-3.5 py-1.5 rounded-2xl text-left shadow-sm">
                <span className="text-[11px] font-bold text-ink/70 block">Rubah membawa:</span>
                <div className="text-base font-extrabold text-navy flex items-center gap-1.5">
                  <span className="text-2xl">{activeItem.emoji}</span>
                  <span>{activeItem.label}</span>
                </div>
              </div>
            </div>

            <div className="bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-navy flex flex-wrap items-center justify-center gap-2">
              <span>💭 Rubah memeriksa:</span>
              {board.conditions.map((c) => {
                const satisfies = activeItem.tags.includes(c.id);
                return (
                  <span key={c.id}>
                    Apakah <strong>{c.label}</strong>? 👉{" "}
                    <strong className={satisfies ? "text-leaf-700" : "text-rose-600"}>
                      {satisfies ? "YA! ✅" : "BUKAN! ❌"}
                    </strong>
                  </span>
                );
              })}
              {activeBox && (
                <span>
                  ➔ Diantar ke:{" "}
                  <strong className="underline">
                    {activeBox.emoji} {activeBox.label}
                  </strong>{" "}
                  {currentFrame?.correct ? "🎉" : "⚠️"}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 py-1">
            <span className="text-3xl animate-bounce-soft">🦊</span>
            <div className="text-xs sm:text-sm text-navy/90 font-bold text-left">
              Halo! Bantu Rubah memilah barang-barang di atas ke kotak yang tepat, ya!
            </div>
          </div>
        )}
      </div>

      {/* 3. Destination Boxes */}
      <div className="flex flex-wrap gap-3 w-full justify-center">
        {board.boxes.map((box) => {
          const isTargetNow = currentFrame?.box === box.id;
          const itemsInside = hasStarted
            ? frames
                .slice(0, currentIdx + 1)
                .filter((f) => f.box === box.id)
                .map((f) => board.items[f.itemIndex])
            : [];

          let boxColorStyle = "border-sky-400 bg-sky-50/50";
          if (box.color === "red") boxColorStyle = "border-rose-400 bg-rose-50/50";
          if (box.color === "green") boxColorStyle = "border-emerald-400 bg-emerald-50/50";
          if (box.color === "yellow") boxColorStyle = "border-amber-400 bg-amber-50/50";

          return (
            <div
              key={box.id}
              className={`flex-1 min-w-[120px] max-w-[200px] flex flex-col items-center gap-1.5 p-3 rounded-2xl border-3 transition-all ${boxColorStyle} ${
                isTargetNow
                  ? currentFrame?.correct
                    ? "ring-4 ring-leaf shadow-lg scale-105"
                    : "ring-4 ring-berry shadow-lg animate-shake scale-105"
                  : "shadow-sm"
              }`}
            >
              <span className="text-3xl drop-shadow-sm">{box.emoji}</span>
              <span className="font-extrabold text-navy text-xs text-center leading-tight">
                {box.label}
              </span>

              {/* Items collected in this box */}
              <div className="w-full min-h-[36px] bg-white/70 rounded-xl p-1.5 flex flex-wrap gap-1 justify-center items-center border border-navy/10 mt-1">
                {itemsInside.length > 0 ? (
                  itemsInside.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-base font-bold bg-white px-1.5 py-0.5 rounded-md shadow-sm border border-navy/5 animate-pop-in"
                      title={item.label}
                    >
                      {item.emoji}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-ink/40 italic">Kosong</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
