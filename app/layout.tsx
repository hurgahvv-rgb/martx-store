import type { Metadata } from "next";

import { AppChrome } from "@/components/app-chrome";

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
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
