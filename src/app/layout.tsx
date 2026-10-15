import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({ subsets: ["latin"], variable: "--font-baloo", weight: ["500", "600", "700", "800"] });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://peserta39.m1sec.my.id"),
  title: {
    default: "CodeKids: Belajar Coding Seru untuk Anak SD",
    template: "%s · CodeKids",
  },
  description:
    "Belajar coding sambil bermain, ditemani Bibi AI yang sabar, dan dipantau orang tua dan guru. Sequencing, Looping, dan IF-ELSE lewat misi Matematika & IPA.",
  applicationName: "CodeKids",
  keywords: [
    "belajar coding anak",
    "coding anak sd",
    "belajar pemrograman dasar",
    "bibi ai",
    "codekids",
    "edukasi coding indonesia",
    "block coding",
    "scratch anak",
  ],
  authors: [{ name: "CodeKids Team" }],
  creator: "CodeKids",
  publisher: "CodeKids",
  verification: {
    google: "RYSEv0e4va8pyR4ZyQiNaEnYK4wIGTC_spVgjrjhYLo",
  },
  openGraph: {
    title: "CodeKids: Belajar Coding Seru untuk Anak SD",
    description:
      "Platform belajar coding interaktif berbasis blok untuk anak SD usia 7-12 tahun dengan pendamping AI ramah anak (Bibi).",
    url: "https://peserta39.m1sec.my.id",
    siteName: "CodeKids",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeKids: Belajar Coding Seru untuk Anak SD",
    description:
      "Platform belajar coding interaktif berbasis blok untuk anak SD usia 7-12 tahun dengan pendamping AI ramah anak (Bibi).",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml" },
    ],
  },
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

