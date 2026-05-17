"use client";

import { useEffect } from "react";

const CACHE_RESET_KEY = "martx-cache-reset-v1";

export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (window.localStorage.getItem(CACHE_RESET_KEY) === "1") {
      return;
    }

    async function clearOldAppCache() {
      try {
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
        }

        if ("caches" in window) {
          const keys = await window.caches.keys();
          await Promise.all(keys.map((key) => window.caches.delete(key)));
        }

        window.localStorage.setItem(CACHE_RESET_KEY, "1");
      } catch {
        // Cache cleanup should never block the app.
      }
    }

    clearOldAppCache();
  }, []);

  return null;
}
