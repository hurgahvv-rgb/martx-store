"use client";

import {
  ChevronDown,
  CircleHelp,
  Heart,
  Minus,
  PackageCheck,
  Plus,
  RotateCcw,
  Star
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { addCartItem, createCartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/data";
import { Product, ProductDetail } from "@/lib/types";

const infoItems = [
  { key: "shipping", title: "Хүргэлт", icon: PackageCheck },
  { key: "returns", title: "Буцаалт", icon: RotateCcw },
  { key: "warranty", title: "Баталгаа", icon: Heart },
  { key: "help", title: "Тусламж", icon: CircleHelp }
] as const;

export function ProductPurchasePanel({
  product,
  detail
}: {
  product: Product;
  detail: ProductDetail;
}) {
  const router = useRouter();
  const [variant, setVariant] = useState(detail.variants[0] ?? "Standard");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [openItem, setOpenItem] = useState<(typeof infoItems)[number]["key"] | null>("shipping");

  const reviewSummary = useMemo(() => {
    if (detail.reviews.length === 0) {
      return { average: product.rating, count: 12 };
    }

    const total = detail.reviews.reduce((sum, review) => sum + review.rating, 0);
    return {
      average: (total / detail.reviews.length).toFixed(1),
      count: detail.reviews.length
    };
  }, [detail.reviews, product.rating]);

  const infoContent = {
    shipping: detail.shipping,
    returns: detail.returns,
    warranty: detail.warranty,
    help: detail.help
  };

  const handleAddToCart = () => {
    addCartItem(createCartItem(product, variant, quantity));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    addCartItem(createCartItem(product, variant, quantity));
    router.push("/checkout");
  };

  return (
    <div className="space-y-7 self-start">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-stone-500">{product.category}</p>
        <h1 className="text-4xl font-medium text-stone-950 sm:text-5xl">{product.name}</h1>
        <div className="flex items-center gap-3 text-sm text-stone-600">
          <div className="flex items-center gap-1 text-stone-900">
            <Star size={15} className="fill-stone-900 text-stone-900" />
            <span className="font-medium">{reviewSummary.average}</span>
          </div>
          <span>({reviewSummary.count} сэтгэгдэл)</span>
        </div>
        <p className="text-2xl font-semibold text-stone-950">
          {formatPrice(product.price, product.currency)}
        </p>
        <p className="max-w-xl text-base leading-8 text-stone-600">{detail.subtitle}</p>
      </div>

      <div className="space-y-5 border-y border-stone-200 py-6">
        <div>
          <p className="mb-3 text-sm font-medium text-stone-800">Сонголт</p>
          <div className="flex flex-wrap gap-2">
            {detail.variants.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setVariant(item)}
                className={[
                  "rounded-full border px-4 py-2 text-sm transition",
                  variant === item
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-300 text-stone-700 hover:border-stone-900"
                ].join(" ")}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-stone-800">Тоо ширхэг</p>
          <div className="inline-flex items-center rounded-full border border-stone-300">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="flex h-11 w-11 items-center justify-center text-stone-700"
            >
              <Minus size={16} />
            </button>
            <span className="min-w-10 text-center text-sm font-medium text-stone-900">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((value) => value + 1)}
              className="flex h-11 w-11 items-center justify-center text-stone-700"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className="rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            {added ? "Сагсанд нэмэгдлээ" : "Сагсанд нэмэх"}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-900"
          >
            Шууд худалдан авах
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <ul className="space-y-2 text-sm leading-7 text-stone-700">
          {detail.bullets.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
        <p className="text-sm leading-7 text-stone-600">{product.description}</p>
        <ul className="grid gap-2 text-sm leading-7 text-stone-700 sm:grid-cols-2">
          {detail.specs.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>

      <div className="border-t border-stone-200 transition-all duration-300">
        {infoItems.map((item) => {
          const Icon = item.icon;
          const isOpen = openItem === item.key;

          return (
            <div key={item.key} className="border-b border-stone-200">
              <button
                type="button"
                onClick={() => setOpenItem(isOpen ? null : item.key)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} strokeWidth={1.8} className="text-stone-800" />
                  <span className="text-[1.05rem] font-medium text-stone-900">{item.title}</span>
                </div>
                <ChevronDown
                  size={18}
                  className={[
                    "text-stone-500 transition-transform duration-300",
                    isOpen ? "rotate-180" : ""
                  ].join(" ")}
                />
              </button>

              <div
                className={[
                  "grid transition-all duration-300 ease-out",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-70"
                ].join(" ")}
              >
                <div className="overflow-hidden">
                  <div className="pb-5 pl-8 pr-8 text-sm leading-7 text-stone-600">
                    {infoContent[item.key]}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
