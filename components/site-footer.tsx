"use client";

import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { useEffect, useState } from "react";

import { defaultStoreSettings, type MenuLinkSetting } from "@/lib/store-settings";

type FooterSettings = {
  contactPhone: string;
  contactEmail: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  footerText: string;
  footerMenu: MenuLinkSetting[];
};

const defaultFooterSettings: FooterSettings = {
  contactPhone: defaultStoreSettings.contactPhone,
  contactEmail: defaultStoreSettings.contactEmail,
  facebookUrl: defaultStoreSettings.facebookUrl,
  instagramUrl: defaultStoreSettings.instagramUrl,
  youtubeUrl: defaultStoreSettings.youtubeUrl,
  footerText: defaultStoreSettings.footerText,
  footerMenu: defaultStoreSettings.footerMenu
};

function normalizeFooterSettings(data: Partial<FooterSettings>): FooterSettings {
  return {
    ...defaultFooterSettings,
    ...data,
    contactPhone: data.contactPhone || defaultFooterSettings.contactPhone,
    contactEmail: data.contactEmail || defaultFooterSettings.contactEmail,
    footerText: data.footerText || defaultFooterSettings.footerText,
    footerMenu: Array.isArray(data.footerMenu) && data.footerMenu.length > 0 ? data.footerMenu : defaultFooterSettings.footerMenu
  };
}

export function SiteFooter() {
  const [settings, setSettings] = useState<FooterSettings>(defaultFooterSettings);
  const footerLinks = settings.footerMenu.filter((item) => item.isActive);
  const socialLinks = [
    { href: settings.facebookUrl, label: "Facebook", icon: Facebook },
    { href: settings.instagramUrl, label: "Instagram", icon: Instagram },
    { href: settings.youtubeUrl, label: "YouTube", icon: Youtube }
  ].filter((item) => item.href && item.href !== "#");

  useEffect(() => {
    let active = true;

    async function loadFooterSettings() {
      try {
        const response = await fetch("/api/settings/store", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as Partial<FooterSettings>;
        if (active) {
          setSettings(normalizeFooterSettings(data));
        }
      } catch {
        // Default footer keeps the storefront usable.
      }
    }

    loadFooterSettings();

    return () => {
      active = false;
    };
  }, []);

  return (
    <footer className="public-shell border-t border-stone-200 bg-white text-stone-700">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-3xl font-medium text-stone-950">Холбоосууд</h3>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-10 gap-y-2 text-sm text-stone-500">
            <span>Утас : {settings.contactPhone}</span>
            <span>{settings.contactEmail}</span>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-stone-600">
            {footerLinks.map((item) => (
              <Link key={item.label} href={item.href} className="transition hover:text-stone-950">
                {item.label}
              </Link>
            ))}
          </div>

          {socialLinks.length > 0 ? (
          <div className="mt-8 flex items-center justify-center gap-4">
            {socialLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-700 transition hover:border-stone-900 hover:text-stone-950"
                >
                  <Icon size={18} strokeWidth={1.8} />
                </Link>
              );
            })}
          </div>
          ) : null}
        </div>
      </div>

      <div className="bg-black px-4 py-5 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-center">
          <p className="text-center text-sm font-medium text-white/75">
            {settings.footerText}
          </p>
        </div>
      </div>
    </footer>
  );
}
