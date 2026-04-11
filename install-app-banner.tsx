"use client";

import { Download, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

function isIos() {
  if (typeof window === "undefined") {
    return false;
  }

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as NavigatorWithStandalone).standalone === true
  );
}

export function InstallAppBanner() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [iosDevice, setIosDevice] = useState(false);

  useEffect(() => {
    if (isStandalone() || window.localStorage.getItem("martx-install-banner-dismissed") === "1") {
      return;
    }

    const onIos = isIos();
    setIosDevice(onIos);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (onIos) {
      const timer = window.setTimeout(() => setVisible(true), 1200);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const dismiss = () => {
    window.localStorage.setItem("martx-install-banner-dismissed", "1");
    setVisible(false);
  };

  const install = async () => {
    if (installEvent) {
      await installEvent.prompt();
      await installEvent.userChoice;
      setInstallEvent(null);
      setVisible(false);
      return;
    }

    setShowIosHelp(true);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="public-shell fixed inset-x-3 bottom-24 z-50 md:bottom-5 md:left-auto md:right-5 md:w-[25rem]">
      <div className="overflow-hidden rounded-[1.4rem] border border-stone-200 bg-stone-950 text-white shadow-2xl shadow-stone-900/25">
        <div className="flex gap-4 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
            <Smartphone size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">MartX app суулгах</h2>
                <p className="mt-1 text-sm leading-5 text-white/70">
                  Дэлгүүрээ утсан дээрээ app шиг хурдан нээгээрэй.
                </p>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Хаах"
                className="rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {showIosHelp || iosDevice ? (
              <div className="mt-3 rounded-2xl bg-white/10 px-3 py-2 text-xs leading-5 text-white/75">
                <p className="font-bold text-white">iPhone дээр шууд татагдахгүй.</p>
                <p>Safari-аар нээгээд доорх Share товчийг дарна.</p>
                <p>Дараа нь “Add to Home Screen” сонгоно.</p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={install}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-stone-950 transition hover:bg-stone-100"
            >
              <Download size={17} />
              {iosDevice ? "iPhone дээр суулгах заавар" : "App суулгах"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
