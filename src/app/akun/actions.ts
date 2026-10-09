"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createAdultSession, clearAdultSession } from "@/lib/session";
import { randomCode } from "@/lib/codes";
import { redirect } from "next/navigation";

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

  const passwordHash = await bcrypt.hash(password, 10);
  let familyCode = null;

  if (role === "PARENT") {
    let unique = false;
    while (!unique) {
      familyCode = randomCode(6);
      const exists = await db.user.findUnique({ where: { familyCode } });
      if (!exists) unique = true;
    }
  }

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      familyCode,
    },
  });

  await createAdultSession(user.id, user.role as "PARENT" | "TEACHER");
  redirect("/dashboard");
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

  await createAdultSession(user.id, user.role as "PARENT" | "TEACHER");
  redirect("/dashboard");
}

export async function logout() {
  await clearAdultSession();
  redirect("/akun/masuk");
}
