import { requireAdult, adultCanAccessChild } from "@/lib/session";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdult();
  const access = await adultCanAccessChild(user.id, id);
  if (!access) return new NextResponse("Akses ditolak", { status: 403 });

  const child = await db.childProfile.findUnique({
    where: { id },
    include: {
      progress: true,
      attempts: true,
      badges: true,
      chats: true,
    }
  });

  if (!child) return new NextResponse("Tidak ditemukan", { status: 404 });

  // Remove sensitive data (like pinHash)
  const { pinHash, ...safeChild } = child;

  const data = JSON.stringify(safeChild, null, 2);

  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="data_anak_${safeChild.nickname.replace(/\s+/g, '_')}.json"`,
    },
  });
}
