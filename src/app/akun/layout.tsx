import { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";

export default function AkunLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-peach flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <Logo className="w-32 h-auto" />
      </div>
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        {children}
      </div>
    </div>
  );
}
