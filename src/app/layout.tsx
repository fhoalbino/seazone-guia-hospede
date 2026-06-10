import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/organisms/SiteHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display serifado para títulos (visual editorial/hospitalidade).
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: "Guia Digital do Hóspede · Seazone",
  description:
    "Guia digital por imóvel: acesso, WiFi, regras e experiências locais geradas por IA.",
  openGraph: {
    title: "Guia Digital do Hóspede · Seazone",
    description:
      "Guia digital por imóvel: acesso, WiFi, regras e experiências locais geradas por IA.",
    siteName: "Seazone · Guia do Hóspede",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guia Digital do Hóspede · Seazone",
    description:
      "Guia digital por imóvel: acesso, WiFi, regras e experiências locais geradas por IA.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
