"use client";

import type { Block, BlockType, Mission, PaletteItem, SortBox, SortCondition } from "@/lib/missions/types";
import { useState } from "react";
import { fromPalette, insertAt, moveBlock, newId, nudgeBlock, removeBlock, updateBlock } from "@/lib/missions/program";

type DragPayload =
  | { type: "palette"; item: PaletteItem }
  | { type: "block"; id: string };

export function BlockEditor({
  mission,
  program,
  onChange,
  palette,
}: {
  mission?: Mission;
  program: Block[];
  onChange: (prog: Block[]) => void;
  palette: PaletteItem[];
}) {
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
  const [activeDropTarget, setActiveDropTarget] = useState<string | null>(null);

  const isSortBoard = mission?.board.kind === "sort";
  const conditions: SortCondition[] = isSortBoard ? mission.board.conditions : [];
  const boxes: SortBox[] = isSortBoard ? mission.board.boxes : [];

  const getBoxInfo = (boxId: string) => boxes.find((b) => b.id === boxId);
  const getCondInfo = (condId: string) => conditions.find((c) => c.id === condId);

  // Quick setup for Level 3: Create or update IF-THEN-ELSE rule with 1 touch
  const handleAddDefaultSortRule = () => {
    const defaultCond = conditions[0]?.id || "";
    const boxThen = boxes[0]?.id || "";
    const boxElse = boxes[1]?.id || boxes[0]?.id || "";

    const newIfBlock: Block = {
      id: newId(),
      type: "if",
      cond: defaultCond,
      then: boxThen ? [{ id: newId(), type: "put", box: boxThen }] : [],
      else: boxElse ? [{ id: newId(), type: "put", box: boxElse }] : [],
    };
    onChange([...program, newIfBlock]);
  };

  const handleSetBoxForSlot = (ifId: string, slot: "then" | "else", boxId: string) => {
    const ifBlock = program.find((b) => b.id === ifId);
    if (!ifBlock || ifBlock.type !== "if") return;

    const newPutBlock: Block = { id: newId(), type: "put", box: boxId };
    const updated = updateBlock(program, ifId, {
      [slot]: [newPutBlock],
    });
    onChange(updated);
  };

  const handleUpdateCond = (ifId: string, newCond: string) => {
    onChange(updateBlock(program, ifId, { cond: newCond }));
  };

  // Palette Drag handlers
  const handlePaletteDragStart = (e: React.DragEvent, item: PaletteItem) => {
    const payload: DragPayload = { type: "palette", item };
    setDragPayload(payload);
    try {
      e.dataTransfer.setData("application/json", JSON.stringify(payload));
      e.dataTransfer.setData("text/plain", JSON.stringify(payload));
      e.dataTransfer.effectAllowed = "copy";
    } catch {}
  };

  // Workspace Block Drag handlers
  const handleBlockDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    const payload: DragPayload = { type: "block", id };
    setDragPayload(payload);
    try {
      e.dataTransfer.setData("application/json", JSON.stringify(payload));
      e.dataTransfer.setData("text/plain", JSON.stringify(payload));
      e.dataTransfer.effectAllowed = "move";
    } catch {}
  };

  const handleDragEnd = () => {
    setDragPayload(null);
    setActiveDropTarget(null);
  };

  const handleDragOver = (e: React.DragEvent, containerKey: string, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.dataTransfer.dropEffect = dragPayload?.type === "palette" ? "copy" : "move";
    } catch {}
    const targetKey = `${containerKey}:${index}`;
    if (activeDropTarget !== targetKey) {
      setActiveDropTarget(targetKey);
    }
  };

  const handleDrop = (e: React.DragEvent, containerKey: string, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropTarget(null);

    let payload = dragPayload;
    if (!payload) {
      try {
        const raw = e.dataTransfer.getData("application/json") || e.dataTransfer.getData("text/plain");
        if (raw) payload = JSON.parse(raw);
      } catch {}
    }
    setDragPayload(null);

    if (!payload) return;

    if (payload.type === "palette") {
      const defaultCond = conditions[0]?.id;
      const newBlock = fromPalette(payload.item, defaultCond);
      onChange(insertAt(program, containerKey, index, newBlock));
    } else if (payload.type === "block") {
      onChange(moveBlock(program, payload.id, containerKey, index));
    }
  };

  const handleAddPalette = (item: PaletteItem) => {
    if (isSortBoard && item.type === "if") {
      // Smart Add for kids: automatically create a complete friendly rule
      handleAddDefaultSortRule();
      return;
    }
    const defaultCond = conditions[0]?.id;
    onChange([...program, fromPalette(item, defaultCond)]);
  };

  return (
    <div className="flex flex-col h-full gap-4 relative select-none">
      {/* Workspace */}
      <div 
        className="flex-1 bg-peach/30 border-2 border-navy/10 rounded-2xl p-4 overflow-y-auto flex flex-col min-h-[320px]"
        onDragOver={(e) => handleDragOver(e, "root", program.length)}
        onDrop={(e) => handleDrop(e, "root", program.length)}
      >
        {program.length === 0 ? (
          <div 
            onDragOver={(e) => handleDragOver(e, "root", 0)}
            onDrop={(e) => handleDrop(e, "root", 0)}
            className="m-auto w-full max-w-sm rounded-2xl border-2 border-dashed border-navy/20 bg-white/70 p-6 text-center shadow-sm"
          >
            <span className="text-4xl block mb-2">🦊</span>
            <p className="font-extrabold text-navy text-base mb-1">
              {isSortBoard ? "Bantu Rubah Membuat Aturan!" : "Susun Langkah Rubah"}
            </p>
            <p className="text-xs text-ink/80 mb-4 leading-relaxed">
              {isSortBoard
                ? "Klik tombol di bawah ini untuk membuat kartu aturan pilah barang:"
                : "Tarik atau klik blok di bawah untuk menggerakkan rubah."}
            </p>

            {isSortBoard ? (
              <button
                onClick={handleAddDefaultSortRule}
                className="btn-primary w-full py-3 text-sm shadow-pop flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>➕ Buat Aturan Pilah 🔀</span>
              </button>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {isSortBoard ? (
              /* =================================================== */
              /* LEVEL 3: SIMPLE KID-FRIENDLY SORT RULE CARDS        */
              /* =================================================== */
              <div className="space-y-4">
                {program.map((b, i) => {
                  if (b.type !== "if") {
                    return (
                      <div key={b.id} className="p-3 bg-white rounded-xl border flex justify-between items-center text-sm font-bold text-navy">
                        <span>{b.type === "put" ? `📥 Masukkan ke ${getBoxInfo(b.box)?.label || b.box}` : b.type}</span>
                        <button onClick={() => onChange(removeBlock(program, b.id))} className="text-berry font-extrabold px-2 py-1">✕ Hapus</button>
                      </div>
                    );
                  }

                  const selectedCond = b.cond;
                  const currentThenBox = b.then[0]?.type === "put" ? b.then[0].box : null;
                  const currentElseBox = b.else[0]?.type === "put" ? b.else[0].box : null;

                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl p-4 sm:p-5 border-3 border-sky-400 shadow-md animate-pop-in text-navy"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b border-peach pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🔀</span>
                          <span className="font-display font-extrabold text-navy text-base sm:text-lg">
                            Aturan Pilah Rubah
                          </span>
                        </div>
                        <button
                          onClick={() => onChange(removeBlock(program, b.id))}
                          className="text-xs text-ink/60 hover:text-berry font-bold px-2 py-1 rounded-lg hover:bg-rose-50"
                          title="Hapus aturan"
                        >
                          ✕ Hapus
                        </button>
                      </div>

                      {/* Step 1: Kondisi (JIKA) */}
                      <div className="mb-4 bg-sky-50 p-3 rounded-xl border border-sky-200">
                        <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block mb-1.5">
                          1️⃣ JIKA Benda Memiliki Syarat:
                        </span>
                        {conditions.length > 1 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {conditions.map((c) => (
                              <button
                                key={c.id}
                                onClick={() => handleUpdateCond(b.id, c.id)}
                                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                                  selectedCond === c.id
                                    ? "bg-sky-600 text-white shadow-sm scale-105"
                                    : "bg-white text-navy border border-sky-300 hover:bg-sky-100"
                                }`}
                              >
                                {c.label} {selectedCond === c.id ? "✓" : ""}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm font-extrabold text-sky-900 bg-white px-3 py-1.5 rounded-lg border border-sky-200 inline-block">
                            {getCondInfo(selectedCond)?.label || selectedCond} ✨
                          </div>
                        )}
                      </div>

                      {/* Step 2: MAKA (Jika Ya) */}
                      <div className="mb-4 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1.5">
                          2️⃣ ✅ MAKA Masukkan ke:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {boxes.map((box) => {
                            const isChosen = currentThenBox === box.id;
                            return (
                              <button
                                key={box.id}
                                onClick={() => handleSetBoxForSlot(b.id, "then", box.id)}
                                className={`px-3.5 py-2 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isChosen
                                    ? "bg-emerald-600 text-white shadow-md scale-105 ring-2 ring-emerald-400"
                                    : "bg-white text-navy border-2 border-emerald-200 hover:bg-emerald-100/50"
                                }`}
                              >
                                <span className="text-lg">{box.emoji}</span>
                                <span>{box.label}</span>
                                {isChosen ? <span className="ml-1">✓</span> : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step 3: JIKA BUKAN (Else) */}
                      <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200">
                        <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block mb-1.5">
                          3️⃣ ❌ JIKA BUKAN, Masukkan ke:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {boxes.map((box) => {
                            const isChosen = currentElseBox === box.id;
                            return (
                              <button
                                key={box.id}
                                onClick={() => handleSetBoxForSlot(b.id, "else", box.id)}
                                className={`px-3.5 py-2 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isChosen
                                    ? "bg-rose-600 text-white shadow-md scale-105 ring-2 ring-rose-400"
                                    : "bg-white text-navy border-2 border-rose-200 hover:bg-rose-100/50"
                                }`}
                              >
                                <span className="text-lg">{box.emoji}</span>
                                <span>{box.label}</span>
                                {isChosen ? <span className="ml-1">✓</span> : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* =================================================== */
              /* LEVEL 1 & 2: GRID MISSION BLOCKS                     */
              /* =================================================== */
              <div className="flex flex-col">
                <BlockList 
                  blocks={program} 
                  containerKey="root" 
                  program={program} 
                  onChange={onChange}
                  draggedBlockId={dragPayload?.type === "block" ? dragPayload.id : null}
                  onDragStart={handleBlockDragStart}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  activeDropTarget={activeDropTarget}
                  boxes={boxes}
                  conditions={conditions}
                />

                <DropZone
                  containerKey="root"
                  index={program.length}
                  activeDropTarget={activeDropTarget}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  hint={dragPayload ? "⬇️ Lepas di paling bawah" : undefined}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Palette Area */}
      <div className="bg-white rounded-2xl border-2 border-navy/10 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold text-navy/70 uppercase tracking-wider flex items-center gap-1.5">
            <span>🧩</span> Pilihan Blok:
          </h3>
          <span className="text-[11px] text-ink/60 font-medium">
            {isSortBoard ? "Klik tombol untuk menambah aturan" : "Tarik atau klik langsung"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {isSortBoard ? (
            <button
              onClick={handleAddDefaultSortRule}
              className="px-4 py-2.5 rounded-xl text-white font-extrabold shadow-pop-sm transition-transform active:translate-y-1 flex items-center gap-2 cursor-pointer text-sm bg-sky-600 hover:bg-sky-700"
            >
              <span className="text-lg">🔀</span>
              <span>➕ Tambah Aturan Pilah (JIKA... MAKA...)</span>
            </button>
          ) : (
            palette.map((item, i) => {
              let label = "";
              let icon = "";
              let colorClass = "bg-sky hover:bg-sky-700";

              if (item.type === "move") {
                const arrows: Record<string, string> = { up: "⬆️", down: "⬇️", left: "⬅️", right: "➡️" };
                const dirs: Record<string, string> = { up: "Atas", down: "Bawah", left: "Kiri", right: "Kanan" };
                label = `Gerak ${dirs[item.dir]}`;
                icon = arrows[item.dir];
                colorClass = "bg-orange hover:bg-orange-600";
              } else if (item.type === "repeat") {
                label = `Ulangi ${item.times ?? 2}x`;
                icon = "🔁";
                colorClass = "bg-leaf hover:bg-leaf-700";
              }

              return (
                <div
                  key={i}
                  draggable={true}
                  onDragStart={(e) => handlePaletteDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleAddPalette(item)}
                  className={`px-3.5 py-2.5 rounded-xl text-white font-bold shadow-pop-sm transition-all flex items-center gap-2 cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 text-xs sm:text-sm ${colorClass}`}
                >
                  <span className="text-base pointer-events-none">{icon}</span>
                  <span className="pointer-events-none">{label}</span>
                  <span className="text-[10px] opacity-60 font-mono pointer-events-none">⋮⋮</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function DropZone({
  containerKey,
  index,
  activeDropTarget,
  onDragOver,
  onDrop,
  hint,
}: {
  containerKey: string;
  index: number;
  activeDropTarget: string | null;
  onDragOver: (e: React.DragEvent, key: string, idx: number) => void;
  onDrop: (e: React.DragEvent, key: string, idx: number) => void;
  hint?: string;
}) {
  const isTarget = activeDropTarget === `${containerKey}:${index}`;

  return (
    <div
      onDragOver={(e) => onDragOver(e, containerKey, index)}
      onDrop={(e) => onDrop(e, containerKey, index)}
      className={`transition-all duration-150 rounded-xl flex items-center justify-center my-0.5 ${
        isTarget
          ? "h-12 border-2 border-dashed border-sky-500 bg-sky-100/90 scale-[1.01] shadow-inner text-sky-800 font-extrabold text-xs"
          : hint
          ? "h-9 border-2 border-dashed border-white/30 bg-white/5 hover:border-white/60 text-white/70 text-xs"
          : "h-2 hover:h-6 hover:bg-sky-200/40 opacity-0 hover:opacity-100 rounded-full"
      }`}
    >
      {isTarget ? <span>⬇️ Lepas blok di sini</span> : hint ? <span>{hint}</span> : null}
    </div>
  );
}

function BlockList({
  blocks,
  containerKey,
  program,
  onChange,
  draggedBlockId,
  onDragStart,
  onDragEnd,
  onDrop,
  onDragOver,
  activeDropTarget,
  boxes,
  conditions,
}: any) {
  return (
    <>
      {blocks.map((b: Block, i: number) => {
        return (
          <div key={b.id} className="relative flex flex-col">
            <DropZone
              containerKey={containerKey}
              index={i}
              activeDropTarget={activeDropTarget}
              onDragOver={onDragOver}
              onDrop={onDrop}
            />

            <div
              draggable={true}
              onDragStart={(e) => onDragStart(e, b.id)}
              onDragEnd={onDragEnd}
              className={`p-3.5 rounded-2xl border-2 border-b-4 border-navy/20 text-white font-bold flex flex-col gap-2.5 transition-all cursor-grab active:cursor-grabbing ${
                draggedBlockId === b.id ? "opacity-30 scale-95" : "opacity-100 shadow-sm"
              } ${getBlockBgColor(b)}`}
            >
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 flex-1 flex-wrap">
                  <span className="text-xs opacity-60 font-mono">⋮⋮</span>
                  {b.type === "move" && (
                    <span className="text-sm">
                      Gerak {b.dir === "up" ? "Atas ⬆️" : b.dir === "down" ? "Bawah ⬇️" : b.dir === "left" ? "Kiri ⬅️" : "Kanan ➡️"}
                    </span>
                  )}
                  {b.type === "repeat" && <span className="text-sm">🔁 Ulangi {b.times}x</span>}
                </div>

                <div 
                  className="flex gap-1 bg-black/20 rounded-lg p-1 shrink-0"
                  draggable={false}
                  onDragStart={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onChange(nudgeBlock(program, b.id, -1))}
                    className="w-6 h-6 hover:bg-white/30 rounded flex items-center justify-center text-xs cursor-pointer"
                    title="Geser ke atas"
                  >
                    ⬆️
                  </button>
                  <button
                    onClick={() => onChange(nudgeBlock(program, b.id, 1))}
                    className="w-6 h-6 hover:bg-white/30 rounded flex items-center justify-center text-xs cursor-pointer"
                    title="Geser ke bawah"
                  >
                    ⬇️
                  </button>
                  <button
                    onClick={() => onChange(removeBlock(program, b.id))}
                    className="w-6 h-6 hover:bg-berry text-berry hover:text-white rounded ml-1 bg-white flex items-center justify-center text-xs cursor-pointer"
                    title="Hapus blok"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {b.type === "repeat" && (
                <div 
                  className="ml-3 pl-3 border-l-4 border-white/30 min-h-[44px] flex flex-col"
                  draggable={false}
                  onDragStart={(e) => e.stopPropagation()}
                >
                  <BlockList
                    blocks={b.body}
                    containerKey={`${b.id}:body`}
                    program={program}
                    onChange={onChange}
                    draggedBlockId={draggedBlockId}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    activeDropTarget={activeDropTarget}
                    boxes={boxes}
                    conditions={conditions}
                  />
                  <DropZone
                    containerKey={`${b.id}:body`}
                    index={b.body.length}
                    activeDropTarget={activeDropTarget}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    hint={b.body.length === 0 ? "⬇️ Tarik blok ke dalam pengulangan" : undefined}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

function getBlockBgColor(b: Block) {
  if (b.type === "move") return "bg-orange hover:bg-orange-600";
  if (b.type === "repeat") return "bg-leaf hover:bg-leaf-700";
  return "bg-navy";
}
