"use client";

import { useState } from "react";
import type { Mission, Block, RunResult } from "@/lib/missions/types";
import { BlockEditor } from "@/components/mission/BlockEditor";
import { BoardView } from "@/components/mission/BoardView";
import { BibiMascot } from "@/components/brand/BibiMascot";
import { feedbackFor } from "@/lib/missions/engine";
import { TanyaBibi } from "@/components/mission/TanyaBibi";
import { MissionSuccessModal } from "@/components/mission/MissionSuccessModal";
import { soundEngine } from "@/lib/audio";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SuccessData {
  stars: number;
  score: number;
  optimalBlocks: number;
  blocksUsed: number;
  newBadges: string[];
  nextMissionId: string | null;
}

export default function MissionWorkspace({ 
  mission, 
  childId,
  starsToUnlock,
  initialSoundOn = true,
}: { 
  mission: Mission; 
  childId: string;
  starsToUnlock: number;
  initialSoundOn?: boolean;
}) {
  const router = useRouter();
  const [program, setProgram] = useState<Block[]>([]);
  const [result, setResult] = useState<RunResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBibiOpen, setIsBibiOpen] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(initialSoundOn);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  const handleResult = async (res: RunResult) => {
    setResult(res);
    setAttempts((a) => a + 1);
    
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
        const json = await response.json();
        setSuccessData({
          stars: json.stars,
          score: json.score,
          optimalBlocks: json.optimalBlocks || mission.optimalBlocks,
          blocksUsed: json.blocksUsed || res.blocksUsed,
          newBadges: json.newBadges || [],
          nextMissionId: json.nextMissionId || null,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSuccessData(null);
    setResult(null);
  };

  const toggleSound = () => {
    const next = soundEngine.toggle();
    setSoundEnabled(next);
  };

  return (
    <div className="flex flex-col h-dvh bg-peach overflow-hidden">
      {/* Top Bar */}
      <header className="bg-white px-4 py-3 border-b-2 border-navy/10 flex justify-between items-center z-10 shadow-sm shrink-0">
        <Link href="/peta" className="btn-ghost !min-h-10 px-4 py-2 text-sm">
          ⬅️ Peta
        </Link>
        <h1 className="font-display font-bold text-navy text-xl text-center flex-1 mx-4 truncate">
          Misi {mission.order}: {mission.title}
        </h1>
        <div className="flex gap-2 items-center">
          {/* Sound Toggle Button */}
          <button
            onClick={toggleSound}
            className="bg-peach-200 hover:bg-peach-300 text-navy font-bold px-3 py-1.5 rounded-full flex gap-1 items-center transition-colors text-sm"
            title={soundEnabled ? "Matikan Suara" : "Nyalakan Suara"}
          >
            <span>{soundEnabled ? "🔊" : "🔇"}</span>
            <span className="hidden sm:inline text-xs">{soundEnabled ? "Suara Nyala" : "Hening"}</span>
          </button>
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
             <BoardView board={mission.board} mission={mission} program={program} onResult={handleResult} />
             
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
             mission={mission}
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
             onHintUsed={() => setHintsUsed((h) => h + 1)}
           />
        </section>

        {/* Dynamic Celebration Modal with sound, stars, XP, badges, & confetti */}
        {successData && (
          <MissionSuccessModal
            stars={successData.stars}
            score={successData.score}
            blocksUsed={successData.blocksUsed}
            optimalBlocks={successData.optimalBlocks}
            newBadges={successData.newBadges}
            nextMissionId={successData.nextMissionId}
            onRetry={handleRetry}
            soundEnabled={soundEnabled}
          />
        )}
      </main>
    </div>
  );
}
