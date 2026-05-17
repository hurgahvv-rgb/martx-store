"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PackageSearch, ShoppingBag, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import { getCartQuantity, readCart } from "@/lib/cart";

const items = [
  { href: "/products", label: "Бараа", icon: PackageSearch },
  { href: "/cart", label: "Сагс", icon: ShoppingBag },
  { href: "/account", label: "Профайл", icon: UserRound }
];

export function MobileAppNav() {
  const pathname = usePathname();
  const [cartQuantity, setCartQuantity] = useState(0);
  const isPurchaseFlow = pathname.startsWith("/products/") || pathname === "/checkout";

  useEffect(() => {
    const updateCartQuantity = () => setCartQuantity(getCartQuantity(readCart()));

    updateCartQuantity();
    window.addEventListener("martx-cart-updated", updateCartQuantity);
    window.addEventListener("storage", updateCartQuantity);

    return () => {
      window.removeEventListener("martx-cart-updated", updateCartQuantity);
      window.removeEventListener("storage", updateCartQuantity);
    };
  }, []);

  if (isPurchaseFlow) {
    return null;
  }

  return (
    <nav className="public-shell fixed inset-x-3 bottom-3 z-50 rounded-[1.35rem] border border-stone-200/80 bg-white/95 px-3 py-2 shadow-[0_18px_45px_-25px_rgba(17,24,39,0.45)] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-3 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isCart = item.href === "/cart";

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold text-stone-600 transition active:bg-stone-100"
            >
              <span className="relative">
                <Icon size={20} strokeWidth={1.9} />
                {isCart && cartQuantity > 0 ? (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
                    {cartQuantity > 99 ? "99+" : cartQuantity}
                  </span>
                ) : null}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
