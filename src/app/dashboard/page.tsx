import { requireAdult } from "@/lib/session";
import { db } from "@/lib/db";
import Link from "next/link";
import { totals, rankFor } from "@/lib/missions/gamification";
import ParentDashboardForm from "@/components/dashboard/ParentDashboardForm";
import TeacherDashboardForm from "@/components/dashboard/TeacherDashboardForm";

export default async function DashboardPage() {
  const user = await requireAdult();

  if (user.role === "PARENT") {
    const children = await db.childProfile.findMany({
      where: { parentId: user.id },
      include: {
        progress: true,
        attempts: {
          where: {
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        }
      }
    });

    return (
      <div className="space-y-8">
        <div className="card bg-navy text-white p-6">
          <h2 className="text-xl font-display mb-2">Kode Keluarga Anda</h2>
          <div className="text-4xl font-mono tracking-widest text-sun font-bold mb-4">
            {user.familyCode}
          </div>
          <p className="text-white/80">
            Instruksi: Anak membuka halaman <strong>/masuk</strong> di perangkatnya, memasukkan Kode Keluarga ini, memilih avatarnya, dan memasukkan PIN 4 angka mereka.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display text-navy">Anak-anak</h2>
          <ParentDashboardForm />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map(child => {
            const stats = totals(child.progress);
            const rank = rankFor(stats.stars);
            const weeklyTime = child.attempts.reduce((sum, a) => sum + a.durationSec, 0);
            
            return (
              <Link key={child.id} href={`/dashboard/anak/${child.id}`} className="card hover:shadow-lg transition-shadow block">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl">{child.avatar}</div>
                  <div>
                    <h3 className="font-bold text-lg text-navy">{child.nickname}</h3>
                    <div className="text-sm text-ink font-medium">Kelas {child.grade}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-peach/30 p-2 rounded">
                    <div className="text-ink/70">Bintang</div>
                    <div className="font-bold text-orange-700">⭐ {stats.stars}</div>
                  </div>
                  <div className="bg-peach/30 p-2 rounded">
                    <div className="text-ink/70">Skor</div>
                    <div className="font-bold text-leaf-700">🏆 {stats.score}</div>
                  </div>
                  <div className="bg-peach/30 p-2 rounded">
                    <div className="text-ink/70">Peringkat</div>
                    <div className="font-bold text-navy">{rank.title}</div>
                  </div>
                  <div className="bg-peach/30 p-2 rounded">
                    <div className="text-ink/70">Waktu (7 hr)</div>
                    <div className="font-bold text-navy">{Math.round(weeklyTime / 60)} mnt</div>
                  </div>
                </div>
              </Link>
            )
          })}
          {children.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-sm text-ink border border-dashed border-peach">
              Belum ada anak yang ditambahkan.
            </div>
          )}
        </div>
      </div>
    );
  } else {
    // TEACHER
    const classes = await db.class.findMany({
      where: { teacherId: user.id },
      include: {
        _count: { select: { students: true } }
      }
    });

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display text-navy">Kelas Anda</h2>
          <TeacherDashboardForm />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map(cls => (
            <Link key={cls.id} href={`/dashboard/kelas/${cls.id}`} className="card hover:shadow-lg transition-shadow block">
              <h3 className="font-bold text-xl text-navy mb-2">{cls.name}</h3>
              <div className="text-ink mb-4">Kode Kelas: <span className="font-mono bg-peach/50 px-2 py-1 rounded font-bold text-navy">{cls.code}</span></div>
              <div className="text-sm bg-peach/30 p-2 rounded inline-block text-navy font-medium">
                {cls._count.students} Siswa
              </div>
            </Link>
          ))}
          {classes.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-sm text-ink border border-dashed border-peach">
              Belum ada kelas yang dibuat.
            </div>
          )}
        </div>
      </div>
    );
  }
}
