"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { useEffect, useState } from "react";

import { getCartQuantity, readCart } from "@/lib/cart";

const actionItems = [
  { href: "/products", label: "Хайх", icon: Search },
  { href: "/account", label: "Хэрэглэгч", icon: User },
  { href: "/cart", label: "Сагс", icon: ShoppingBag }
];

type StoreProfile = {
  storeName: string;
  storeLogo: string;
  announcementText: string;
  headerMenu: { id: string; label: string; href: string; isActive: boolean }[];
};

const defaultStoreProfile: StoreProfile = {
  storeName: "MartX",
  storeLogo: "/martx-logo.png",
  announcementText: "MARTX | 200,000₮-С ДЭЭШ ҮНЭТЭЙ ЗАХИАЛГАД ХҮРГЭЛТ ҮНЭГҮЙ",
  headerMenu: [
    { id: "products", label: "Бүх бараа", href: "/products", isActive: true },
    { id: "categories", label: "Ангилал", href: "/categories", isActive: true },
    { id: "new", label: "Шинэ", href: "/products", isActive: true },
    { id: "featured", label: "Онцлох", href: "/products", isActive: true }
  ]
};

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<StoreProfile>(defaultStoreProfile);
  const isCheckout = pathname === "/checkout";
  const isProductDetail = pathname.startsWith("/products/");
  const hideMobileMenu = isCheckout || isProductDetail;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const updateCartQuantity = () => {
      setCartQuantity(getCartQuantity(readCart()));
    };

    updateCartQuantity();
    window.addEventListener("martx-cart-updated", updateCartQuantity);
    window.addEventListener("storage", updateCartQuantity);
    return () => {
      window.removeEventListener("martx-cart-updated", updateCartQuantity);
      window.removeEventListener("storage", updateCartQuantity);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadStoreProfile() {
      try {
        const response = await fetch("/api/settings/store", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as StoreProfile;
        if (active) {
          setProfile(data);
        }
      } catch {
        // Default profile keeps the storefront usable.
      }
    }

    loadStoreProfile();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div className="public-shell border-b border-stone-200 bg-[#f8f6f2] px-4 py-2 text-center text-xs tracking-[0.24em] text-stone-600">
        {profile.announcementText}
      </div>

      <header className="public-shell sticky top-0 z-50 border-b border-stone-200/80 bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 lg:gap-8">
            {hideMobileMenu ? (
              <div className="h-10 w-10 lg:hidden" />
            ) : (
            <button
              type="button"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Цэс"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-600 transition hover:border-stone-300 hover:text-stone-900 lg:hidden"
            >
              <Menu size={18} />
            </button>
            )}

            <nav className="hidden items-center gap-6 text-sm font-medium text-stone-700 lg:flex">
              {profile.headerMenu.filter((item) => item.isActive).map((item) => (
                <Link key={`${item.href}-${item.label}`} href={item.href} className="transition hover:text-black">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-center">
            <div
              className={[
                "relative mx-auto transition-transform duration-500",
                scrolled ? "h-9 w-20 scale-95 sm:h-10 sm:w-24" : "h-12 w-24 scale-100 sm:h-14 sm:w-32"
              ].join(" ")}
            >
              <Image
                src={profile.storeLogo}
                alt={`${profile.storeName} logo`}
                fill
                className={[
                  "object-contain transition-transform duration-500",
                  scrolled ? "scale-90" : "scale-100"
                ].join(" ")}
                priority
                sizes="128px"
              />
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {actionItems.map((item) => {
              const Icon = item.icon;
              const isCart = item.href === "/cart";
              const isSearch = item.href === "/products";

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className={[
                    "relative h-10 w-10 items-center justify-center rounded-full text-stone-600 transition hover:bg-stone-100 hover:text-black",
                    isSearch ? "hidden lg:flex" : "flex"
                  ].join(" ")}
                >
                  <Icon size={18} strokeWidth={1.9} />
                  {isCart && cartQuantity > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
                      {cartQuantity > 99 ? "99+" : cartQuantity}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>

        {mobileMenuOpen && !hideMobileMenu ? (
          <div className="border-t border-stone-100 bg-white px-4 pb-4 lg:hidden">
            <nav className="mx-auto grid max-w-6xl gap-2 pt-3 text-sm font-semibold text-stone-700">
              {profile.headerMenu.filter((item) => item.isActive).map((item) => (
                <Link
                  key={`mobile-${item.href}-${item.label}`}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-2xl bg-stone-50 px-4 py-3 transition active:bg-stone-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        ) : null}
      </header>
    </>
  );
}
