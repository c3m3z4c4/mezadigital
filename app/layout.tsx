import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-display-loaded",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meza Digital — Desarrollo web para tu negocio",
  description:
    "Equipo consultor en tecnologías de la información, diseño y desarrollo web e imagen corporativa. Mejoramos tu experiencia en tecnología.",
  keywords: ["desarrollo web", "consultoría TI", "diseño web", "México", "Meza Digital"],
  openGraph: {
    title: "Meza Digital",
    description: "Mejoramos tu experiencia en tecnología",
    url: "https://mezadigital.com",
    siteName: "Meza Digital",
    locale: "es_MX",
    type: "website",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-theme="light" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <style>{`
          :root {
            --font-display: var(--font-display-loaded, "Playfair Display", Georgia, serif);
            --font-body:    var(--font-body-loaded, "DM Sans", system-ui, sans-serif);
          }
        `}</style>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
