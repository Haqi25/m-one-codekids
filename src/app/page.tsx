import Link from "next/link";
import { LEVELS } from "@/content/missions";
import { BibiMascot } from "@/components/brand/BibiMascot";
import { Logo } from "@/components/brand/Logo";
import { BibiDemo } from "@/components/landing/BibiDemo";

export const metadata = {
  title: "CodeKids | Belajar Coding Seru untuk Anak-anak",
  description: "Platform belajar coding interaktif untuk anak Indonesia, ditemani oleh Bibi AI.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-peach">
      <header className="sticky top-0 z-50 bg-peach/90 backdrop-blur-md border-b-2 border-navy/10 py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="hover:-translate-y-0.5 transition-transform">
            <Logo />
          </div>
          <nav className="hidden md:flex items-center gap-6 font-bold text-navy">
            <Link href="#cara-belajar" className="hover:text-cta transition-colors">Cara Belajar</Link>
            <Link href="#bibi" className="hover:text-cta transition-colors">Bibi AI</Link>
            <Link href="#orang-tua" className="hover:text-cta transition-colors">Orang Tua / Guru</Link>
          </nav>
          <Link href="/akun/masuk" className="btn-ghost text-sm py-2 min-h-0 hidden md:inline-flex">
            Masuk
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Hero Section */}
        <section className="relative px-6 py-16 md:py-24 max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center gap-12">
          {/* Decorative floating elements */}
          <div className="absolute top-10 left-10 text-4xl animate-float" style={{ animationDelay: '0s' }}>✨</div>
          <div className="absolute bottom-20 right-10 text-5xl animate-float" style={{ animationDelay: '1.5s' }}>🚀</div>
          <div className="absolute top-1/4 right-1/4 text-3xl animate-float" style={{ animationDelay: '0.7s' }}>🧩</div>

          <div className="flex-1 space-y-6 text-center md:text-left z-10">
            <h1 className="text-5xl md:text-6xl font-black text-navy leading-tight">
              Belajar Coding <br/>
              <span className="text-cta inline-block animate-wiggle">Lebih Seru!</span>
            </h1>
            <p className="text-xl md:text-2xl text-navy-700 font-bold max-w-xl mx-auto md:mx-0">
              Petualangan belajar pemrograman untuk anak-anak Indonesia, dibantu oleh teman AI yang pintar dan ramah.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center md:justify-start">
              <Link href="/masuk" className="btn-primary w-full sm:w-auto text-lg animate-pop-in">
                Mulai Petualangan 🚀
              </Link>
              <Link href="/akun/daftar" className="btn-ghost w-full sm:w-auto animate-pop-in" style={{ animationDelay: '0.1s' }}>
                Untuk Orang Tua/Guru
              </Link>
            </div>
          </div>

          <div className="flex-1 relative flex justify-center mt-10 md:mt-0 z-10">
            <div className="w-72 h-72 md:w-96 md:h-96 bg-sun rounded-full absolute -z-10 shadow-pop animate-float"></div>
            <BibiMascot mood="cheer" className="w-80 md:w-[400px] h-auto drop-shadow-2xl animate-pop-in" />
          </div>
        </section>

        {/* Cara Belajar Section */}
        <section id="cara-belajar" className="py-20 px-6 bg-white relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-navy mb-4">Petualangan Belajar Kita</h2>
              <p className="text-xl font-bold text-navy-700">Tiga tahap seru dengan materi yang terhubung pelajaran sekolah!</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {LEVELS.map((level, idx) => (
                <div key={level.level} className="card p-8 group hover:-translate-y-2 transition-transform duration-300">
                  <div 
                    className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-pop transform group-hover:scale-110 group-hover:rotate-6 transition-all"
                    style={{ backgroundColor: level.color, color: 'white' }}
                  >
                    {level.emoji}
                  </div>
                  <h3 className="text-2xl font-black text-navy mb-2">Level {level.level}: {level.title}</h3>
                  <p className="font-bold text-navy-300 mb-4">{level.subtitle}</p>
                  
                  <div className="mt-6 border-t-2 border-navy/10 pt-4">
                    <p className="text-sm font-bold text-navy mb-2">Kurikulum Terkait:</p>
                    <ul className="text-sm font-bold text-navy-700 space-y-1">
                      {level.level === 1 && (
                        <>
                          <li>🌱 IPA: Siklus air, tumbuh kembang tanaman</li>
                          <li>➕ Matematika: Penjumlahan bersusun</li>
                        </>
                      )}
                      {level.level === 2 && (
                        <>
                          <li>✖️ Matematika: Perkalian, pola bilangan</li>
                          <li>❤️ IPA: Detak jantung, fase bulan</li>
                        </>
                      )}
                      {level.level === 3 && (
                        <>
                          <li>🔢 Matematika: Angka genap/ganjil</li>
                          <li>🌊 IPA: Terapung/tenggelam, hewan herbivora/karnivora</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bibi AI Section */}
        <section id="bibi" className="py-20 px-6 bg-sky/10 relative overflow-hidden">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl font-black text-navy">Kenalan dengan Bibi AI 🤖</h2>
              <p className="text-xl font-bold text-navy-700">
                Bibi bukan AI yang sekadar memberi jawaban instan. Bibi adalah teman belajar yang dirancang khusus untuk anak-anak!
              </p>
              <ul className="space-y-4 font-bold text-navy-700">
                <li className="flex gap-3 items-start">
                  <span className="text-xl">✅</span>
                  <div>
                    <strong className="text-navy">Tiga Tingkat Bantuan:</strong> Dari pertanyaan pemandu, analogi, hingga petunjuk spesifik blok yang dipakai.
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-xl">✅</span>
                  <div>
                    <strong className="text-navy">Pantang Memberi Jawaban Penuh:</strong> Bibi melatih anak berpikir kritis dan mandiri memecahkan masalah.
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-xl">✅</span>
                  <div>
                    <strong className="text-navy">Aman untuk Anak:</strong> Filter AI ketat untuk memastikan bahasa selalu positif dan ramah.
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="flex-1 w-full relative">
              <BibiDemo />
            </div>
          </div>
        </section>

        {/* Orang Tua Section */}
        <section id="orang-tua" className="py-20 px-6 bg-leaf/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-navy mb-4">Tenang untuk Orang Tua & Guru</h2>
              <p className="text-xl font-bold text-navy-700 max-w-2xl mx-auto">
                Kami peduli pada keamanan dan perkembangan anak Anda.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Static Mock Dashboard */}
              <div className="flex-1 w-full">
                <div className="card p-6 bg-white rotate-1 hover:rotate-0 transition-transform">
                  <div className="flex items-center gap-4 border-b-2 border-navy/10 pb-4 mb-4">
                    <div className="w-12 h-12 bg-sky rounded-full flex items-center justify-center text-white text-xl font-bold">A</div>
                    <div>
                      <h4 className="font-black text-navy text-lg">Dashboard Anak: Andi</h4>
                      <p className="text-sm font-bold text-navy-300">Level 2 (Looping)</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-bold text-navy mb-2">Pemahaman Konsep:</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="chip bg-leaf/20 text-leaf-700">✅ Sequencing (Sudah Paham)</span>
                        <span className="chip bg-sun/40 text-orange-700">⏳ Looping (Sedang Belajar)</span>
                        <span className="chip bg-berry/20 text-berry">🚩 IF-ELSE (Perlu Bantuan)</span>
                      </div>
                    </div>
                    
                    <div className="bg-peach-200 p-4 rounded-2xl">
                      <p className="text-sm font-bold text-navy mb-2">Aktivitas Minggu Ini</p>
                      <div className="flex items-end gap-2 h-20">
                        <div className="w-8 bg-sky rounded-t-md h-[40%]"></div>
                        <div className="w-8 bg-sky rounded-t-md h-[70%]"></div>
                        <div className="w-8 bg-sky rounded-t-md h-[20%]"></div>
                        <div className="w-8 bg-cta rounded-t-md h-[90%]"></div>
                        <div className="w-8 bg-sky rounded-t-md h-[50%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="card p-6 flex gap-4 items-start">
                  <div className="text-3xl">🛡️</div>
                  <div>
                    <h3 className="font-black text-navy text-lg">Keamanan Data (UU PDP)</h3>
                    <p className="font-bold text-navy-700 text-sm">Tidak ada email anak yang disimpan. Hanya nama panggilan, avatar, dan kelas. Persetujuan orang tua diutamakan. Tanpa iklan sama sekali.</p>
                  </div>
                </div>
                
                <div className="card p-6 flex gap-4 items-start">
                  <div className="text-3xl">📊</div>
                  <div>
                    <h3 className="font-black text-navy text-lg">Pantau Perkembangan</h3>
                    <p className="font-bold text-navy-700 text-sm">Dashboard khusus untuk melihat aktivitas, tingkat pemahaman, dan bantuan Bibi AI yang digunakan anak.</p>
                  </div>
                </div>

                <div className="card p-6 flex gap-4 items-start">
                  <div className="text-3xl">🧠</div>
                  <div>
                    <h3 className="font-black text-navy text-lg">Laporan AI Aman</h3>
                    <p className="font-bold text-navy-700 text-sm">Bibi AI tidak menyimpan riwayat chat secara permanen setelah dirangkum, dan data personal disensor oleh sistem secara otomatis.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-navy text-white py-12 px-6 border-t-4 border-cta">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <div>
            <div className="text-white brightness-0 invert inline-block">
              <Logo />
            </div>
            <p className="mt-4 font-bold text-navy-300 max-w-sm">
              CodeKids mengajarkan logika pemrograman dengan cara yang menyenangkan, aman, dan disesuaikan untuk anak-anak.
            </p>
          </div>
          <div className="flex flex-col md:items-end space-y-2 font-bold text-navy-300">
            <Link href="/privasi" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
            <p>Kontak: <a href="mailto:halo@codekids.id" className="text-white hover:text-cta transition-colors">halo@codekids.id</a></p>
            <p className="mt-4 text-sm bg-navy-700 px-4 py-2 rounded-lg inline-block border border-navy-300/30">
              🏆 Dibuat untuk M-ONE Telkomsel Coding Competition, tema Web Education for Kids
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

