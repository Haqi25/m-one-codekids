"use client";

import { useActionState } from "react";
import { register } from "../actions";
import Link from "next/link";

export default function DaftarPage() {
  const [state, formAction, isPending] = useActionState(register, null);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-display text-navy mb-2">Buat Akun</h1>
        <p className="text-ink">Pilih peran Anda untuk melanjutkan</p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="bg-orange-100 text-orange-700 p-3 rounded-lg text-sm">
            {state.error}
          </div>
        )}

        <div className="space-y-1">
          <label className="label">Peran</label>
          <select name="role" className="input w-full" required>
            <option value="PARENT">Orang Tua</option>
            <option value="TEACHER">Guru</option>
          </select>
        </div>

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
            {isPending ? "Mendaftar..." : "Daftar"}
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
        Catatan: Login Google belum tersedia.
      </div>
    </div>
  );
}
