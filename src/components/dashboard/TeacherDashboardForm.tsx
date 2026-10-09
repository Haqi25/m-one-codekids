"use client";

import { useActionState, useState } from "react";
import { addClass } from "@/app/dashboard/actions";

export default function TeacherDashboardForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(addClass, null);

  if (!isOpen) {
    return <button onClick={() => setIsOpen(true)} className="btn-primary">+ Buat Kelas</button>;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-2xl max-w-md w-full">
        <h3 className="text-xl font-bold text-navy mb-4">Buat Kelas Baru</h3>
        <form action={formAction} className="space-y-4" onSubmit={() => { if(state?.success) setIsOpen(false); }}>
          {state?.error && <div className="text-orange-700 bg-orange-100 p-2 rounded text-sm">{state.error}</div>}
          
          <div>
            <label className="label">Nama Kelas</label>
            <input type="text" name="name" className="input w-full" required placeholder="Contoh: Kelas 3A Coding" />
          </div>

          <div className="flex items-start gap-2">
            <input type="checkbox" name="consent" id="consent_teacher" className="mt-1" required />
            <label htmlFor="consent_teacher" className="text-sm text-ink cursor-pointer">
              Saya mengonfirmasi bahwa saya memiliki izin dari pihak sekolah/orang tua untuk membuat kelas ini.
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
