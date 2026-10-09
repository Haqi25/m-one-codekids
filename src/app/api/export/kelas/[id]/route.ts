import { requireAdult } from "@/lib/session";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdult();
  if (user.role !== "TEACHER") return new NextResponse("Akses ditolak", { status: 403 });

  const cls = await db.class.findUnique({
    where: { id },
    include: {
      students: {
        include: {
          progress: true,
          attempts: true,
        }
      }
    }
  });

  if (!cls || cls.teacherId !== user.id) return new NextResponse("Akses ditolak atau tidak ditemukan", { status: 404 });

  // Generate CSV
  let csv = "ID Siswa,Nama,Avatar,Kelas,Total Bintang,Total Misi Selesai,Total Percobaan,Terakhir Aktif\n";

  for (const student of cls.students) {
    const stars = student.progress.reduce((s, p) => s + p.stars, 0);
    const completed = student.progress.filter(p => p.completed).length;
    const attempts = student.attempts.length;
    const lastActive = student.lastActiveAt ? student.lastActiveAt.toISOString() : "Belum pernah";
    
    csv += `"${student.id}","${student.nickname}","${student.avatar}",${student.grade},${stars},${completed},${attempts},"${lastActive}"\n`;
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="data_kelas_${cls.name.replace(/\s+/g, '_')}.csv"`,
    },
  });
}
