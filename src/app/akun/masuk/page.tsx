"use client";

import { useActionState, Suspense } from "react";
import { login } from "../actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

function MasukForm() {
  const [state, formAction, isPending] = useActionState(login, null);
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const errorMessage = state?.error || urlError;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-display text-navy mb-2">Masuk</h1>
        <p className="text-ink">Masuk ke akun Orang Tua atau Guru</p>
      </div>

      <GoogleAuthButton mode="login" />

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-peach/80" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-ink/70 font-medium">atau masuk dengan email</span>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        {errorMessage && (
          <div className="bg-orange-100 text-orange-700 p-3 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

        <div className="space-y-1">
          <label className="label">Email</label>
          <input name="email" type="email" className="input w-full" required />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="label mb-0">Password</label>
            <Link href="/akun/lupa-password" className="text-xs text-orange-700 font-bold hover:underline">
              Lupa password?
            </Link>
          </div>
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

export default function MasukPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-ink">Memuat...</div>}>
      <MasukForm />
    </Suspense>
  );
}
