"use client";

import { useState } from "react";
import { resetChildPin, deleteChild, updateChildSettings } from "@/app/dashboard/actions";
import { useRouter } from "next/navigation";

export default function ChildSettings({ child, isParent }: { child: any, isParent: boolean }) {
  const router = useRouter();
  const [newPin, setNewPin] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleResetPin() {
    if (confirm("Reset PIN anak?")) {
      const pin = await resetChildPin(child.id);
      setNewPin(pin);
    }
  }

  async function handleDelete() {
    if (confirm("HAPUS PERMANEN data anak ini? Data tidak dapat dikembalikan.")) {
      setIsDeleting(true);
      await deleteChild(child.id);
      router.push("/dashboard");
    }
  }

  async function handleUpdateLimit(e: React.ChangeEvent<HTMLSelectElement>) {
    setIsUpdating(true);
    const val = e.target.value;
    await updateChildSettings(child.id, { dailyLimitMin: val ? parseInt(val) : null, soundOn: child.soundOn });
    setIsUpdating(false);
  }

  async function handleUpdateSound(e: React.ChangeEvent<HTMLInputElement>) {
    setIsUpdating(true);
    await updateChildSettings(child.id, { dailyLimitMin: child.dailyLimitMin, soundOn: e.target.checked });
    setIsUpdating(false);
  }

  return (
    <div className="space-y-6">
      {newPin && (
        <div className="bg-orange-100 p-4 rounded-xl text-center">
          <p className="text-orange-700 font-bold mb-2">PIN Baru (Catat sekarang!):</p>
          <div className="text-4xl font-mono tracking-widest text-navy">{newPin}</div>
          <button onClick={() => setNewPin(null)} className="mt-2 text-sm text-ink underline">Tutup</button>
        </div>
      )}

      {isParent && (
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-navy">Batas Waktu Belajar Harian</div>
            <div className="text-sm text-ink">Batas waktu sebelum anak dikunci sementara</div>
          </div>
          <select 
            disabled={isUpdating} 
            value={child.dailyLimitMin || ""} 
            onChange={handleUpdateLimit}
            className="input"
          >
            <option value="">Tanpa Batas</option>
            <option value="15">15 Menit</option>
            <option value="30">30 Menit</option>
            <option value="45">45 Menit</option>
            <option value="60">60 Menit</option>
          </select>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold text-navy">Suara Aplikasi</div>
          <div className="text-sm text-ink">Aktifkan atau nonaktifkan efek suara</div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={child.soundOn} onChange={handleUpdateSound} disabled={isUpdating} className="sr-only peer" />
          <div className="w-11 h-6 bg-peach rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-leaf-700"></div>
        </label>
      </div>

      <div className="pt-4 border-t border-peach flex flex-wrap gap-4">
        <button onClick={handleResetPin} className="btn-ghost border border-peach text-sm">
          Reset PIN
        </button>
        <a href={`/api/export/anak/${child.id}`} download className="btn-ghost border border-peach text-sm inline-block">
          Export Data JSON
        </a>
        {isParent && (
          <button onClick={handleDelete} disabled={isDeleting} className="btn-ghost text-orange-700 border border-orange-700/30 text-sm">
            {isDeleting ? "Menghapus..." : "Hapus Data Anak"}
          </button>
        )}
      </div>
    </div>
  );
}
