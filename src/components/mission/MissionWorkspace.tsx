"use client";
import { useState } from "react";
import type { Mission, Block, RunResult } from "@/lib/missions/types";
import { BlockEditor } from "@/components/mission/BlockEditor";
import { BoardView } from "@/components/mission/BoardView";
import { BibiMascot } from "@/components/brand/BibiMascot";
import { feedbackFor } from "@/lib/missions/engine";
import { TanyaBibi } from "@/components/mission/TanyaBibi";
import Link from "next/link";
import { useRouter } from "next/navigation";

// The interactive mission workspace

export default function MissionWorkspace({ 
  mission, 
  childId,
  starsToUnlock,
}: { 
  mission: Mission; 
  childId: string;
  starsToUnlock: number;
}) {
  const router = useRouter();
  const [program, setProgram] = useState<Block[]>([]);
  const [result, setResult] = useState<RunResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBibiOpen, setIsBibiOpen] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const handleResult = async (res: RunResult) => {
    setResult(res);
    setAttempts(a => a + 1);
    
    // Save attempt (and progress if success) to server via API
    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append("missionId", mission.id);
      data.append("success", String(res.success));
      data.append("blocksUsed", String(res.blocksUsed));
      data.append("hintsUsed", String(hintsUsed));
      
      const response = await fetch("/api/progress", {
        method: "POST",
        body: data,
      });
      if (res.success && response.ok) {
        // We will show a success modal, then route back to map
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-peach overflow-hidden">
      {/* Top Bar */}
      <header className="bg-white px-4 py-3 border-b-2 border-navy/10 flex justify-between items-center z-10 shadow-sm shrink-0">
        <Link href="/peta" className="btn-ghost !min-h-10 px-4 py-2 text-sm">⬅️ Peta</Link>
        <h1 className="font-display font-bold text-navy text-xl text-center flex-1 mx-4 truncate">
          Misi {mission.order}: {mission.title}
        </h1>
        <div className="flex gap-2">
          {/* Stars indicator */}
          <div className="bg-peach-200 text-orange-700 font-bold px-3 py-1.5 rounded-full flex gap-1 items-center">
             ⭐ <span className="hidden sm:inline">Terkumpul</span>
          </div>
        </div>
      </header>

      {/* Main Workspace (split layout on desktop, stacked on mobile) */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left: Board & Story */}
        <section className="w-full md:w-5/12 lg:w-1/2 flex flex-col border-b-2 md:border-b-0 md:border-r-2 border-navy/10 bg-white">
           <div className="p-4 md:p-6 bg-peach-200/30 text-navy text-lg leading-relaxed flex items-start gap-4">
              <BibiMascot className="w-16 h-16 shrink-0" mood={result?.success ? "cheer" : "happy"} />
              <div>
                <p className="font-bold">{mission.story}</p>
                <p className="text-sm mt-1 bg-white/60 inline-block px-2 py-1 rounded-lg text-navy-700 font-bold">🎯 Tujuan: {mission.goal}</p>
              </div>
           </div>
           
           <div className="flex-1 p-4 md:p-6 overflow-y-auto">
             <BoardView board={mission.board} program={program} onResult={handleResult} />
             
             {/* Feedback Area */}
             {result && (
               <div className={`mt-6 p-4 rounded-2xl border-2 animate-pop-in ${result.success ? 'bg-leaf/10 border-leaf text-leaf-700' : 'bg-orange/10 border-orange text-orange-700'}`}>
                 <p className="font-bold text-lg">{feedbackFor(result)}</p>
                 {!result.success && (
                   <button 
                     onClick={() => setIsBibiOpen(true)}
                     className="btn-ghost w-full mt-3 flex items-center justify-center gap-2"
                   >
                     Tanya Bibi <BibiMascot className="w-6 h-6" mood="thinking" />
                   </button>
                 )}
               </div>
             )}
           </div>
        </section>

        {/* Right: Block Editor */}
        <section className="w-full md:w-7/12 lg:w-1/2 flex flex-col bg-peach/10 p-4 relative">
           <BlockEditor 
             program={program} 
             onChange={setProgram} 
             palette={mission.palette} 
           />
           
           {!isBibiOpen && (
             <button
               onClick={() => setIsBibiOpen(true)}
               className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-pop flex items-center gap-2 text-navy font-bold hover:bg-peach-200 transition-colors z-40 animate-bounce-soft"
             >
               <BibiMascot className="w-10 h-10" mood="happy" />
               <span className="hidden sm:inline">Tanya Bibi</span>
             </button>
           )}

           <TanyaBibi
             missionId={mission.id}
             goal={mission.goal}
             program={program}
             attempts={attempts}
             isOpen={isBibiOpen}
             onClose={() => setIsBibiOpen(false)}
             onHintUsed={() => setHintsUsed(h => h + 1)}
           />
        </section>

        {/* Success Overlay */}
        {result?.success && !isSubmitting && (
           <div className="absolute inset-0 bg-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-soft animate-pop-in">
               <BibiMascot className="w-32 h-32 mx-auto mb-4" mood="cheer" />
               <h2 className="text-3xl font-display text-navy mb-2">Misi Berhasil!</h2>
               <div className="flex justify-center gap-2 text-4xl mb-6">
                 {/* TODO: Calculate actual stars based on constraints */}
                 ⭐ ⭐ ⭐
               </div>
               <Link href="/peta" className="btn-primary w-full text-xl py-4">Lanjut Petualangan 🚀</Link>
             </div>
           </div>
        )}
      </main>
    </div>
  );
}
