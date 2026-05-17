"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { CartItem, readCart, writeCart } from "@/lib/cart";
import { formatPrice } from "@/lib/data";

const shippingFee = 12000;

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setCartItems(readCart());
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = cartItems.length > 0 ? subtotal + shippingFee : 0;

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    writeCart(items);
  };

  const updateQuantity = (item: CartItem, quantity: number) => {
    const nextItems = cartItems
      .map((cartItem) =>
        cartItem.productId === item.productId &&
        (cartItem.variantId ? cartItem.variantId === item.variantId : cartItem.variant === item.variant)
          ? { ...cartItem, quantity }
          : cartItem
      )
      .filter((cartItem) => cartItem.quantity > 0);

    saveCart(nextItems);
  };

  const removeItem = (item: CartItem) => {
    const nextItems = cartItems.filter(
      (cartItem) =>
        !(
          cartItem.productId === item.productId &&
          (cartItem.variantId ? cartItem.variantId === item.variantId : cartItem.variant === item.variant)
        )
    );

    saveCart(nextItems);
  };

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold text-ink">Таны сагс</h1>
        <div className="space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div
                key={`${item.productId}-${item.variantId ?? item.variant}`}
                className="glass-panel grid gap-4 rounded-[1.5rem] p-5 sm:grid-cols-[96px_1fr_auto]"
              >
                <div className="relative h-24 overflow-hidden rounded-2xl bg-stone-100">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.category}</p>
                  <p className="mt-2 text-lg font-semibold text-ink">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-500">Сонголт: {item.variant}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center rounded-full border border-stone-200 bg-white">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item, item.quantity - 1)}
                        className="h-9 px-4 text-stone-600"
                      >
                        -
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item, item.quantity + 1)}
                        className="h-9 px-4 text-stone-600"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item)}
                      className="inline-flex h-9 items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 text-sm font-medium text-red-600 transition hover:border-red-200 hover:bg-red-100"
                    >
                      <Trash2 size={15} />
                      Устгах
                    </button>
                  </div>
                </div>
                <p className="text-base font-semibold text-pine">
                  {formatPrice(item.price * item.quantity, item.currency)}
                </p>
              </div>
            ))
          ) : (
            <div className="glass-panel rounded-[2rem] p-8 text-center">
              <p className="text-lg font-semibold text-ink">Сагс хоосон байна</p>
              <p className="mt-2 text-sm text-slate-600">Та бүтээгдэхүүн сонгоод сагсанд нэмээрэй.</p>
              <Link
                href="/products"
                className="mt-6 inline-flex rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white"
              >
                Бараа үзэх
              </Link>
            </div>
          )}
        </div>
      </div>

      <aside className="glass-panel h-fit rounded-[2rem] p-6">
        <p className="section-title text-sm text-slate-500">Захиалгын дүн</p>
        <div className="mt-6 space-y-4 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Барааны дүн</span>
            <span>{formatPrice(subtotal, "MNT")}</span>
          </div>
          <div className="flex justify-between">
            <span>Хүргэлт</span>
            <span>{cartItems.length > 0 ? formatPrice(shippingFee, "MNT") : formatPrice(0, "MNT")}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-4 text-base font-semibold text-ink">
            <span>Нийт</span>
            <span>{formatPrice(total, "MNT")}</span>
          </div>
        </div>
        <Link
          href="/checkout"
          className={[
            "mt-6 inline-flex w-full justify-center rounded-full px-6 py-3 text-sm font-semibold shadow-card",
            cartItems.length > 0 ? "bg-pine text-white" : "pointer-events-none bg-slate-200 text-slate-400"
          ].join(" ")}
        >
          Төлбөр хэсэг рүү
        </Link>
      </aside>
    </section>
  );
}
