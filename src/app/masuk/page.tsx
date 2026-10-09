"use client";
import { useActionState } from "react";
import { loginChildAction } from "./actions";
import { Logo } from "@/components/brand/Logo";
import { BibiMascot } from "@/components/brand/BibiMascot";

export default function MasukAnakPage() {
  const [state, formAction, pending] = useActionState(loginChildAction, null);

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-4 bg-peach">
      <div className="w-full max-w-md card p-8 text-center space-y-6">
        <Logo className="mx-auto" />
        
        <BibiMascot mood="happy" className="w-32 h-32 mx-auto animate-float" />
        
        <h1 className="text-3xl text-navy">Siap Belajar Coding?</h1>
        <p className="text-navy-700">Minta Kode Keluarga / Kode Kelas dari orang tua atau gurumu ya!</p>
        
        {state?.error && (
          <div className="bg-berry/10 text-berry p-3 rounded-xl font-bold">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4 text-left">
          <div>
            <label htmlFor="code" className="label">Kode (Keluarga / Kelas)</label>
            <input type="text" id="code" name="code" className="input uppercase" placeholder="Contoh: AB34X" maxLength={8} required />
          </div>
          <div>
            <label htmlFor="nickname" className="label">Nama Panggilan</label>
            <input type="text" id="nickname" name="nickname" className="input" placeholder="Contoh: Budi" required />
          </div>
          <div>
            <label htmlFor="pin" className="label">PIN Rahasia (4 Angka)</label>
            <input type="password" inputMode="numeric" pattern="[0-9]*" id="pin" name="pin" className="input tracking-widest text-center text-2xl" placeholder="••••" maxLength={4} required />
          </div>
          <button type="submit" className="btn-primary w-full text-xl py-4 mt-2" disabled={pending}>
            {pending ? "Masuk..." : "Mulai Bermain! 🚀"}
          </button>
        </form>
      </div>
    </main>
  );
}

