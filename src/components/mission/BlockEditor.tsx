"use client";
import type { Block, BlockType, PaletteItem } from "@/lib/missions/types";
import { useState } from "react";
import { fromPalette, moveBlock, nudgeBlock, removeBlock, updateBlock } from "@/lib/missions/program";

// Simple native HTML5 D&D based block editor for React 19 MVP

export function BlockEditor({
  program,
  onChange,
  palette,
}: {
  program: Block[];
  onChange: (prog: Block[]) => void;
  palette: PaletteItem[];
}) {
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedBlock(id);
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetContainer: string, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    setDraggedBlock(null);
    onChange(moveBlock(program, id, targetContainer, index));
  };

  const handleAddPalette = (item: PaletteItem) => {
    onChange([...program, fromPalette(item)]);
  };

  return (
    <div className="flex flex-col h-full gap-4 relative">
      {/* Workspace */}
      <div 
        className="flex-1 bg-peach/30 border-2 border-navy/10 rounded-2xl p-4 overflow-y-auto flex flex-col gap-2 min-h-[300px]"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, "root", program.length)}
      >
        {program.length === 0 ? (
          <div className="m-auto text-center text-navy-300 font-bold max-w-[200px]">
            Tarik blok dari bawah atau sentuh blok untuk menambahkan ke sini.
          </div>
        ) : (
          <BlockList 
            blocks={program} 
            containerKey="root" 
            program={program} 
            onChange={onChange}
            draggedBlock={draggedBlock}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          />
        )}
      </div>

      {/* Palette */}
      <div className="bg-white rounded-2xl border-2 border-navy/10 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-navy-300 mb-3 uppercase tracking-wider">Blok Tersedia</h3>
        <div className="flex flex-wrap gap-2">
          {palette.map((item, i) => (
            <button
              key={i}
              onClick={() => handleAddPalette(item)}
              className="px-4 py-2 rounded-xl text-white font-bold shadow-pop-sm transition-transform active:translate-y-1 bg-sky hover:bg-sky-700"
            >
              {item.type === "move" && `Gerak ${item.dir === "up" ? "Atas" : item.dir === "down" ? "Bawah" : item.dir === "left" ? "Kiri" : "Kanan"}`}
              {item.type === "repeat" && "Ulangi"}
              {item.type === "if" && "Jika..."}
              {item.type === "put" && "Masukkan"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlockList({ blocks, containerKey, program, onChange, draggedBlock, onDragStart, onDrop, onDragOver }: any) {
  return (
    <>
      {blocks.map((b: Block, i: number) => (
        <div key={b.id} className="relative group">
          {/* Drop indicator above */}
          <div className="h-2 w-full transition-colors opacity-0 group-hover:opacity-100 hover:bg-sky/50 rounded-full" onDragOver={onDragOver} onDrop={(e) => onDrop(e, containerKey, i)} />
          
          <div 
            draggable
            onDragStart={(e) => onDragStart(e, b.id)}
            className={`p-3 rounded-xl border-2 border-b-4 border-navy/20 cursor-grab active:cursor-grabbing text-white font-bold flex flex-col gap-2 transition-opacity ${draggedBlock === b.id ? 'opacity-30' : 'opacity-100'} ${getBlockColor(b.type)}`}
          >
            <div className="flex justify-between items-center gap-2">
               <span className="flex-1">{getBlockLabel(b)}</span>
               
               {/* Controls */}
               <div className="flex gap-1 bg-white/20 rounded-lg p-1">
                 <button onClick={() => onChange(nudgeBlock(program, b.id, -1))} className="w-6 h-6 hover:bg-white/30 rounded">⬆️</button>
                 <button onClick={() => onChange(nudgeBlock(program, b.id, 1))} className="w-6 h-6 hover:bg-white/30 rounded">⬇️</button>
                 <button onClick={() => onChange(removeBlock(program, b.id))} className="w-6 h-6 hover:bg-berry/80 hover:text-white rounded ml-1 text-berry bg-white">❌</button>
               </div>
            </div>

            {/* Nested blocks */}
            {b.type === "repeat" && (
               <div className="ml-4 pl-4 border-l-4 border-white/30 min-h-[40px] flex flex-col gap-2" onDragOver={onDragOver} onDrop={(e) => onDrop(e, `${b.id}:body`, b.body.length)}>
                 <BlockList blocks={b.body} containerKey={`${b.id}:body`} program={program} onChange={onChange} draggedBlock={draggedBlock} onDragStart={onDragStart} onDrop={onDrop} onDragOver={onDragOver} />
               </div>
            )}
            
            {b.type === "if" && (
               <div className="ml-4 flex flex-col gap-2">
                 <div className="text-sm opacity-90 mt-1">MAKA:</div>
                 <div className="pl-4 border-l-4 border-white/30 min-h-[40px] flex flex-col gap-2" onDragOver={onDragOver} onDrop={(e) => onDrop(e, `${b.id}:then`, b.then.length)}>
                   <BlockList blocks={b.then} containerKey={`${b.id}:then`} program={program} onChange={onChange} draggedBlock={draggedBlock} onDragStart={onDragStart} onDrop={onDrop} onDragOver={onDragOver} />
                 </div>
                 <div className="text-sm opacity-90 mt-1">JIKA TIDAK:</div>
                 <div className="pl-4 border-l-4 border-white/30 min-h-[40px] flex flex-col gap-2" onDragOver={onDragOver} onDrop={(e) => onDrop(e, `${b.id}:else`, b.else.length)}>
                   <BlockList blocks={b.else} containerKey={`${b.id}:else`} program={program} onChange={onChange} draggedBlock={draggedBlock} onDragStart={onDragStart} onDrop={onDrop} onDragOver={onDragOver} />
                 </div>
               </div>
            )}
          </div>
        </div>
      ))}
      
      {/* Drop indicator at bottom */}
      <div className="h-8 w-full border-2 border-dashed border-transparent hover:border-sky/50 rounded-xl" onDragOver={onDragOver} onDrop={(e) => onDrop(e, containerKey, blocks.length)} />
    </>
  );
}

function getBlockColor(type: BlockType) {
  switch (type) {
    case "move": return "bg-orange hover:bg-orange-600";
    case "repeat": return "bg-leaf hover:bg-leaf-700";
    case "if": return "bg-sky hover:bg-sky-700";
    case "put": return "bg-sun hover:bg-yellow-500 text-navy";
  }
}

function getBlockLabel(b: Block) {
  if (b.type === "move") return `Gerak ${b.dir === "up" ? "Atas ⬆️" : b.dir === "down" ? "Bawah ⬇️" : b.dir === "left" ? "Kiri ⬅️" : "Kanan ➡️"}`;
  if (b.type === "repeat") return `Ulangi ${b.times}x`;
  if (b.type === "if") return `Jika ${b.cond}`;
  if (b.type === "put") return `Masukkan ke ${b.box}`;
  return "";
}

