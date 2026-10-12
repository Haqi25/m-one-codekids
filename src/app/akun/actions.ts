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

export async function requestPasswordReset(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email) {
    return { error: "Email wajib diisi" };
  }

  const user = await db.user.findUnique({ where: { email } });

  // Untuk keamanan (security best-practice), tetap tampilkan pesan sukses meskipun email tidak terdaftar
  if (!user) {
    return { success: "Jika email Anda terdaftar, kami telah mengirimkan tautan untuk mengatur ulang kata sandi." };
  }

  const resetToken = crypto.randomUUID();
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 jam dari sekarang

  await db.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    },
  });

  const { sendPasswordResetEmail } = await import("@/lib/mail");
  await sendPasswordResetEmail(email, resetToken);

  return { success: "Jika email Anda terdaftar, kami telah mengirimkan tautan untuk mengatur ulang kata sandi." };
}

export async function resetPassword(prevState: any, formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) {
    return { error: "Token tidak valid atau tidak ditemukan." };
  }

  if (!password || password.length < 8) {
    return { error: "Kata sandi minimal 8 karakter." };
  }

  if (password !== confirmPassword) {
    return { error: "Konfirmasi kata sandi tidak cocok." };
  }

  const user = await db.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return { error: "Tautan reset kata sandi tidak valid atau sudah kadaluarsa. Silakan minta tautan baru." };
  }

  const passwordHash = bcrypt.hashSync(password, 8);

  await db.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return { success: "Kata sandi Anda berhasil diperbarui! Silakan masuk dengan kata sandi baru." };
}

