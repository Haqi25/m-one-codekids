"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BibiMascot } from "@/components/brand/BibiMascot";
import { Confetti } from "@/components/ui/Confetti";
import { soundEngine } from "@/lib/audio";
import { badgeById } from "@/lib/missions/gamification";

interface MissionSuccessModalProps {
  stars: number;
  score: number;
  blocksUsed: number;
  optimalBlocks: number;
  newBadges: string[];
  nextMissionId: string | null;
  onRetry: () => void;
  soundEnabled: boolean;
}

export function MissionSuccessModal({
  stars,
  score,
  blocksUsed,
  optimalBlocks,
  newBadges,
  nextMissionId,
  onRetry,
  soundEnabled,
}: MissionSuccessModalProps) {
  const router = useRouter();
  const [revealedStars, setRevealedStars] = useState(0);
  const [showBadges, setShowBadges] = useState(false);

  useEffect(() => {
    soundEngine.setEnabled(soundEnabled);
    soundEngine.playVictoryFanfare();

    const timers: NodeJS.Timeout[] = [];

    // Reveal stars sequentially with audio feedback
    timers.push(
      setTimeout(() => {
        setRevealedStars(1);
        soundEngine.playStar(0);
      }, 400)
    );

    if (stars >= 2) {
      timers.push(
        setTimeout(() => {
          setRevealedStars(2);
          soundEngine.playStar(1);
        }, 850)
      );
    }

    if (stars >= 3) {
      timers.push(
        setTimeout(() => {
          setRevealedStars(3);
          soundEngine.playStar(2);
        }, 1300)
      );
    }

    if (newBadges.length > 0) {
      timers.push(
        setTimeout(() => {
          setShowBadges(true);
          soundEngine.playBadgeUnlocked();
        }, 1600)
      );
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [stars, newBadges, soundEnabled]);

  const titles = [
    "Misi Selesai! Kamu Berhasil! 👍",
    "Bagus Sekali! Hebat! 🌟",
    "Luar Biasa! Sempurna! 🎉",
  ];
  const headline = titles[Math.max(0, Math.min(2, stars - 1))];

  return (
    <>
      <Confetti duration={4500} />
      <div className="fixed inset-0 bg-navy/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border-4 border-sun/40 animate-pop-in my-auto relative overflow-hidden">
          {/* Top glow decoration */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-sun/30 rounded-full blur-2xl pointer-events-none" />

          {/* Bibi Mascot */}
          <div className="relative inline-block mb-3">
            <BibiMascot className="w-28 h-28 sm:w-32 sm:h-32 mx-auto drop-shadow-md" mood="cheer" />
            <span className="absolute -bottom-1 -right-2 text-2xl animate-bounce">✨</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-navy mb-2">
            {headline}
          </h2>

          {/* Dynamic Animated Stars */}
          <div className="flex justify-center items-center gap-3 my-4 py-2">
            {[1, 2, 3].map((starNum) => {
              const isEarned = stars >= starNum;
              const isRevealed = revealedStars >= starNum;

              return (
                <div
                  key={starNum}
                  className={`text-5xl sm:text-6xl transition-all duration-300 transform ${
                    isRevealed
                      ? "scale-110 drop-shadow-[0_4px_12px_rgba(255,208,47,0.7)] animate-bounce-soft"
                      : isEarned
                      ? "scale-90 opacity-30"
                      : "scale-75 opacity-20 grayscale"
                  }`}
                >
                  {isRevealed ? "⭐" : "☆"}
                </div>
              );
            })}
          </div>

          {/* Points & Stats Badges */}
          <div className="grid grid-cols-2 gap-2 my-4">
            <div className="bg-peach/30 border border-peach rounded-2xl p-3">
              <span className="text-xs text-ink/70 block font-medium">Skor Diraih</span>
              <span className="text-xl font-display font-bold text-leaf-700">+{score} XP</span>
            </div>
            <div className="bg-peach/30 border border-peach rounded-2xl p-3">
              <span className="text-xs text-ink/70 block font-medium">Efisiensi Blok</span>
              <span className="text-xl font-display font-bold text-navy">
                {blocksUsed} / {optimalBlocks}
              </span>
            </div>
          </div>

          {/* Encouragement / Tip */}
          {stars < 3 ? (
            <p className="text-xs text-ink/80 bg-peach/20 border border-peach/50 rounded-xl p-2.5 mb-4 text-left">
              💡 <strong>Tips Bibi:</strong> Coba susun dengan maksimal <strong>{optimalBlocks} blok</strong> dan minimalkan petunjuk untuk meraih 3 bintang penuh!
            </p>
          ) : (
            <p className="text-xs text-leaf-700 bg-leaf/10 border border-leaf/30 rounded-xl p-2.5 mb-4 font-bold">
              🌟 Sempurna! Kamu menggunakan solusi paling efisien!
            </p>
          )}

          {/* Newly Unlocked Badges */}
          {newBadges.length > 0 && showBadges && (
            <div className="mb-5 p-3 rounded-2xl bg-amber-50 border-2 border-sun animate-pop-in text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                <span>🎖️</span> Lencana Baru Terbuka!
              </div>
              <div className="space-y-2">
                {newBadges.map((badgeId) => {
                  const badge = badgeById(badgeId);
                  if (!badge) return null;
                  return (
                    <div
                      key={badge.id}
                      className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-sun/50 shadow-sm"
                    >
                      <span className="text-3xl">{badge.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-navy text-sm truncate">{badge.name}</div>
                        <div className="text-xs text-ink/80 truncate">{badge.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-2">
            {nextMissionId ? (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  router.push(`/misi/${nextMissionId}`);
                }}
                className="btn-primary w-full text-lg py-3.5 shadow-pop flex items-center justify-center gap-2 cursor-pointer"
              >
                Lanjut Misi Berikutnya 🚀
              </button>
            ) : (
              <Link
                href="/peta"
                onClick={() => soundEngine.playClick()}
                className="btn-primary w-full text-lg py-3.5 shadow-pop flex items-center justify-center gap-2 cursor-pointer"
              >
                Kembali ke Peta Petualangan 🗺️
              </Link>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onRetry();
                }}
                className="btn-ghost flex-1 border-2 border-navy/15 text-navy hover:bg-peach/30 font-bold py-2.5 text-sm rounded-xl cursor-pointer"
              >
                Ulangi Misi 🔄
              </button>
              <Link
                href="/peta"
                onClick={() => soundEngine.playClick()}
                className="btn-ghost flex-1 border-2 border-navy/15 text-navy hover:bg-peach/30 font-bold py-2.5 text-sm rounded-xl flex items-center justify-center cursor-pointer"
              >
                Peta 🗺️
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

