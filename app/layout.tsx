import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ServiceHighlights } from "@/components/service-highlights";

import "./globals.css";

export const metadata: Metadata = {
  title: "MartX",
  description: "MartX онлайн дэлгүүрийн modern ecommerce эхлэл."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn">
      <body className="min-h-screen font-sans text-ink antialiased">
        <SiteHeader />
        <main>{children}</main>
        <ServiceHighlights />
        <SiteFooter />
      </body>
    </html>
  );
}
