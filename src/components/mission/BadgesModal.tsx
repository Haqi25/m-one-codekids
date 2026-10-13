"use client";

import { useState } from "react";
import { BADGES } from "@/lib/missions/gamification";
import { BibiMascot } from "@/components/brand/BibiMascot";
import { soundEngine } from "@/lib/audio";

interface BadgesModalProps {
  userBadgeIds: string[];
}

export function BadgesModalButton({ userBadgeIds }: BadgesModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unlockedSet = new Set(userBadgeIds);
  const total = BADGES.length;
  const count = unlockedSet.size;

  const handleOpen = () => {
    soundEngine.playClick();
    setIsOpen(true);
  };

  const handleClose = () => {
    soundEngine.playClick();
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="bg-sun/20 hover:bg-sun/30 border border-sun/40 text-sun px-3.5 py-1.5 rounded-full font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-sm text-sm"
        title="Buka Koleksi Lencana"
      >
        <span>🎖️</span>
        <span className="hidden sm:inline">Lencana:</span>
        <span className="bg-sun text-navy text-xs px-2 py-0.5 rounded-full font-extrabold">
          {count}/{total}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-xl w-full text-navy shadow-2xl border-4 border-sun/40 animate-pop-in my-auto relative">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-peach pb-4 mb-4">
              <div className="flex items-center gap-3">
                <BibiMascot className="w-14 h-14 shrink-0" mood="cheer" />
                <div className="text-left">
                  <h2 className="text-2xl font-display font-bold text-navy">
                    Koleksi Lencana 🎖️
                  </h2>
                  <p className="text-xs sm:text-sm text-ink/80 font-medium">
                    Kamu telah mengumpulkan <strong>{count} dari {total}</strong> lencana petualangan!
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="btn-ghost !min-h-8 w-8 h-8 rounded-full flex items-center justify-center text-ink/70 hover:text-navy text-lg p-0"
              >
                ✕
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="w-full bg-peach/40 h-3 rounded-full overflow-hidden border border-peach">
                <div
                  className="bg-sun h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((count / total) * 100)}%` }}
                />
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
              {BADGES.map((b) => {
                const isUnlocked = unlockedSet.has(b.id);
                return (
                  <div
                    key={b.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                      isUnlocked
                        ? "bg-amber-50/70 border-sun shadow-sm"
                        : "bg-slate-50 border-slate-200 opacity-60"
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-inner ${
                        isUnlocked
                          ? "bg-sun/30 border border-sun animate-bounce-soft"
                          : "bg-slate-200 border border-slate-300 grayscale"
                      }`}
                    >
                      {b.emoji}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-navy text-sm truncate">{b.name}</span>
                        {isUnlocked ? (
                          <span className="text-[10px] bg-leaf-100 text-leaf-700 font-extrabold px-1.5 py-0.5 rounded-md">
                            ✓
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-200 text-slate-600 font-extrabold px-1.5 py-0.5 rounded-md">
                            🔒
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink/80 leading-snug mt-0.5">{b.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer encouragement & close */}
            <div className="mt-6 pt-4 border-t border-peach flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-ink/70 text-left italic">
                💡 Selesaikan misi tanpa petunjuk dan kumpulkan bintang untuk membuka lencana rahasia!
              </p>
              <button
                onClick={handleClose}
                className="btn-primary w-full sm:w-auto px-6 py-2.5 text-sm"
              >
                Keren, Tutup! ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

