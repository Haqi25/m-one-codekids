"use client";

import { useActionState, useState, useEffect } from "react";
import { addChild } from "@/app/dashboard/actions";
import { AVATARS, GRADES } from "@/lib/constants";

export default function ParentDashboardForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(addChild, null);
  const [pin, setPin] = useState<string | null>(null);

  useEffect(() => {
    if (state?.success && state.pin) {
      setPin(state.pin);
    }
  }, [state]);

  if (!isOpen && !pin) {
    return <button onClick={() => setIsOpen(true)} className="btn-primary">+ Tambah Anak</button>;
  }

  if (pin) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded-2xl max-w-sm w-full text-center">
          <h3 className="text-xl font-bold text-navy mb-2">Anak Berhasil Ditambahkan!</h3>
          <p className="text-ink mb-4">Harap catat PIN ini, karena <strong>hanya ditampilkan sekali saja</strong>:</p>
          <div className="text-5xl font-mono tracking-widest text-orange-700 font-bold mb-6 bg-orange-100 py-4 rounded-xl">
            {pin}
          </div>
          <button onClick={() => { setPin(null); setIsOpen(false); }} className="btn-primary w-full">
            Tutup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-2xl max-w-md w-full">
        <h3 className="text-xl font-bold text-navy mb-4">Tambah Anak</h3>
        <form action={formAction} className="space-y-4">
          {state?.error && <div className="text-orange-700 bg-orange-100 p-2 rounded text-sm">{state.error}</div>}
          
          <div>
            <label className="label">Nama Panggilan (maks 20 karakter)</label>
            <input type="text" name="nickname" className="input w-full" maxLength={20} required />
          </div>

          <div>
            <label className="label">Pilih Avatar</label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map(a => (
                <label key={a} className="cursor-pointer">
                  <input type="radio" name="avatar" value={a} className="peer sr-only" required />
                  <div className="text-3xl p-2 rounded-xl peer-checked:bg-orange-200 peer-checked:ring-2 ring-orange-700 hover:bg-peach transition-colors">
                    {a}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Kelas</label>
            <select name="grade" className="input w-full" required>
              {GRADES.map(g => <option key={g} value={g}>Kelas {g}</option>)}
            </select>
          </div>

          <div className="flex items-start gap-2">
            <input type="checkbox" name="consent" id="consent" className="mt-1" required />
            <label htmlFor="consent" className="text-sm text-ink cursor-pointer">
              Saya memberikan persetujuan sebagai orang tua untuk anak saya menggunakan aplikasi ini dan memahami bahwa data tidak dibagikan ke pihak ketiga.
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-peach/50">
            <button type="button" onClick={() => setIsOpen(false)} className="btn-ghost">Batal</button>
            <button type="submit" disabled={isPending} className="btn-primary">{isPending ? "Menyimpan..." : "Simpan"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
