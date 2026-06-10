import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
