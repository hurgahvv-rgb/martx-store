"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CART_OPEN_EVENT, CartItem, readCart, writeCart } from "@/lib/cart";
import { formatPrice } from "@/lib/data";

function matchesCartItem(left: CartItem, right: CartItem) {
  return left.productId === right.productId && (left.variantId ? left.variantId === right.variantId : left.variant === right.variant);
}

export function CartDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const isCheckout = pathname === "/checkout";
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  const syncCart = () => {
    setItems(readCart());
  };

  useEffect(() => {
    syncCart();

    const handleCartUpdate = () => syncCart();
    const handleOpen = () => {
      syncCart();
      if (!isCheckout) {
        setOpen(true);
      }
    };

    window.addEventListener("martx-cart-updated", handleCartUpdate);
    window.addEventListener(CART_OPEN_EVENT, handleOpen);
    window.addEventListener("storage", handleCartUpdate);

    return () => {
      window.removeEventListener("martx-cart-updated", handleCartUpdate);
      window.removeEventListener(CART_OPEN_EVENT, handleOpen);
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, [isCheckout]);

  useEffect(() => {
    if (isCheckout) {
      setOpen(false);
    }
  }, [isCheckout]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const saveCart = (nextItems: CartItem[]) => {
    setItems(nextItems);
    writeCart(nextItems);
  };

  const updateQuantity = (item: CartItem, quantity: number) => {
    const nextQuantity = Math.max(0, Math.min(99, quantity));
    const nextItems = items
      .map((cartItem) => (matchesCartItem(cartItem, item) ? { ...cartItem, quantity: nextQuantity } : cartItem))
      .filter((cartItem) => cartItem.quantity > 0);

    saveCart(nextItems);
  };

  const removeItem = (item: CartItem) => {
    saveCart(items.filter((cartItem) => !matchesCartItem(cartItem, item)));
  };

  const goToCheckout = () => {
    if (items.length === 0) {
      return;
    }

    setOpen(false);
    router.push("/checkout");
  };

  if (isCheckout) {
    return null;
  }

  return (
    <>
      <div
        className={[
          "fixed inset-0 z-[80] bg-stone-950/45 backdrop-blur-[1px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        ].join(" ")}
        onClick={() => setOpen(false)}
      />
      <aside
        className={[
          "fixed right-0 top-0 z-[90] flex h-dvh w-full max-w-[420px] flex-col bg-[#fbfaf7] shadow-2xl shadow-stone-950/25 transition-transform duration-300 sm:max-w-[460px]",
          open ? "translate-x-0" : "translate-x-full"
        ].join(" ")}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
          <div>
            <p className="text-xl font-semibold text-stone-950">Košík</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">{items.length} položek</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition hover:border-stone-400 hover:text-stone-950"
            aria-label="Zavřít košík"
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length > 0 ? (
            <div className="space-y-5">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId ?? item.variant}`} className="grid grid-cols-[84px_1fr] gap-4">
                  <div className="relative h-28 overflow-hidden rounded-xl bg-stone-100">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="84px" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="line-clamp-2 text-sm font-semibold leading-6 text-stone-950">{item.name}</p>
                        <p className="mt-1 text-xs text-stone-500">{item.variant}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item)}
                        className="text-stone-400 transition hover:text-red-600"
                        aria-label="Odebrat z košíku"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center border border-stone-200 bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item, item.quantity - 1)}
                          className="flex h-9 w-9 items-center justify-center text-stone-600"
                          aria-label="Snížit množství"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-8 text-center text-sm font-medium text-stone-950">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item, item.quantity + 1)}
                          className="flex h-9 w-9 items-center justify-center text-stone-600"
                          aria-label="Zvýšit množství"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-stone-950">{formatPrice(item.price * item.quantity, item.currency)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <p className="text-lg font-semibold text-stone-950">Košík je prázdný</p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-stone-500">Vyberte si produkt a přidejte ho do košíku.</p>
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className="mt-6 rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white"
              >
                Zobrazit produkty
              </Link>
            </div>
          )}
        </div>

        <div className="border-t border-stone-200 bg-white px-6 py-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Mezisoučet</p>
              <p className="mt-1 text-xs text-stone-500">Doprava se vypočítá v pokladně</p>
            </div>
            <p className="text-2xl font-semibold text-stone-950">{formatPrice(subtotal, items[0]?.currency ?? "MNT")}</p>
          </div>
          <button
            type="button"
            onClick={goToCheckout}
            disabled={items.length === 0}
            className="w-full bg-stone-950 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
          >
            Pokračovat k objednávce
          </button>
        </div>
      </aside>
    </>
  );
}
