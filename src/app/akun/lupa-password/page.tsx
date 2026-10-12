"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "../actions";
import Link from "next/link";

export default function LupaPasswordPage() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, null);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-display text-navy mb-2">Lupa Password? 🔑</h1>
        <p className="text-ink">Masukkan email Anda untuk menerima tautan pengaturan ulang kata sandi.</p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="bg-orange-100 text-orange-700 p-3 rounded-lg text-sm font-bold">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="bg-leaf-100/50 text-leaf-700 p-4 rounded-lg text-sm border-2 border-leaf-700/20 font-bold leading-relaxed">
            {state.success}
          </div>
        )}

        {!state?.success && (
          <>
            <div className="space-y-1">
              <label className="label">Alamat Email</label>
              <input name="email" type="email" placeholder="nama@email.com" className="input w-full" required />
            </div>

            <div className="pt-2">
              <button type="submit" disabled={isPending} className="btn-primary w-full">
                {isPending ? "Mengirim Tautan..." : "Kirim Tautan Reset"}
              </button>
            </div>
          </>
        )}
      </form>

      <div className="text-center text-sm text-ink pt-2">
        Ingat kata sandi Anda?{" "}
        <Link href="/akun/masuk" className="text-navy font-bold hover:underline">
          Kembali ke Masuk
        </Link>
      </div>
    </div>
  );
}

