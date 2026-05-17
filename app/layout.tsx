import type { Metadata } from "next";
import Script from "next/script";

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
      <head>
        <Script id="client-error-reporter" strategy="beforeInteractive">
          {`
            (function () {
              function report(payload) {
                try {
                  var body = JSON.stringify(Object.assign({
                    href: location.href,
                    userAgent: navigator.userAgent
                  }, payload));
                  if (navigator.sendBeacon) {
                    navigator.sendBeacon("/api/client-error", new Blob([body], { type: "application/json" }));
                    return;
                  }
                  fetch("/api/client-error", { method: "POST", headers: { "content-type": "application/json" }, body: body, keepalive: true }).catch(function () {});
                } catch (error) {}
              }

              window.addEventListener("error", function (event) {
                report({
                  message: event.message,
                  stack: event.error && event.error.stack,
                  source: event.filename,
                  lineno: event.lineno,
                  colno: event.colno
                });
              });

              window.addEventListener("unhandledrejection", function (event) {
                var reason = event.reason || {};
                report({
                  message: reason.message || String(reason),
                  stack: reason.stack
                });
              });
            })();
          `}
        </Script>
      </head>
      <body className="min-h-screen font-sans text-ink antialiased">
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
