"use client";
import type { Board, GridBoard, SortBoard, Block, RunResult, GridFrame, SortFrame, Pos } from "@/lib/missions/types";
import { useEffect, useState, useRef } from "react";
import { runMission } from "@/lib/missions/engine";

interface Props {
  board: Board;
  program: Block[];
  onResult: (res: RunResult) => void;
}

export function BoardView({ board, program, onResult }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameIdx, setFrameIdx] = useState(0);
  const [frames, setFrames] = useState<any[]>([]); // GridFrame[] or SortFrame[]
  
  useEffect(() => {
    if (isPlaying && frameIdx < frames.length - 1) {
      const timer = setTimeout(() => setFrameIdx(i => i + 1), 600);
      return () => clearTimeout(timer);
    } else if (isPlaying && frameIdx >= frames.length - 1) {
      setIsPlaying(false);
      // Wait for last animation to finish, then report result
      setTimeout(() => {
        onResult(runMission({ board, palette: [], solution: [], hints: ["","",""], id: "", level: 1, order: 1, title: "", subject: "Logika", story: "", goal: "", optimalBlocks: 1 }, program));
      }, 500);
    }
  }, [isPlaying, frameIdx, frames, board, program, onResult]);

  const handlePlay = () => {
    // Generate frames
    const dummyMission = { board, palette: [], solution: [], hints: ["","",""], id: "", level: 1, order: 1, title: "", subject: "Logika", story: "", goal: "", optimalBlocks: 1 } as any;
    const res = runMission(dummyMission, program);
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
      <div className="relative bg-sky-200/50 rounded-3xl p-4 border-4 border-navy/10 overflow-hidden shadow-inner flex items-center justify-center min-h-[300px]">
        {board.kind === "grid" ? (
          <GridView board={board} frame={frames[frameIdx] as GridFrame} />
        ) : (
          <SortView board={board} frames={frames as SortFrame[]} currentIdx={frameIdx} />
        )}
      </div>
      
      <div className="flex gap-2 justify-center">
        {!isPlaying && frames.length === 0 ? (
          <button onClick={handlePlay} className="btn-primary flex-1 max-w-[200px]">▶️ Jalankan</button>
        ) : (
          <button onClick={handleReset} className="btn-ghost flex-1 max-w-[200px]">🔄 Ulangi</button>
        )}
      </div>
    </div>
  );
}

function GridView({ board, frame }: { board: GridBoard, frame?: GridFrame }) {
  const f = frame || { pos: board.start, collected: [], counter: 0 };
  return (
    <div 
      className="grid gap-1 bg-white p-2 rounded-2xl shadow-sm"
      style={{ gridTemplateColumns: `repeat(${board.width}, 3rem)`, gridTemplateRows: `repeat(${board.height}, 3rem)` }}
    >
      {/* Cells */}
      {Array.from({ length: board.height * board.width }).map((_, i) => {
        const x = i % board.width;
        const y = Math.floor(i / board.width);
        const isGoal = board.goal.x === x && board.goal.y === y;
        const isWall = board.walls.find(w => w.x === x && w.y === y);
        const itemIdx = board.items.findIndex(it => it.x === x && it.y === y);
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

function SortView({ board, frames, currentIdx }: { board: SortBoard, frames: SortFrame[], currentIdx: number }) {
  // Simple visualization for sort board: show items at top, moving into boxes at bottom
  return (
    <div className="flex flex-col h-full w-full justify-between items-center gap-8 py-4">
      {/* Items queue */}
      <div className="flex gap-2 bg-white/50 p-3 rounded-full overflow-x-auto max-w-full">
        {board.items.map((item, i) => {
          const frame = frames.find(f => f.itemIndex === i);
          const isProcessing = currentIdx >= frames.findIndex(f => f.itemIndex === i) && frame === undefined; // approximate logic for demo
          const isDone = frame !== undefined && frames.indexOf(frame) <= currentIdx;
          return (
             <div key={i} className={`text-4xl transition-all duration-300 ${isDone ? 'scale-0 opacity-0 w-0' : 'scale-100 opacity-100'} ${isProcessing ? 'animate-bounce-soft' : ''}`}>
               {item.emoji}
             </div>
          );
        })}
      </div>
      
      {/* Boxes */}
      <div className="flex gap-4 w-full justify-center">
        {board.boxes.map(box => {
          // Find if the currently processed item is dropped here
          const currentFrame = frames[currentIdx];
          const isDroppedHere = currentFrame?.box === box.id;
          
          return (
            <div key={box.id} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-4 transition-colors ${isDroppedHere ? (currentFrame.correct ? 'bg-leaf/20 border-leaf' : 'bg-berry/20 border-berry animate-shake') : 'bg-white border-navy/10'}`}>
               <span className="text-4xl">{box.emoji}</span>
               <span className="font-bold text-navy text-sm text-center max-w-[100px] leading-tight">{box.label}</span>
               {/* Show accumulated items */}
               <div className="flex flex-wrap gap-1 mt-2 justify-center max-w-[120px]">
                 {frames.slice(0, currentIdx + 1).filter(f => f.box === box.id).map(f => (
                    <span key={f.itemIndex} className="text-xl">{board.items[f.itemIndex].emoji}</span>
                 ))}
               </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
