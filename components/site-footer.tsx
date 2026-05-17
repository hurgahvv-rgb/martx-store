import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";

import { getStoreSettings } from "@/lib/store-settings";

export async function SiteFooter() {
  const settings = await getStoreSettings();
  const footerLinks = settings.footerMenu.filter((item) => item.isActive);
  const socialLinks = [
    { href: settings.facebookUrl, label: "Facebook", icon: Facebook },
    { href: settings.instagramUrl, label: "Instagram", icon: Instagram },
    { href: settings.youtubeUrl, label: "YouTube", icon: Youtube }
  ].filter((item) => item.href && item.href !== "#");

  return (
    <footer className="public-shell border-t border-stone-200 bg-white text-stone-700">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-3xl font-medium text-stone-950">Холбоосууд</h3>
          <p className="mt-3 text-sm text-stone-500">
            {settings.contactPhone} · {settings.contactEmail}
          </p>

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
