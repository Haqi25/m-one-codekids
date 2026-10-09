"use server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createChildSession } from "@/lib/session";
import { normalizeCode } from "@/lib/codes";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginChildAction(prevState: any, formData: FormData) {
  const code = normalizeCode(formData.get("code") as string || "");
  const nickname = (formData.get("nickname") as string || "").trim();
  const pin = formData.get("pin") as string || "";

  if (!code || !nickname || pin.length !== 4) {
    return { error: "Semua kolom harus diisi dan PIN harus 4 angka." };
  }

  // Find child either via parent's familyCode or teacher's classCode
  const child = await db.childProfile.findFirst({
    where: {
      nickname: {
        equals: nickname
      },
      OR: [
        { parent: { familyCode: code } },
        { class: { code: code } }
      ]
    }
  });

  if (!child) {
    return { error: "Anak tidak ditemukan. Cek kembali Kode dan Nama." };
  }

  const validPin = await bcrypt.compare(pin, child.pinHash);
  if (!validPin) {
    return { error: "PIN salah. Coba lagi ya!" };
  }

  await createChildSession(child.id);
  redirect("/peta");
}

