import { requireChild } from "@/lib/session";
import { db } from "@/lib/db";
import { LEVELS, MISSIONS } from "@/content/missions";
import { missionState, totals } from "@/lib/missions/gamification";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default async function PetaPage() {
  const child = await requireChild();
  
  // Load progress
  const progress = await db.progress.findMany({
    where: { childId: child.id }
  });

  const { stars, score, rank } = totals(progress);

  return (
    <div className="min-h-dvh flex flex-col bg-sky-700 text-white">
      {/* Header */}
      <header className="p-4 bg-navy flex justify-between items-center shadow-soft sticky top-0 z-10">
        <Logo className="text-white brightness-200" />
        <div className="flex gap-4 items-center">
          <div className="bg-sky/30 px-4 py-2 rounded-full font-bold flex gap-2">
            <span>🌟 {stars}</span>
            <span>🏆 {score} ({rank.name})</span>
          </div>
          <div className="flex items-center gap-2 bg-navy-700 px-3 py-1.5 rounded-full">
            <span className="text-2xl">{child.avatar}</span>
            <span className="font-bold">{child.nickname}</span>
          </div>
        </div>
      </header>

      {/* World Map */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 2px, transparent 0)", backgroundSize: "40px 40px" }} />
        
        <div className="max-w-4xl mx-auto space-y-12 pb-24 relative z-0">
          <h1 className="text-center text-4xl font-display font-extrabold text-white animate-bounce-soft pt-8">Peta Petualangan</h1>
          
          {LEVELS.map(level => {
            const levelMissions = MISSIONS.filter(m => m.level === level.level).sort((a,b) => a.order - b.order);
            return (
              <section key={level.level} className="card p-6 md:p-8 bg-white/10 border-white/20 backdrop-blur-md">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-display text-sun drop-shadow-sm flex items-center justify-center gap-2">
                    <span className="text-4xl">{level.emoji}</span> Level {level.level}: {level.title}
                  </h2>
                  <p className="text-sky-100 font-bold mt-2">{level.subtitle}</p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-6">
                  {levelMissions.map((m) => {
                    const state = missionState(m.id, progress);
                    const prog = progress.find(p => p.missionId === m.id);
                    const isLocked = state === "locked";
                    
                    return (
                      <Link 
                        key={m.id} 
                        href={isLocked ? "#" : `/misi/${m.id}`}
                        className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full flex flex-col items-center justify-center text-center transition-transform ${isLocked ? 'bg-navy-700/50 cursor-not-allowed opacity-60' : 'bg-white shadow-pop hover:-translate-y-1 hover:scale-105 active:scale-95'}`}
                        aria-disabled={isLocked}
                      >
                        <span className="text-3xl md:text-4xl drop-shadow-md">
                          {isLocked ? "🔒" : prog?.stars === 3 ? "🌟" : "⭐"}
                        </span>
                        {!isLocked && (
                          <span className="font-bold text-navy mt-1 text-sm md:text-base leading-tight px-2">{m.order}</span>
                        )}
                        {/* Stars badge if completed */}
                        {prog && prog.completed && (
                          <div className="absolute -bottom-2 bg-navy text-sun text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white">
                            {"⭐".repeat(prog.stars)}
                          </div>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </main>
    </div>
  );
}

