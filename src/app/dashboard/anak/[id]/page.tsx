import { requireAdult, adultCanAccessChild } from "@/lib/session";
import { db } from "@/lib/db";
import { totals, rankFor, conceptMastery, BADGES } from "@/lib/missions/gamification";
import { MISSIONS, getMission } from "@/content/missions";
import { notFound } from "next/navigation";
import ActivityChart from "@/components/dashboard/ActivityChart";
import ChildSettings from "@/components/dashboard/ChildSettings";
import Link from "next/link";

export default async function AnakDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdult();
  const access = await adultCanAccessChild(user.id, id);
  if (!access) notFound();

  const child = await db.childProfile.findUnique({
    where: { id },
    include: {
      progress: true,
      attempts: {
        where: { createdAt: { gte: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) } }
      },
      chats: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!child) notFound();

  const isParent = child.parentId === user.id;
  const stats = totals(child.progress);
  const rank = rankFor(stats.stars);

  const attempts7d = child.attempts.filter(a => a.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const weeklyTime = attempts7d.reduce((sum, a) => sum + a.durationSec, 0);

  const concepts = ["Sequencing", "Looping", "IF-ELSE"] as const;

  const chatByMission = child.chats.reduce((acc, chat) => {
    if (!acc[chat.missionId]) acc[chat.missionId] = { count: 0, flags: 0, hints: new Set() };
    if (chat.role === "child") acc[chat.missionId].count++;
    if (chat.flagged) acc[chat.missionId].flags++;
    if (chat.hintLevel > 0) acc[chat.missionId].hints.add(chat.hintLevel);
    return acc;
  }, {} as Record<string, { count: number; flags: number; hints: Set<number> }>);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-peach pb-4">
        <Link href={isParent ? "/dashboard" : `/dashboard/kelas/${child.classId}`} className="btn-ghost px-2">← Kembali</Link>
        <div className="text-5xl">{child.avatar}</div>
        <div>
          <h1 className="text-3xl font-display text-navy">{child.nickname}</h1>
          <div className="text-ink">Kelas {child.grade}</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card text-center py-4">
          <div className="text-sm text-ink mb-1">Bintang</div>
          <div className="text-2xl font-bold text-orange-700">⭐ {stats.stars}</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-sm text-ink mb-1">Skor Total</div>
          <div className="text-2xl font-bold text-leaf-700">🏆 {stats.score}</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-sm text-ink mb-1">Level Saat Ini</div>
          <div className="text-2xl font-bold text-navy">{Math.max(1, ...child.progress.filter(p => p.completed).map(p => {
            const m = getMission(p.missionId);
            return m ? m.level : 1;
          }), 1)}</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-sm text-ink mb-1">Peringkat</div>
          <div className="text-2xl font-bold text-navy">{rank.title}</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-sm text-ink mb-1">Waktu (7 Hari)</div>
          <div className="text-2xl font-bold text-navy">{Math.round(weeklyTime / 60)} mnt</div>
        </div>
      </div>

      {/* Concept Mastery */}
      <div className="card">
        <h2 className="text-xl font-display text-navy mb-4">Penguasaan Konsep</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {concepts.map(concept => {
            const level = conceptMastery(concept as any, child.progress, child.attempts);
            let label = "Belum Mulai";
            let icon = "⚪";
            if (level === "mastered") { label = "Sudah Paham"; icon = "✅"; }
            else if (level === "learning") { label = "Sedang Belajar"; icon = "⏳"; }
            else if (level === "struggling") { label = "Perlu Bantuan"; icon = "⚠️"; }
            
            return (
              <div key={concept} className="bg-peach/30 p-4 rounded-xl flex items-center gap-3">
                <div className="text-2xl">{icon}</div>
                <div>
                  <div className="font-bold text-navy">{concept}</div>
                  <div className="text-sm text-ink">{label}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Activity Chart */}
      <div className="card">
        <h2 className="text-xl font-display text-navy mb-4">Aktivitas (4 Minggu Terakhir)</h2>
        <ActivityChart attempts={child.attempts} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Progress Table */}
        <div className="card">
          <h2 className="text-xl font-display text-navy mb-4">Status Misi</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-peach">
                  <th className="py-2 text-ink font-medium">Misi</th>
                  <th className="py-2 text-ink font-medium">Status</th>
                  <th className="py-2 text-ink font-medium">Bintang</th>
                  <th className="py-2 text-ink font-medium">Percobaan</th>
                </tr>
              </thead>
              <tbody>
                {child.progress.map(p => {
                  const m = getMission(p.missionId);
                  if (!m) return null;
                  return (
                    <tr key={p.id} className="border-b border-peach/50">
                      <td className="py-2">{m.title} (Lvl {m.level})</td>
                      <td className="py-2">{p.completed ? "✅ Selesai" : "⏳ Sedang"}</td>
                      <td className="py-2 text-orange-700">⭐ {p.stars}</td>
                      <td className="py-2">{p.attempts}x ({p.hintsUsed} hint)</td>
                    </tr>
                  )
                })}
                {child.progress.length === 0 && (
                  <tr><td colSpan={4} className="py-4 text-center text-ink">Belum ada misi yang dikerjakan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chat History */}
        <div className="card">
          <h2 className="text-xl font-display text-navy mb-4">Riwayat Tanya Bibi</h2>
          <div className="space-y-4">
            {Object.entries(chatByMission).map(([missionId, info]) => {
              const m = getMission(missionId);
              return (
                <div key={missionId} className="bg-peach/30 p-3 rounded-xl text-sm">
                  <div className="font-bold text-navy mb-1">{m ? m.title : missionId}</div>
                  <div className="text-ink">{info.count} pertanyaan diajukan.</div>
                  {info.hints.size > 0 && <div className="text-ink">Mencapai level hint: {Array.from(info.hints).sort().join(", ")}.</div>}
                  {info.flags > 0 && <div className="text-orange-700 font-medium mt-1">⚠️ Terdapat pesan yang diflag ({info.flags})</div>}
                </div>
              );
            })}
            {Object.keys(chatByMission).length === 0 && (
              <div className="text-center text-ink py-4">Belum ada riwayat percakapan.</div>
            )}
          </div>
        </div>
      </div>

      {/* Settings (Parent only) */}
      {(isParent || user.role === "TEACHER") && (
        <div className="card bg-white border-2 border-orange/20">
          <h2 className="text-xl font-display text-navy mb-4">Pengaturan & Data</h2>
          <ChildSettings child={child} isParent={isParent} />
        </div>
      )}
    </div>
  );
}
