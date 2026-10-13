import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getChildSession } from "@/lib/session";
import { db } from "@/lib/db";
import { getMission } from "@/content/missions";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await getChildSession();
    if (!session?.childId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { missionId, goal, program, attempts, message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Determine hint level based on hints used (can be inferred from history or just rely on Gemini to increment via its prompt)
    const hintsUsed = history.filter((m: any) => m.role === "bibi").length;
    let hintLevel = 1;
    if (hintsUsed >= 2) hintLevel = 3;
    else if (hintsUsed === 1) hintLevel = 2;

    const programStr = JSON.stringify(program, null, 2);

    const systemPrompt = `Kamu adalah "Bibi AI", tutor coding virtual untuk anak SD (7-12 tahun). 
Kamu sedang membantu anak menyelesaikan sebuah misi coding bergaya blok (seperti Scratch).

Konteks saat ini:
- Misi ID: ${missionId}
- Tujuan Misi: ${goal}
- Jumlah percobaan gagal: ${attempts}
- Tingkat Hint (1-3): ${hintLevel}
- Kode Blok anak saat ini (JSON):
${programStr}

ATURAN UTAMA:
1. JANGAN PERNAH memberikan jawaban langsung, solusi lengkap, atau susunan blok yang benar.
2. Gunakan bahasa Indonesia sederhana untuk anak SD.
3. Maksimal 3 kalimat per jawaban. Gunakan emoji secukupnya.
4. Gaya bicara ramah, menyemangati, dan menyenangkan.
5. Panduan tingkat hint:
   - Tingkat 1 (Hint 1): Berikan pertanyaan pemandu agar anak berpikir ke arah yang benar.
   - Tingkat 2 (Hint 2): Berikan analogi sehari-hari (misal: menyiram tanaman, membagikan permen) yang sesuai dengan konsep.
   - Tingkat 3 (Hint 3): Berikan petunjuk lebih spesifik (misal: "coba periksa apakah blok IF kamu ada di tempat yang tepat").
   Sekarang kamu berada di tingkat hint: ${hintLevel}.

Sesuaikan jawabanmu dengan pertanyaan anak dan konteks blok yang sudah mereka susun.`;

    const chatHistory = history.map((m: any) => ({
      role: m.role === "bibi" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    // Add current message to chat history format
    const contents = [
      ...chatHistory,
      { role: "user", parts: [{ text: message }] }
    ];

    const candidateModels = Array.from(
      new Set(
        [
          process.env.GEMINI_MODEL,
          "gemini-3.5-flash",
          "gemini-3.1-flash-lite",
          "gemini-flash-latest",
        ].filter(Boolean) as string[]
      )
    );

    let reply = "";

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });
        if (response.text) {
          reply = response.text.trim();
          break;
        }
      } catch (err: any) {
        console.warn(`Gemini model ${model} unavailable (${err?.status || err?.code || "error"}), trying next model candidate...`);
      }
    }

    // FR-AI-S6 & FR-MISI-03: Educative fallback using authored tiered hints if all AI models are unreachable
    if (!reply) {
      const mission = getMission(missionId);
      const hintIdx = Math.min(Math.max(hintLevel - 1, 0), (mission?.hints?.length || 1) - 1);
      const authoredHint = mission?.hints?.[hintIdx];

      reply = authoredHint
        ? `Bibi punya petunjuk buatmu: "${authoredHint}" ✨ Coba periksa blokmu ya!`
        : "Bibi lagi minum teh sebentar ☕. Coba periksa urutan blok yang sudah kamu pasang ya, kamu pasti bisa!";
    }
    
    // Log interaction in DB asynchronously
    try {
      await db.$transaction([
        db.chatLog.create({
          data: {
            childId: session.childId,
            missionId: missionId,
            role: "child",
            content: message,
            hintLevel: hintLevel,
          }
        }),
        db.chatLog.create({
          data: {
            childId: session.childId,
            missionId: missionId,
            role: "bibi",
            content: reply || "",
            hintLevel: hintLevel,
          }
        })
      ]);
    } catch(e) {
      console.error("Failed to log chat:", e);
    }

    return NextResponse.json({ 
      reply: reply,
      isHint: true, // We consider every answer from Bibi as a hint
    });

  } catch (error) {
    console.error("Bibi AI Error:", error);
    return NextResponse.json({
      reply: "Bibi lagi minum teh sebentar ☕. Coba tanyakan lagi ya!",
      isHint: false
    });
  }
}
