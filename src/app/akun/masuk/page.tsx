"use client";

import { useActionState } from "react";
import { login } from "../actions";
import Link from "next/link";

export default function MasukPage() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-display text-navy mb-2">Masuk</h1>
        <p className="text-ink">Masuk ke akun Orang Tua atau Guru</p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="bg-orange-100 text-orange-700 p-3 rounded-lg text-sm">
            {state.error}
          </div>
        )}

        <div className="space-y-1">
          <label className="label">Email</label>
          <input name="email" type="email" className="input w-full" required />
        </div>

        <div className="space-y-1">
          <label className="label">Password</label>
          <input name="password" type="password" className="input w-full" required />
        </div>

        <div className="pt-2">
          <button type="submit" disabled={isPending} className="btn-primary w-full">
            {isPending ? "Masuk..." : "Masuk"}
          </button>
        </div>
      </form>

      <div className="text-center text-sm text-ink">
        Belum punya akun?{" "}
        <Link href="/akun/daftar" className="text-navy font-bold hover:underline">
          Daftar di sini
        </Link>
      </div>
    </div>
  );
}
