import { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { requireAdult } from "@/lib/session";
import { logout } from "../akun/actions";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireAdult();

  return (
    <div className="min-h-screen bg-peach/30 flex flex-col font-sans">
      <header className="bg-white border-b border-peach px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Logo className="w-24 h-auto" />
          <span className="text-ink text-sm font-medium hidden sm:inline-block">
            Dashboard {user.role === "PARENT" ? "Orang Tua" : "Guru"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-bold text-navy">{user.name}</div>
            <div className="text-xs text-ink">{user.role === "PARENT" ? "Orang Tua" : "Guru"}</div>
          </div>
          <form action={logout}>
            <button className="btn-ghost text-sm py-1 px-3">Keluar</button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
