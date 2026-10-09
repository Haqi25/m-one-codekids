import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export const metadata = {
  title: "Kebijakan Privasi | CodeKids",
  description: "Kebijakan Privasi platform belajar CodeKids sesuai dengan UU PDP.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-peach">
      <header className="bg-white border-b-2 border-navy/10 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center">
          <Link href="/" aria-label="Beranda CodeKids" className="hover:-translate-y-0.5 transition-transform">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="flex-1 py-12 px-6">
        <div className="max-w-4xl mx-auto card p-8 md:p-12">
          <h1 className="text-4xl font-black text-navy mb-8">Kebijakan Privasi CodeKids</h1>
          
          <div className="space-y-8 font-bold text-navy-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-black text-navy mb-4">1. Komitmen Kami untuk Anak</h2>
              <p>
                Di CodeKids, keamanan dan privasi anak adalah prioritas utama kami. Kami merancang platform ini dengan prinsip <strong>minimalisasi data</strong>. Kami tidak meminta, menyimpan, atau melacak informasi pribadi yang tidak perlu.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-navy mb-4">2. Data yang Kami Kumpulkan</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Akun Orang Tua/Guru:</strong> Email, nama, dan kata sandi untuk keperluan mengelola akun anak.</li>
                <li><strong>Akun Anak:</strong> Hanya nama panggilan (nickname), avatar, dan tingkat kelas. Kami <strong>tidak</strong> meminta alamat email anak.</li>
                <li><strong>Aktivitas Belajar:</strong> Progres level, blok kode yang digunakan, dan waktu penyelesaian misi untuk ditampilkan di Dashboard Orang Tua.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-navy mb-4">3. Persetujuan Orang Tua & Kepatuhan UU PDP</h2>
              <p>
                Pembuatan akun anak harus dilakukan melalui akun Orang Tua atau Guru (Parental Consent). CodeKids mematuhi <strong>Undang-Undang Pelindungan Data Pribadi (UU PDP) Indonesia</strong>. Orang tua memiliki kontrol penuh untuk:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Melihat data aktivitas anak.</li>
                <li>Mengunduh (export) data belajar anak.</li>
                <li>Menghapus akun anak beserta seluruh datanya kapan saja.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-navy mb-4">4. Bagaimana dengan Bibi AI?</h2>
              <p>
                Bibi AI adalah asisten belajar yang aman. Kami tidak menggunakan percakapan anak untuk melatih model AI publik. 
                Sistem kami secara otomatis <strong>menyensor (redact)</strong> informasi yang menyerupai data pribadi (seperti nama lengkap, alamat, atau nomor telepon) sebelum diproses oleh AI. Percakapan tidak disimpan secara permanen setelah dirangkum menjadi laporan untuk orang tua.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-navy mb-4">5. Penggunaan Cookies</h2>
              <p>
                CodeKids hanya menggunakan cookies yang sangat penting (Essential Cookies) untuk menjaga sesi login tetap aktif (Session Cookies). Kami <strong>tidak menggunakan cookies pelacak (tracking cookies)</strong> pihak ketiga dan platform kami 100% bebas dari iklan.
              </p>
            </section>

            <div className="pt-8 border-t-2 border-navy/10">
              <Link href="/" className="btn-ghost inline-flex">
                &larr; Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-navy text-white py-6 text-center text-sm font-bold">
        <p>© 2026 CodeKids. Dibuat untuk M-ONE Telkomsel Coding Competition.</p>
      </footer>
    </div>
  );
}

