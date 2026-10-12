"use client";

import { useActionState, use } from "react";
import { resetPassword } from "../actions";
import Link from "next/link";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const resolvedSearchParams = use(searchParams);
  const token = resolvedSearchParams.token;
  const [state, formAction, isPending] = useActionState(resetPassword, null);

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-display text-navy mb-2">Reset Password 🔑</h1>
        <div className="bg-orange-100 text-orange-700 p-4 rounded-lg text-sm font-bold">
          Tautan tidak valid atau token tidak ditemukan.
        </div>
        <Link href="/akun/lupa-password" className="btn-primary w-full">
          Minta Tautan Baru
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-display text-navy mb-2">Buat Password Baru 🔐</h1>
        <p className="text-ink">Masukkan kata sandi baru untuk akun Anda.</p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        {state?.error && (
          <div className="bg-orange-100 text-orange-700 p-3 rounded-lg text-sm font-bold">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="space-y-4">
            <div className="bg-leaf-100/50 text-leaf-700 p-4 rounded-lg text-sm border-2 border-leaf-700/20 font-bold">
              {state.success}
            </div>
            <Link href="/akun/masuk" className="btn-primary w-full inline-flex">
              Masuk Sekarang
            </Link>
          </div>
        )}

        {!state?.success && (
          <>
            <div className="space-y-1">
              <label className="label">Password Baru</label>
              <input
                name="password"
                type="password"
                className="input w-full"
                required
                minLength={8}
                placeholder="Minimal 8 karakter"
              />
            </div>

            <div className="space-y-1">
              <label className="label">Konfirmasi Password Baru</label>
              <input
                name="confirmPassword"
                type="password"
                className="input w-full"
                required
                minLength={8}
                placeholder="Ulangi password baru"
              />
            </div>

            <div className="pt-2">
              <button type="submit" disabled={isPending} className="btn-primary w-full">
                {isPending ? "Menyimpan..." : "Simpan Password Baru"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

