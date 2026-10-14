"use client";

import { useActionState, useState } from "react";
import { register } from "../actions";
import Link from "next/link";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

export default function DaftarPage() {
  const [state, formAction, isPending] = useActionState(register, null);
  const [role, setRole] = useState<"PARENT" | "TEACHER">("PARENT");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-display text-navy mb-2">Buat Akun</h1>
        <p className="text-ink">Pilih peran Anda untuk melanjutkan</p>
      </div>

      {/* Role Toggle Selector */}
      <div className="flex bg-peach/40 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setRole("PARENT")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            role === "PARENT"
              ? "bg-white text-navy shadow-sm"
              : "text-ink/70 hover:text-navy"
          }`}
        >
          Orang Tua
        </button>
        <button
          type="button"
          onClick={() => setRole("TEACHER")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            role === "TEACHER"
              ? "bg-white text-navy shadow-sm"
              : "text-ink/70 hover:text-navy"
          }`}
        >
          Guru
        </button>
      </div>

      <GoogleAuthButton mode="register" role={role} />

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-peach/80" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-ink/70 font-medium">atau daftar dengan email</span>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="bg-orange-100 text-orange-700 p-3 rounded-lg text-sm">
            {state.error}
          </div>
        )}
        {state?.success && (
          <div className="bg-leaf-100/50 text-leaf-700 p-4 rounded-lg text-sm border-2 border-leaf-700/20 font-bold">
            {state.success}
          </div>
        )}

        <input type="hidden" name="role" value={role} />

        <div className="space-y-1">
          <label className="label">Nama Lengkap</label>
          <input name="name" type="text" className="input w-full" required minLength={2} />
        </div>

        <div className="space-y-1">
          <label className="label">Email</label>
          <input name="email" type="email" className="input w-full" required />
        </div>

        <div className="space-y-1">
          <label className="label">Password</label>
          <input name="password" type="password" className="input w-full" required minLength={8} />
          <p className="text-xs text-ink/70">Minimal 8 karakter</p>
        </div>

        <div className="pt-2">
          <button type="submit" disabled={isPending} className="btn-primary w-full">
            {isPending ? "Mendaftar..." : `Daftar sebagai ${role === "PARENT" ? "Orang Tua" : "Guru"}`}
          </button>
        </div>
      </form>

      <div className="text-center text-sm text-ink">
        Sudah punya akun?{" "}
        <Link href="/akun/masuk" className="text-navy font-bold hover:underline">
          Masuk di sini
        </Link>
      </div>

      <div className="text-center text-xs text-ink/70 pt-4 border-t border-peach/50">
        Anak-anak masuk menggunakan PIN dan Kode Keluarga / Kelas di{" "}
        <Link href="/masuk" className="text-navy font-bold hover:underline">
          Halaman Masuk Anak
        </Link>.
      </div>
    </div>
  );
}
