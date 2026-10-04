import type { Metadata } from "next";
import Script from "next/script";

import { AppChrome } from "@/components/app-chrome";

import "./globals.css";

export const metadata: Metadata = {
  title: "NaRa",
  description: "Ručně vyráběné kožené kabelky a doplňky.",
  applicationName: "NaRa",
  icons: {
    icon: "/nara-logo.svg"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="cs">
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
        <Script id="remove-pwa-registration" strategy="afterInteractive">
          {`
            (function () {
              if (!("serviceWorker" in navigator)) return;

              navigator.serviceWorker.getRegistrations()
                .then(function (registrations) {
                  registrations.forEach(function (registration) {
                    registration.unregister();
                  });
                })
                .catch(function () {});

              if ("caches" in window) {
                caches.keys()
                  .then(function (keys) {
                    keys.forEach(function (key) {
                      if (key.indexOf("martx-store") === 0) {
                        caches.delete(key);
                      }
                    });
                  })
                  .catch(function () {});
              }
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
