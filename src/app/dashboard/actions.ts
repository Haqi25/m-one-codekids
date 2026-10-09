"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireAdult, adultCanAccessChild } from "@/lib/session";
import { randomCode, randomPin } from "@/lib/codes";
import { revalidatePath } from "next/cache";

const addChildSchema = z.object({
  nickname: z.string().min(1).max(20),
  avatar: z.string(),
  grade: z.coerce.number().min(1).max(6),
  consent: z.string().optional(),
});

export async function addChild(prevState: any, formData: FormData) {
  const user = await requireAdult();
  if (user.role !== "PARENT") return { error: "Hanya orang tua yang bisa menambahkan anak." };

  const result = addChildSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: "Data tidak valid." };
  
  if (result.data.consent !== "on") {
    return { error: "Anda harus menyetujui persyaratan." };
  }

  const pin = randomPin();
  const pinHash = await bcrypt.hash(pin, 10);

  await db.childProfile.create({
    data: {
      nickname: result.data.nickname,
      avatar: result.data.avatar,
      grade: result.data.grade,
      pinHash,
      parentId: user.id,
      consentAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
  return { success: true, pin };
}

const addClassSchema = z.object({
  name: z.string().min(1, "Nama kelas wajib diisi"),
  consent: z.string().optional(),
});

export async function addClass(prevState: any, formData: FormData) {
  const user = await requireAdult();
  if (user.role !== "TEACHER") return { error: "Hanya guru yang bisa membuat kelas." };

  const result = addClassSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: "Data tidak valid." };

  if (result.data.consent !== "on") {
    return { error: "Anda harus menyetujui persyaratan izin pihak sekolah/orang tua." };
  }

  let code = null;
  let unique = false;
  while (!unique) {
    code = randomCode(6);
    const exists = await db.class.findUnique({ where: { code } });
    if (!exists) unique = true;
  }

  await db.class.create({
    data: {
      name: result.data.name,
      code: code as string,
      teacherId: user.id,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

const addStudentSchema = z.object({
  classId: z.string(),
  nickname: z.string().min(1).max(20),
  avatar: z.string(),
  grade: z.coerce.number().min(1).max(6),
});

export async function addStudentToClass(prevState: any, formData: FormData) {
  const user = await requireAdult();
  if (user.role !== "TEACHER") return { error: "Akses ditolak." };

  const result = addStudentSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: "Data tidak valid." };

  const cls = await db.class.findUnique({ where: { id: result.data.classId } });
  if (!cls || cls.teacherId !== user.id) return { error: "Kelas tidak ditemukan atau akses ditolak." };

  const pin = randomPin();
  const pinHash = await bcrypt.hash(pin, 10);

  await db.childProfile.create({
    data: {
      nickname: result.data.nickname,
      avatar: result.data.avatar,
      grade: result.data.grade,
      pinHash,
      classId: cls.id,
    },
  });

  revalidatePath(`/dashboard/kelas/${cls.id}`);
  return { success: true, pin };
}

export async function resetChildPin(childId: string) {
  const user = await requireAdult();
  const access = await adultCanAccessChild(user.id, childId);
  if (!access) throw new Error("Akses ditolak.");

  const pin = randomPin();
  const pinHash = await bcrypt.hash(pin, 10);
  await db.childProfile.update({
    where: { id: childId },
    data: { pinHash },
  });

  revalidatePath(`/dashboard/anak/${childId}`);
  return pin;
}

export async function deleteChild(childId: string) {
  const user = await requireAdult();
  const access = await adultCanAccessChild(user.id, childId);
  if (!access) throw new Error("Akses ditolak.");

  await db.childProfile.delete({ where: { id: childId } });
  revalidatePath("/dashboard");
}

export async function updateChildSettings(childId: string, data: { dailyLimitMin: number | null, soundOn: boolean }) {
  const user = await requireAdult();
  const access = await adultCanAccessChild(user.id, childId);
  if (!access) throw new Error("Akses ditolak.");

  await db.childProfile.update({
    where: { id: childId },
    data: {
      dailyLimitMin: data.dailyLimitMin,
      soundOn: data.soundOn,
    },
  });

  revalidatePath(`/dashboard/anak/${childId}`);
}
