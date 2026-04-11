import type { Metadata } from "next";

import { InstallAppBanner } from "@/components/install-app-banner";
import { MobileAppNav } from "@/components/mobile-app-nav";
import { PwaRegister } from "@/components/pwa-register";
import { ServiceHighlights } from "@/components/service-highlights";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: "MartX",
  description: "MartX онлайн дэлгүүрийн modern ecommerce эхлэл.",
  manifest: "/manifest.webmanifest",
  applicationName: "MartX",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MartX"
  },
  icons: {
    icon: "/martx-app-icon.svg",
    apple: "/martx-app-icon.svg"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn">
      <body className="min-h-screen font-sans text-ink antialiased">
        <PwaRegister />
        <SiteHeader />
        <main>{children}</main>
        <ServiceHighlights />
        <SiteFooter />
        <InstallAppBanner />
        <MobileAppNav />
      </body>
    </html>
  );
}
