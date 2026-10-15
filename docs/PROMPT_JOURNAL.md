# 📝 Jurnal Prompt Utama (Prompt Journal) - CodeKids

Dokumen ini berisi kurasi instruksi (*prompts*) utama yang diberikan kepada AI Agent (Antigravity) selama proses pengembangan proyek **CodeKids** untuk M-ONE Telkomsel Competition.

## 1. Pembuatan Dokumen Perencanaan (PRD)
**Tujuan:** Mendefinisikan arsitektur proyek, fitur utama, dan batasan teknologi sebelum memulai *coding*.
> **Prompt yang digunakan:**
> "Tolong buatkan dokumen Product Requirements Document (PRD) yang komprehensif untuk web edukasi coding anak SD bernama 'CodeKids'. Tech stack yang akan digunakan adalah Next.js (App Router), Tailwind CSS, SQLite + Prisma, dan Auth custom (bcrypt). Fitur utamanya mencakup 3 level misi coding block (Sequencing, Looping, IF-ELSE), fitur bantuan 'Tanya Bibi AI' menggunakan Gemini API, dan Dashboard untuk Orang Tua/Guru memantau progres."

## 2. Inisialisasi Proyek & Setup Database MVP
**Tujuan:** Membangun fondasi *backend* dan *database* yang cepat dan stabil untuk keperluan MVP.
> **Prompt yang digunakan:**
> "Mari kita fokus ke kecepatan dan langsung buat MVP-nya bisa berjalan di lokal. Gunakan SQLite lokal via Prisma dan buat custom auth sederhana dengan bcrypt. Tolong buatkan skema Prisma (`schema.prisma`) yang mencakup model User, Mission, dan UserProgress untuk mencatat skor dan perolehan bintang dari 3 level misi."

## 3. Implementasi Fitur Utama & Gemini API (Tanya Bibi AI)
**Tujuan:** Mengintegrasikan AI sebagai asisten virtual yang membimbing anak-anak tanpa memberikan jawaban langsung.
> **Prompt yang digunakan:**
> "Sekarang buatkan integrasi dengan Gemini API untuk fitur 'Tanya Bibi AI'. Buat API route di Next.js yang menerima prompt dari *user* saat mereka kesulitan di level tertentu. Berikan *system prompt* khusus ke Gemini agar bertindak sebagai guru yang ramah untuk anak SD, gunakan analogi yang mudah dipahami, dan yang paling penting: jangan pernah memberikan jawaban langsung atau kode solusi, cukup berikan petunjuk (*hint*)."

## 4. Proses Debugging & Optimasi
**Tujuan:** Menunjukkan proses kolaborasi dengan AI dalam menyelesaikan *error* atau penyempurnaan UI.
> **Prompt yang digunakan:**
> "[Masukkan salah satu prompt saat kamu minta tolong AI memperbaiki error, misalnya: 'Tolong perbaiki error saat menyimpan skor di level Looping. Pesan errornya PrismaClientValidationError. Pastikan tipe data skor adalah integer dan relasi UserProgress terhubung dengan benar.']"

---
*Catatan: Log percakapan mentah secara keseluruhan dapat dilihat di folder `RAW_AI_LOGS/`.*