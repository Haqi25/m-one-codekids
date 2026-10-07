// Mission content as structured data (FR-MISI-12). Add a mission by appending an object here.
// Coordinates: x = column (0 = left), y = row (0 = top).

import type { Block, Dir, LevelInfo, Mission } from "@/lib/missions/types";

let seq = 0;
const nid = () => `s${++seq}`;
const mv = (dir: Dir): Block => ({ id: nid(), type: "move", dir });
const rep = (times: number, body: Block[]): Block => ({ id: nid(), type: "repeat", times, body });
const iff = (cond: string, then: Block[], els: Block[]): Block => ({ id: nid(), type: "if", cond, then, else: els });
const put = (box: string): Block => ({ id: nid(), type: "put", box });
const R = () => mv("right");
const L = () => mv("left");
const U = () => mv("up");
const D = () => mv("down");

const MOVES = [
  { type: "move", dir: "up" },
  { type: "move", dir: "down" },
  { type: "move", dir: "left" },
  { type: "move", dir: "right" },
] as const;

export const LEVELS: LevelInfo[] = [
  {
    level: 1,
    concept: "sequencing",
    title: "Urutan Langkah",
    subtitle: "Sequencing: susun langkah satu per satu",
    emoji: "👣",
    color: "#FF8A2B",
  },
  {
    level: 2,
    concept: "looping",
    title: "Ulangi Lagi!",
    subtitle: "Looping: pakai blok Ulangi biar hemat",
    emoji: "🔁",
    color: "#2BB673",
  },
  {
    level: 3,
    concept: "conditional",
    title: "Jika... Maka...",
    subtitle: "Kondisional: pilih jalan sesuai syarat",
    emoji: "🔀",
    color: "#4C6FFF",
  },
];

export const MISSIONS: Mission[] = [
  /* ============================ LEVEL 1 ============================ */
  {
    id: "l1-m1",
    level: 1,
    order: 1,
    title: "Ayo Pulang!",
    subject: "Logika",
    story: "Hari sudah sore dan kamu ingin pulang. Rumahmu ada di sebelah kanan!",
    goal: "Pergi ke 🏠 Rumah.",
    board: {
      kind: "grid",
      width: 5,
      height: 3,
      start: { x: 0, y: 1 },
      goal: { x: 3, y: 1, emoji: "🏠", label: "Rumah" },
      walls: [
        { x: 2, y: 0, emoji: "🌳" },
        { x: 4, y: 2, emoji: "🌳" },
      ],
      items: [],
    },
    palette: [...MOVES],
    optimalBlocks: 3,
    hints: [
      "Rumahnya ada di sebelah mana dari kamu? Kiri atau kanan? 🤔",
      "Bayangkan kamu berjalan di trotoar, satu langkah = satu kotak. Hitung ada berapa kotak sampai rumah!",
      "Rumahnya 3 kotak ke kanan. Blok apa yang membuatmu bergerak ke kanan?",
    ],
    solution: [R(), R(), R()],
  },
  {
    id: "l1-m2",
    level: 1,
    order: 2,
    title: "Petualangan Siklus Air",
    subject: "IPA",
    story: "Air di bumi selalu berpetualang! Bantu tetes air melewati Penguapan, Pengembunan, lalu Hujan.",
    goal: "Ambil 💨 → ☁️ → 🌧️ secara berurutan, lalu pergi ke 🌊 Danau.",
    board: {
      kind: "grid",
      width: 5,
      height: 5,
      start: { x: 0, y: 4 },
      goal: { x: 4, y: 4, emoji: "🌊", label: "Danau" },
      walls: [
        { x: 2, y: 3, emoji: "🪨" },
        { x: 3, y: 3, emoji: "🌳" },
      ],
      items: [
        { x: 0, y: 2, emoji: "💨", label: "Penguapan", order: 1 },
        { x: 2, y: 1, emoji: "☁️", label: "Pengembunan", order: 2 },
        { x: 4, y: 1, emoji: "🌧️", label: "Hujan", order: 3 },
      ],
    },
    palette: [...MOVES],
    optimalBlocks: 10,
    hints: [
      "Menurutmu, air naik ke langit dulu atau turun jadi hujan dulu? ☀️",
      "Seperti air yang direbus: uapnya naik dulu, lalu berkumpul jadi awan, baru turun jadi hujan. Langkahmu juga harus berurutan begitu!",
      "Mulailah dengan naik ke 💨 Penguapan di atasmu. Setelah itu, ke mana kamu harus pergi untuk menemui ☁️?",
    ],
    solution: [U(), U(), U(), R(), R(), R(), R(), D(), D(), D()],
  },
  {
    id: "l1-m3",
    level: 1,
    order: 3,
    title: "Tumbuh Kembang Tanaman",
    subject: "IPA",
    story: "Sebutir biji ingin menjadi bunga yang cantik. Kunjungi setiap tahap tumbuhnya sesuai urutan!",
    goal: "Ambil 🌰 Biji → 🌱 Kecambah → 🌿 Tanaman Muda, lalu ke 🌻 Bunga.",
    board: {
      kind: "grid",
      width: 5,
      height: 5,
      start: { x: 0, y: 0 },
      goal: { x: 0, y: 4, emoji: "🌻", label: "Bunga" },
      walls: [
        { x: 1, y: 1, emoji: "🪨" },
        { x: 1, y: 3, emoji: "🌵" },
        { x: 3, y: 3, emoji: "🌵" },
      ],
      items: [
        { x: 2, y: 0, emoji: "🌰", label: "Biji", order: 1 },
        { x: 2, y: 2, emoji: "🌱", label: "Kecambah", order: 2 },
        { x: 0, y: 2, emoji: "🌿", label: "Tanaman Muda", order: 3 },
      ],
    },
    palette: [...MOVES],
    optimalBlocks: 8,
    hints: [
      "Tanaman tumbuh dari apa dulu? Apakah langsung jadi bunga? 🌱",
      "Seperti kamu: dulu bayi, lalu balita, lalu anak-anak. Tanaman juga begitu: biji, kecambah, tanaman muda, lalu bunga!",
      "Hati-hati, jalan lurus ke bawah melewati 🌿 terlalu cepat. Ambil 🌰 di sebelah kanan dulu ya!",
    ],
    solution: [R(), R(), D(), D(), L(), L(), D(), D()],
  },
  {
    id: "l1-m4",
    level: 1,
    order: 4,
    title: "Penjumlahan Bersusun",
    subject: "Matematika",
    story: "Ayo hitung 27 + 35 seperti di buku tulis! Ingat, kita mulai dari satuan di sebelah kanan.",
    goal: "Ambil 1️⃣ Satuan → ☝️ Simpan → 🔟 Puluhan, lalu ke ✅ Jawaban 62.",
    board: {
      kind: "grid",
      width: 5,
      height: 5,
      start: { x: 4, y: 4 },
      goal: { x: 0, y: 0, emoji: "✅", label: "Jawaban 62" },
      walls: [
        { x: 3, y: 1, emoji: "✏️" },
        { x: 1, y: 2, emoji: "📏" },
        { x: 0, y: 3, emoji: "📚" },
      ],
      items: [
        { x: 4, y: 2, emoji: "1️⃣", label: "Satuan: 7 + 5 = 12", order: 1 },
        { x: 2, y: 2, emoji: "☝️", label: "Tulis 2, simpan 1", order: 2 },
        { x: 2, y: 0, emoji: "🔟", label: "Puluhan: 2 + 3 + 1 = 6", order: 3 },
      ],
    },
    palette: [...MOVES],
    optimalBlocks: 8,
    hints: [
      "Waktu menjumlah bersusun, kamu mulai dari angka paling kanan atau paling kiri? ✏️",
      "Seperti antre di kantin: yang paling depan (satuan) dilayani dulu, baru yang di belakangnya (puluhan).",
      "Naik dulu ke 1️⃣ Satuan di atasmu. Setelah itu, cari ☝️ di sebelah kirinya.",
    ],
    solution: [U(), U(), L(), L(), U(), U(), L(), L()],
  },
  {
    id: "l1-m5",
    level: 1,
    order: 5,
    title: "Labirin Kebun Wortel",
    subject: "Logika",
    story: "Kelinci lapar menunggu di rumahnya. Kumpulkan semua wortel di labirin lalu antarkan!",
    goal: "Ambil semua 🥕 (urutan bebas), lalu pergi ke 🐰 Rumah Kelinci.",
    board: {
      kind: "grid",
      width: 5,
      height: 5,
      start: { x: 0, y: 0 },
      goal: { x: 4, y: 4, emoji: "🐰", label: "Rumah Kelinci" },
      walls: [
        { x: 1, y: 0, emoji: "🌳" },
        { x: 1, y: 1, emoji: "🌳" },
        { x: 3, y: 1, emoji: "🪨" },
        { x: 3, y: 2, emoji: "🪨" },
        { x: 3, y: 3, emoji: "🪨" },
        { x: 1, y: 3, emoji: "🌳" },
        { x: 2, y: 3, emoji: "🌳" },
      ],
      items: [
        { x: 0, y: 2, emoji: "🥕", label: "Wortel 1" },
        { x: 2, y: 0, emoji: "🥕", label: "Wortel 2" },
        { x: 4, y: 2, emoji: "🥕", label: "Wortel 3" },
      ],
    },
    palette: [...MOVES],
    optimalBlocks: 12,
    hints: [
      "Coba telusuri jalannya dengan jarimu dulu. Wortel mana yang paling dekat? 🥕",
      "Seperti mencari jalan di taman: kalau ada pohon menghalangi, kamu harus memutar lewat jalan lain.",
      "Pohon menghalangi jalan ke kanan. Turun dulu ke wortel pertama, lalu cari jalan memutar ke atas.",
    ],
    solution: [D(), D(), R(), R(), U(), U(), R(), R(), D(), D(), D(), D()],
  },

  /* ============================ LEVEL 2 ============================ */
  {
    id: "l2-m1",
    level: 2,
    order: 1,
    title: "Perkalian 4 × 3",
    subject: "Matematika",
    story: "Ada 4 pohon, setiap pohon punya 3 apel. Kumpulkan semuanya: 3 + 3 + 3 + 3 = 4 × 3!",
    goal: "Kumpulkan 12 🍎 sampai ke 🧺 memakai blok Ulangi (maks. 2 blok).",
    board: {
      kind: "grid",
      width: 5,
      height: 3,
      start: { x: 0, y: 1 },
      goal: { x: 4, y: 1, emoji: "🧺", label: "Keranjang" },
      walls: [
        { x: 1, y: 0, emoji: "🌳" },
        { x: 2, y: 0, emoji: "🌳" },
        { x: 3, y: 0, emoji: "🌳" },
        { x: 4, y: 0, emoji: "🌳" },
      ],
      items: [
        { x: 1, y: 1, emoji: "🍎", label: "3 apel", value: 3 },
        { x: 2, y: 1, emoji: "🍎", label: "3 apel", value: 3 },
        { x: 3, y: 1, emoji: "🍎", label: "3 apel", value: 3 },
        { x: 4, y: 1, emoji: "🍎", label: "3 apel", value: 3 },
      ],
      counterLabel: "Apel",
    },
    palette: [...MOVES, { type: "repeat", times: 2 }],
    optimalBlocks: 2,
    maxBlocks: 2,
    mustUse: ["repeat"],
    hints: [
      "Langkah apa yang kamu lakukan berulang-ulang di misi ini? 🔁",
      "Bayangkan kamu menyiram 4 pot bunga. Kamu bilang 'siram' 4 kali, atau 'siram, ulangi 4 kali'? Blok Ulangi bekerja seperti itu!",
      "Taruh satu blok Kanan di dalam blok Ulangi. Lalu atur angkanya: berapa kali kamu perlu ke kanan?",
    ],
    solution: [rep(4, [R()])],
  },
  {
    id: "l2-m2",
    level: 2,
    order: 2,
    title: "Tangga Pola Bilangan",
    subject: "Matematika",
    story: "Naiki tangga angka 2, 4, 6, 8! Setiap anak tangga dinaiki dengan gerakan yang sama.",
    goal: "Ambil 2 → 4 → 6 → 8 lalu sampai di 🏆. Maks. 3 blok.",
    board: {
      kind: "grid",
      width: 5,
      height: 5,
      start: { x: 0, y: 4 },
      goal: { x: 4, y: 0, emoji: "🏆", label: "Puncak" },
      walls: [
        { x: 0, y: 3, emoji: "🧱" },
        { x: 1, y: 2, emoji: "🧱" },
        { x: 2, y: 1, emoji: "🧱" },
        { x: 3, y: 0, emoji: "🧱" },
      ],
      items: [
        { x: 1, y: 3, emoji: "2️⃣", label: "Angka 2", order: 1 },
        { x: 2, y: 2, emoji: "4️⃣", label: "Angka 4", order: 2 },
        { x: 3, y: 1, emoji: "6️⃣", label: "Angka 6", order: 3 },
        { x: 4, y: 0, emoji: "8️⃣", label: "Angka 8", order: 4 },
      ],
    },
    palette: [...MOVES, { type: "repeat", times: 2 }],
    optimalBlocks: 3,
    maxBlocks: 3,
    mustUse: ["repeat"],
    hints: [
      "Perhatikan satu anak tangga saja. Gerakan apa yang kamu lakukan untuk naik satu anak tangga? 🪜",
      "Seperti naik tangga di rumah: maju sedikit, naik sedikit, maju sedikit, naik sedikit... polanya sama terus!",
      "Satu anak tangga = Kanan lalu Atas. Masukkan dua blok itu ke dalam Ulangi, lalu hitung ada berapa anak tangga.",
    ],
    solution: [rep(4, [R(), U()])],
  },
  {
    id: "l2-m3",
    level: 2,
    order: 3,
    title: "Irama Detak Jantung",
    subject: "IPA",
    story: "Jantung berdetak terus berulang: dug-dug, dug-dug! Ikuti irama detaknya untuk mengambil setiap 💓.",
    goal: "Ambil semua 💓 lalu sampai di ❤️. Maks. 5 blok.",
    board: {
      kind: "grid",
      width: 7,
      height: 2,
      start: { x: 0, y: 1 },
      goal: { x: 6, y: 1, emoji: "❤️", label: "Jantung Sehat" },
      walls: [],
      items: [
        { x: 1, y: 0, emoji: "💓", label: "Detak 1" },
        { x: 3, y: 0, emoji: "💓", label: "Detak 2" },
        { x: 5, y: 0, emoji: "💓", label: "Detak 3" },
      ],
    },
    palette: [...MOVES, { type: "repeat", times: 2 }],
    optimalBlocks: 5,
    maxBlocks: 5,
    mustUse: ["repeat"],
    hints: [
      "Coba gerakkan jarimu dari 💓 pertama ke 💓 kedua. Gerakan apa saja yang kamu lakukan? 🎵",
      "Seperti lagu yang refrainnya diulang-ulang: cukup hafalkan satu bagian, lalu nyanyikan berulang kali!",
      "Satu detak = Kanan, Atas, Kanan, Bawah. Ada berapa 💓 yang harus diambil? Itu angka ulangannya.",
    ],
    solution: [rep(3, [R(), U(), R(), D()])],
  },
  {
    id: "l2-m4",
    level: 2,
    order: 4,
    title: "Perjalanan Fase Bulan",
    subject: "IPA",
    story: "Bulan berubah bentuk setiap malam dengan pola yang berulang. Kunjungi setiap fasenya sampai purnama!",
    goal: "Ambil 🌒 → 🌓 → 🌔 lalu sampai di 🌕 Purnama. Maks. 4 blok.",
    board: {
      kind: "grid",
      width: 7,
      height: 4,
      start: { x: 0, y: 0 },
      goal: { x: 6, y: 3, emoji: "🌕", label: "Bulan Purnama" },
      walls: [
        { x: 0, y: 1, emoji: "☁️" },
        { x: 1, y: 1, emoji: "☁️" },
        { x: 2, y: 2, emoji: "☁️" },
        { x: 3, y: 2, emoji: "☁️" },
        { x: 4, y: 3, emoji: "☁️" },
      ],
      items: [
        { x: 2, y: 1, emoji: "🌒", label: "Bulan Sabit", order: 1 },
        { x: 4, y: 2, emoji: "🌓", label: "Bulan Separuh", order: 2 },
        { x: 6, y: 3, emoji: "🌔", label: "Bulan Cembung", order: 3 },
      ],
    },
    palette: [...MOVES, { type: "repeat", times: 2 }],
    optimalBlocks: 4,
    maxBlocks: 4,
    mustUse: ["repeat"],
    hints: [
      "Dari tempatmu ke 🌒, berapa langkah dan ke arah mana saja? Apakah sama dengan dari 🌒 ke 🌓? 🌙",
      "Seperti fase bulan yang selalu berulang tiap bulan, jalanmu juga punya pola yang sama terus!",
      "Polanya: Kanan, Kanan, Bawah. Masukkan ke dalam Ulangi, lalu tentukan berapa kali diulang.",
    ],
    solution: [rep(3, [R(), R(), D()])],
  },
  {
    id: "l2-m5",
    level: 2,
    order: 5,
    title: "Ulangi di Dalam Ulangi",
    subject: "Logika",
    story: "Taman bunga ini punya jalan bertingkat yang polanya berulang. Bisakah kamu memakai Ulangi di dalam Ulangi?",
    goal: "Ambil kedua 🌷 lalu sampai di 🌻. Maks. 6 blok (5 blok = ⭐⭐⭐).",
    board: {
      kind: "grid",
      width: 7,
      height: 5,
      start: { x: 0, y: 0 },
      goal: { x: 6, y: 4, emoji: "🌻", label: "Bunga Matahari" },
      walls: [
        { x: 0, y: 1, emoji: "🌳" },
        { x: 1, y: 2, emoji: "🌳" },
        { x: 4, y: 3, emoji: "🌳" },
        { x: 5, y: 4, emoji: "🌳" },
      ],
      items: [
        { x: 3, y: 0, emoji: "🌷", label: "Bunga Tulip 1" },
        { x: 6, y: 2, emoji: "🌷", label: "Bunga Tulip 2" },
      ],
    },
    palette: [...MOVES, { type: "repeat", times: 2 }],
    optimalBlocks: 5,
    maxBlocks: 6,
    mustUse: ["repeat"],
    hints: [
      "Lihat jalannya: ada bagian 'ke kanan beberapa kali' dan 'ke bawah beberapa kali'. Berapa kali masing-masing? 🌷",
      "Seperti jadwal sekolah: setiap hari (diulang) kamu belajar beberapa pelajaran (juga diulang). Ulangan bisa ada di dalam ulangan!",
      "Satu tingkat = Kanan 3 kali, lalu Bawah 2 kali. Kamu bisa pakai Ulangi kecil untuk Kanan dan Bawah, lalu bungkus semuanya dengan Ulangi besar.",
    ],
    solution: [rep(2, [rep(3, [R()]), rep(2, [D()])])],
  },

  /* ============================ LEVEL 3 ============================ */
  {
    id: "l3-m1",
    level: 3,
    order: 1,
    title: "Genap atau Ganjil?",
    subject: "Matematika",
    story: "Mesin sortir angka butuh bantuanmu! Setiap angka harus masuk ke kotak yang tepat.",
    goal: "JIKA bilangan genap MAKA 🟦 Kotak Biru, JIKA TIDAK 🟥 Kotak Merah.",
    board: {
      kind: "sort",
      conditions: [{ id: "genap", label: "bilangan genap" }],
      boxes: [
        { id: "biru", label: "Kotak Biru", emoji: "🟦", color: "blue" },
        { id: "merah", label: "Kotak Merah", emoji: "🟥", color: "red" },
      ],
      items: [
        { emoji: "4", label: "4", tags: ["genap"], answer: "biru" },
        { emoji: "7", label: "7", tags: [], answer: "merah" },
        { emoji: "10", label: "10", tags: ["genap"], answer: "biru" },
        { emoji: "3", label: "3", tags: [], answer: "merah" },
        { emoji: "8", label: "8", tags: ["genap"], answer: "biru" },
        { emoji: "15", label: "15", tags: [], answer: "merah" },
      ],
    },
    palette: [{ type: "if", cond: "genap" }, { type: "put", box: "biru" }, { type: "put", box: "merah" }],
    optimalBlocks: 3,
    mustUse: ["if"],
    hints: [
      "Kalau angkanya genap, mau dimasukkan ke mana? Kalau ganjil? 🤔",
      "Seperti di rumah: JIKA hujan MAKA bawa payung, JIKA TIDAK pakai topi. Blok Jika memilih satu dari dua jalan!",
      "Pakai blok Jika. Di bagian MAKA taruh Kotak Biru, di bagian JIKA TIDAK taruh Kotak Merah.",
    ],
    solution: [iff("genap", [put("biru")], [put("merah")])],
  },
  {
    id: "l3-m2",
    level: 3,
    order: 2,
    title: "Terapung atau Tenggelam?",
    subject: "IPA",
    story: "Benda-benda dimasukkan ke kolam. Ada yang terapung dan ada yang tenggelam!",
    goal: "JIKA benda terapung MAKA 🛟 Permukaan, JIKA TIDAK ⚓ Dasar Kolam.",
    board: {
      kind: "sort",
      conditions: [{ id: "terapung", label: "benda terapung" }],
      boxes: [
        { id: "permukaan", label: "Permukaan Air", emoji: "🛟", color: "blue" },
        { id: "dasar", label: "Dasar Kolam", emoji: "⚓", color: "yellow" },
      ],
      items: [
        { emoji: "🪵", label: "Kayu", tags: ["terapung"], answer: "permukaan" },
        { emoji: "🪨", label: "Batu", tags: [], answer: "dasar" },
        { emoji: "🍃", label: "Daun", tags: ["terapung"], answer: "permukaan" },
        { emoji: "🔩", label: "Paku besi", tags: [], answer: "dasar" },
        { emoji: "🏐", label: "Bola", tags: ["terapung"], answer: "permukaan" },
        { emoji: "🥄", label: "Sendok besi", tags: [], answer: "dasar" },
      ],
    },
    palette: [{ type: "if", cond: "terapung" }, { type: "put", box: "permukaan" }, { type: "put", box: "dasar" }],
    optimalBlocks: 3,
    mustUse: ["if"],
    hints: [
      "Benda yang ringan seperti daun, biasanya terapung atau tenggelam? 🍃",
      "Seperti di kolam renang: pelampung terapung di atas, koin jatuh ke dasar. Blok Jika membantu memilih tempatnya!",
      "Pakai blok Jika 'benda terapung'. Bagian MAKA ke Permukaan Air, bagian JIKA TIDAK ke Dasar Kolam.",
    ],
    solution: [iff("terapung", [put("permukaan")], [put("dasar")])],
  },
  {
    id: "l3-m3",
    level: 3,
    order: 3,
    title: "Lebih dari 10",
    subject: "Matematika",
    story: "Petugas toko ingin memisahkan barang dengan harga besar dan kecil. Pilih syarat yang tepat ya!",
    goal: "Angka yang lebih dari 10 masuk 🟩 Kotak Besar, sisanya 🟨 Kotak Kecil.",
    board: {
      kind: "sort",
      conditions: [
        { id: "lebih10", label: "lebih dari 10" },
        { id: "genap", label: "bilangan genap" },
      ],
      boxes: [
        { id: "besar", label: "Kotak Besar", emoji: "🟩", color: "green" },
        { id: "kecil", label: "Kotak Kecil", emoji: "🟨", color: "yellow" },
      ],
      items: [
        { emoji: "12", label: "12", tags: ["lebih10", "genap"], answer: "besar" },
        { emoji: "5", label: "5", tags: [], answer: "kecil" },
        { emoji: "20", label: "20", tags: ["lebih10", "genap"], answer: "besar" },
        { emoji: "9", label: "9", tags: [], answer: "kecil" },
        { emoji: "11", label: "11", tags: ["lebih10"], answer: "besar" },
        { emoji: "8", label: "8", tags: ["genap"], answer: "kecil" },
      ],
    },
    palette: [{ type: "if", cond: "lebih10" }, { type: "put", box: "besar" }, { type: "put", box: "kecil" }],
    optimalBlocks: 3,
    mustUse: ["if"],
    hints: [
      "Ada dua pilihan syarat di blok Jika. Syarat mana yang cocok dengan tujuan misi? 🔍",
      "Seperti wahana di taman bermain: JIKA tinggimu lebih dari batas MAKA boleh naik. Yang dilihat hanya tingginya, bukan warna bajunya!",
      "Ganti syarat di blok Jika menjadi 'lebih dari 10'. Angka 11 itu ganjil, tapi tetap lebih dari 10 lho!",
    ],
    solution: [iff("lebih10", [put("besar")], [put("kecil")])],
  },
  {
    id: "l3-m4",
    level: 3,
    order: 4,
    title: "Makanan Hewan",
    subject: "IPA",
    story: "Penjaga kebun binatang perlu mengantar hewan ke tempat makannya. Herbivora makan tumbuhan, karnivora makan daging.",
    goal: "Herbivora ke 🌿 Padang Rumput, karnivora ke 🍖 Kandang Daging.",
    board: {
      kind: "sort",
      conditions: [
        { id: "herbivora", label: "pemakan tumbuhan" },
        { id: "karnivora", label: "pemakan daging" },
      ],
      boxes: [
        { id: "rumput", label: "Padang Rumput", emoji: "🌿", color: "green" },
        { id: "daging", label: "Kandang Daging", emoji: "🍖", color: "red" },
      ],
      items: [
        { emoji: "🐄", label: "Sapi", tags: ["herbivora"], answer: "rumput" },
        { emoji: "🐅", label: "Harimau", tags: ["karnivora"], answer: "daging" },
        { emoji: "🐐", label: "Kambing", tags: ["herbivora"], answer: "rumput" },
        { emoji: "🦁", label: "Singa", tags: ["karnivora"], answer: "daging" },
        { emoji: "🐇", label: "Kelinci", tags: ["herbivora"], answer: "rumput" },
        { emoji: "🐊", label: "Buaya", tags: ["karnivora"], answer: "daging" },
      ],
    },
    palette: [{ type: "if", cond: "herbivora" }, { type: "put", box: "rumput" }, { type: "put", box: "daging" }],
    optimalBlocks: 3,
    mustUse: ["if"],
    hints: [
      "Sapi makan apa? Harimau makan apa? Kelompokkan hewannya dulu dalam pikiranmu! 🐄🐅",
      "Seperti membagi bekal: JIKA temanmu vegetarian MAKA beri sayur, JIKA TIDAK beri lauk daging.",
      "Pilih satu syarat, misalnya 'pemakan tumbuhan'. Lalu pikirkan: hewan yang memenuhi syarat itu masuk ke kotak mana?",
    ],
    solution: [iff("herbivora", [put("rumput")], [put("daging")])],
  },
  {
    id: "l3-m5",
    level: 3,
    order: 5,
    title: "Mesin Sortir Super",
    subject: "Matematika",
    story: "Mesin sortir sekarang punya tiga kotak! Kelipatan 5 diperiksa paling dulu, lalu bilangan genap.",
    goal: "Kelipatan 5 → 🟩 Hijau. Jika bukan, genap → 🟦 Biru. Sisanya → 🟥 Merah.",
    board: {
      kind: "sort",
      conditions: [
        { id: "kelipatan5", label: "kelipatan 5" },
        { id: "genap", label: "bilangan genap" },
      ],
      boxes: [
        { id: "hijau", label: "Kotak Hijau", emoji: "🟩", color: "green" },
        { id: "biru", label: "Kotak Biru", emoji: "🟦", color: "blue" },
        { id: "merah", label: "Kotak Merah", emoji: "🟥", color: "red" },
      ],
      items: [
        { emoji: "10", label: "10", tags: ["kelipatan5", "genap"], answer: "hijau" },
        { emoji: "4", label: "4", tags: ["genap"], answer: "biru" },
        { emoji: "15", label: "15", tags: ["kelipatan5"], answer: "hijau" },
        { emoji: "7", label: "7", tags: [], answer: "merah" },
        { emoji: "8", label: "8", tags: ["genap"], answer: "biru" },
        { emoji: "25", label: "25", tags: ["kelipatan5"], answer: "hijau" },
        { emoji: "9", label: "9", tags: [], answer: "merah" },
      ],
    },
    palette: [
      { type: "if", cond: "kelipatan5" },
      { type: "put", box: "hijau" },
      { type: "put", box: "biru" },
      { type: "put", box: "merah" },
    ],
    optimalBlocks: 5,
    mustUse: ["if"],
    hints: [
      "Ada tiga kotak, tapi blok Jika hanya punya dua jalan. Bagaimana caranya supaya ada tiga pilihan? 🤔",
      "Seperti memilih baju: JIKA hujan pakai jas hujan, JIKA TIDAK, lalu JIKA panas pakai topi, JIKA TIDAK pakai jaket. Pertanyaan bisa bertingkat!",
      "Kamu bisa menaruh blok Jika kedua di dalam bagian JIKA TIDAK dari blok Jika pertama. Periksa kelipatan 5 dulu ya!",
    ],
    solution: [iff("kelipatan5", [put("hijau")], [iff("genap", [put("biru")], [put("merah")])])],
  },
];

export function getMission(id: string): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}

export function missionsByLevel(level: number): Mission[] {
  return MISSIONS.filter((m) => m.level === level).sort((a, b) => a.order - b.order);
}

export function getLevel(level: number): LevelInfo | undefined {
  return LEVELS.find((l) => l.level === level);
}

/** Next mission in global order, if any. */
export function nextMission(id: string): Mission | undefined {
  const sorted = [...MISSIONS].sort((a, b) => a.level - b.level || a.order - b.order);
  const i = sorted.findIndex((m) => m.id === id);
  return i >= 0 ? sorted[i + 1] : undefined;
}

