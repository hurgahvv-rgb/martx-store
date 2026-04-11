"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { useEffect, useState } from "react";

import { getCartQuantity, readCart } from "@/lib/cart";

const navItems = [
  { href: "/products", label: "Бүх бараа" },
  { href: "/categories", label: "Ангилал" },
  { href: "/products", label: "Шинэ" },
  { href: "/products", label: "Онцлох" }
];

const actionItems = [
  { href: "/products", label: "Хайх", icon: Search },
  { href: "/account", label: "Хэрэглэгч", icon: User },
  { href: "/cart", label: "Сагс", icon: ShoppingBag }
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);

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

  return (
    <>
      <div className="public-shell border-b border-stone-200 bg-[#f8f6f2] px-4 py-2 text-center text-xs tracking-[0.24em] text-stone-600">
        MARTX | 200,000₮-С ДЭЭШ ҮНЭТЭЙ ЗАХИАЛГАД ХҮРГЭЛТ ҮНЭГҮЙ
      </div>

      <header className="public-shell sticky top-0 z-50 border-b border-stone-200/80 bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 lg:gap-8">
            <button
              type="button"
              aria-label="Цэс"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-600 transition hover:border-stone-300 hover:text-stone-900 lg:hidden"
            >
              <Menu size={18} />
            </button>

            <nav className="hidden items-center gap-6 text-sm font-medium text-stone-700 lg:flex">
              {navItems.map((item) => (
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
                scrolled ? "h-10 w-24 scale-95" : "h-14 w-32 scale-100"
              ].join(" ")}
            >
              <Image
                src="/martx-logo.png"
                alt="MartX logo"
                fill
                className={[
                  "object-contain transition-transform duration-500",
                  scrolled ? "scale-90" : "scale-100"
                ].join(" ")}
                priority
              />
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {actionItems.map((item) => {
              const Icon = item.icon;
              const isCart = item.href === "/cart";

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full text-stone-600 transition hover:bg-stone-100 hover:text-black"
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
      </header>
    </>
  );
}
