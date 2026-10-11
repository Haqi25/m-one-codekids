"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createAdultSession, clearAdultSession } from "@/lib/session";
import { randomCode } from "@/lib/codes";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mail";

const registerSchema = z.object({
  name: z.string().min(2, "Nama terlalu pendek"),
  email: z.string().email("Format email salah"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.enum(["PARENT", "TEACHER"]),
});

export async function register(prevState: any, formData: FormData) {
  const result = registerSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { name, email, password, role } = result.data;
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email sudah terdaftar" };
  }

  // Catatan: bcryptjs async seringkali sangat lambat di beberapa versi Node (karena yield loop).
  // Menggunakan hashSync dengan ronde 8 jauh lebih cepat dan cukup aman untuk prototyping.
  const passwordHash = bcrypt.hashSync(password, 8);
  let familyCode = null;

  if (role === "PARENT") {
    let unique = false;
    while (!unique) {
      familyCode = randomCode(6);
      const exists = await db.user.findUnique({ where: { familyCode } });
      if (!exists) unique = true;
    }
  }

  const verificationToken = crypto.randomUUID();

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      familyCode,
      verificationToken,
    },
  });

  // Kirim email verifikasi via SMTP
  await sendVerificationEmail(email, verificationToken);

  return { success: "Pendaftaran berhasil! Silakan cek kotak masuk email Anda untuk melakukan verifikasi akun sebelum masuk." };
}

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi" };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Email atau password salah" };
  }

  if (!user.emailVerified) {
    return { error: "Email belum diverifikasi. Silakan cek kotak masuk email Anda atau daftar kembali jika token kadaluarsa." };
  }

  await createAdultSession(user.id, user.role as "PARENT" | "TEACHER");
  redirect("/dashboard");
}

export async function logout() {
  await clearAdultSession();
  redirect("/akun/masuk");
}
