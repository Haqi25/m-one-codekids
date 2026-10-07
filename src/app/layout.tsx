import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({ subsets: ["latin"], variable: "--font-baloo", weight: ["500", "600", "700", "800"] });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  title: {
    default: "CodeKids: Belajar Coding Seru untuk Anak SD",
    template: "%s · CodeKids",
  },
  description:
    "Belajar coding sambil bermain, ditemani Bibi AI yang sabar, dan dipantau orang tua dan guru. Sequencing, Looping, dan IF-ELSE lewat misi Matematika & IPA.",
  applicationName: "CodeKids",
};

export const viewport: Viewport = {
  themeColor: "#FFF1E3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${baloo.variable} ${nunito.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}

