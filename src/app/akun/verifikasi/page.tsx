import { db } from "@/lib/db";
import Link from "next/link";

export default async function VerifikasiPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-display text-navy mb-2">Verifikasi Email</h1>
        <div className="bg-orange-100 text-orange-700 p-4 rounded-lg text-sm">
          Token verifikasi tidak ditemukan.
        </div>
        <Link href="/akun/masuk" className="btn-primary w-full">
          Kembali ke Halaman Masuk
        </Link>
      </div>
    );
  }

  const user = await db.user.findFirst({ where: { verificationToken: token } });

  if (!user) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-display text-navy mb-2">Verifikasi Gagal</h1>
        <div className="bg-orange-100 text-orange-700 p-4 rounded-lg text-sm">
          Token verifikasi tidak valid atau sudah digunakan.
        </div>
        <Link href="/akun/masuk" className="btn-primary w-full">
          Kembali ke Halaman Masuk
        </Link>
      </div>
    );
  }

  // Update user as verified
  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null,
    },
  });

  return (
    <div className="space-y-6 text-center">
      <h1 className="text-2xl font-display text-navy mb-2">Verifikasi Berhasil! 🎊</h1>
      <div className="bg-leaf-100/50 text-leaf-700 p-4 rounded-lg text-sm border-2 border-leaf-700/20 font-bold">
        Email Anda telah berhasil diverifikasi. Anda sekarang dapat masuk ke akun Anda.
      </div>
      <Link href="/akun/masuk" className="btn-primary w-full">
        Masuk Sekarang
      </Link>
    </div>
  );
}

