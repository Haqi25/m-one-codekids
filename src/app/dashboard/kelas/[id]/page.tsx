import { requireAdult } from "@/lib/session";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import TeacherAddStudentForm from "@/components/dashboard/TeacherAddStudentForm";

export default async function KelasDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdult();
  if (user.role !== "TEACHER") notFound();

  const cls = await db.class.findUnique({
    where: { id },
    include: {
      students: {
        include: {
          progress: true,
          attempts: {
            where: { createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } }
          }
        }
      }
    }
  });

  if (!cls || cls.teacherId !== user.id) notFound();

  // Sort and filter are usually done on client, but for simplicity here we render the table and could add basic JS filtering.
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-peach pb-4">
        <Link href="/dashboard" className="btn-ghost px-2">← Kembali</Link>
        <div>
          <h1 className="text-3xl font-display text-navy">{cls.name}</h1>
          <div className="text-ink mt-1">Kode Kelas: <span className="font-mono bg-peach/50 px-2 py-1 rounded font-bold">{cls.code}</span></div>
        </div>
      </div>

      <div className="card bg-navy text-white">
        <h2 className="text-xl font-display mb-2">Instruksi Siswa</h2>
        <p className="text-white/80">
          Siswa dapat membuka halaman <strong>/masuk</strong>, memilih opsi <strong>Kode Kelas</strong>, lalu memasukkan kode <strong className="text-sun tracking-widest">{cls.code}</strong>.
          Mereka dapat memilih nama mereka dan memasukkan PIN, atau mendaftar sebagai siswa baru di kelas ini.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display text-navy">Daftar Siswa ({cls.students.length})</h2>
        <div className="flex gap-2">
          <a href={`/api/export/kelas/${cls.id}`} className="btn-ghost border border-peach text-sm">Export CSV</a>
          <TeacherAddStudentForm classId={cls.id} />
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-peach">
                <th className="py-3 px-2 text-ink font-medium">Nama</th>
                <th className="py-3 px-2 text-ink font-medium">Bintang</th>
                <th className="py-3 px-2 text-ink font-medium">Status</th>
                <th className="py-3 px-2 text-ink font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cls.students.map(student => {
                const stars = student.progress.reduce((s, p) => s + p.stars, 0);
                
                const attempts7d = student.attempts.filter(a => a.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
                const inactive = attempts7d.length === 0;

                const fails14d = student.attempts.filter(a => !a.success).length;
                const total14d = student.attempts.length;
                const struggling = total14d >= 6 && (fails14d / total14d) > 0.75;

                return (
                  <tr key={student.id} className="border-b border-peach/30 hover:bg-peach/10">
                    <td className="py-3 px-2 flex items-center gap-2">
                      <span className="text-2xl">{student.avatar}</span>
                      <span className="font-bold text-navy">{student.nickname}</span>
                    </td>
                    <td className="py-3 px-2 text-orange-700 font-bold">⭐ {stars}</td>
                    <td className="py-3 px-2 space-y-1">
                      {inactive && <div className="text-xs bg-peach text-ink px-2 py-1 rounded-full inline-block">Tidak aktif</div>}
                      {struggling && <div className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full inline-block">Perlu bantuan</div>}
                      {!inactive && !struggling && <div className="text-xs bg-leaf-100 text-leaf-700 px-2 py-1 rounded-full inline-block">Aktif</div>}
                    </td>
                    <td className="py-3 px-2">
                      <Link href={`/dashboard/anak/${student.id}`} className="text-navy font-bold hover:underline">Detail</Link>
                    </td>
                  </tr>
                )
              })}
              {cls.students.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-ink">Belum ada siswa di kelas ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
