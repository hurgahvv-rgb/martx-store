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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { addCartItem, createCartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/data";
import { Product, ProductDetail } from "@/lib/types";

const infoItems = [
  { key: "shipping", title: "Хүргэлт", icon: PackageCheck, href: "/shipping", linkLabel: "Хүргэлтийн дэлгэрэнгүй мэдээлэл" },
  { key: "returns", title: "Буцаалт", icon: RotateCcw, href: "/returns", linkLabel: "Буцаалтын дэлгэрэнгүй нөхцөл" },
  { key: "warranty", title: "Баталгаа", icon: Heart, href: "/terms", linkLabel: "Баталгааны нөхцөлийг дэлгэрэнгүй харах" },
  { key: "help", title: "Тусламж", icon: CircleHelp, href: "/contact", linkLabel: "Тусламж авах, холбоо барих" }
] as const;

export function ProductPurchasePanel({
  product,
  detail,
  onVariantImageChange
}: {
  product: Product;
  detail: ProductDetail;
  onVariantImageChange?: (image: string) => void;
}) {
  const router = useRouter();
  const variantOptions = product.variants?.length
    ? product.variants.map((item) => {
        const label = [item.color, item.size].filter(Boolean).join(" / ") || item.sku || "Standard";
        return {
          id: item.id,
          label,
          color: item.color,
          size: item.size,
          image: item.image,
          price: item.price ?? product.price,
          stock: item.stock
        };
      })
    : detail.variants.map((item) => ({
        id: undefined,
        label: item,
        color: item,
        size: null,
        image: null,
        price: product.price,
        stock: product.stock ?? 0
      }));
  const hasSelectableVariants =
    (product.variants?.length ?? 0) > 0 || detail.variants.some((item) => item.toLowerCase() !== "standard");
  const [variant, setVariant] = useState(variantOptions[0]?.label ?? "Standard");
  const [variantId, setVariantId] = useState<string | undefined>(variantOptions[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [openItem, setOpenItem] = useState<(typeof infoItems)[number]["key"] | null>(null);

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
    addCartItem(createCartItem(product, hasSelectableVariants ? variant : "Сонголтгүй", quantity, variantId));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    addCartItem(createCartItem(product, hasSelectableVariants ? variant : "Сонголтгүй", quantity, variantId));
    router.push("/checkout");
  };

  const selectedVariant = variantOptions.find((item) => item.label === variant && item.id === variantId) ?? variantOptions[0];
  const displayPrice = selectedVariant?.price ?? product.price;
  const selectedStock = selectedVariant?.stock ?? product.stock ?? 0;

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
        <div className="flex items-center gap-3">
          {product.compareAtPrice && product.compareAtPrice > displayPrice ? (
            <span className="text-lg font-medium text-stone-400 line-through">
              {formatPrice(product.compareAtPrice, product.currency)}
            </span>
          ) : null}
          <span className="text-2xl font-semibold text-stone-950">
            {formatPrice(displayPrice, product.currency)}
          </span>
        </div>
        <p className="max-w-xl text-base leading-8 text-stone-600">{detail.subtitle}</p>
      </div>

      <div className="space-y-5 border-y border-stone-200 py-6">
        {hasSelectableVariants ? (
          <div>
            <p className="mb-3 text-sm font-medium text-stone-800">Сонголт</p>
            <div className="flex flex-wrap gap-2">
              {variantOptions.map((item) => (
                <button
                  key={`${item.id ?? item.label}`}
                  type="button"
                  onClick={() => {
                    setVariant(item.label);
                    setVariantId(item.id);
                    onVariantImageChange?.(item.image || product.image);
                  }}
                  className={[
                    "rounded-full border px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-45",
                    variant === item.label && variantId === item.id
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-300 text-stone-700 hover:border-stone-900"
                  ].join(" ")}
                  disabled={item.stock <= 0}
                >
                  {item.label}
                  {item.stock <= 0 ? " - дууссан" : ""}
                </button>
              ))}
            </div>
            {selectedVariant?.image ? (
              <p className="mt-3 text-xs leading-5 text-stone-500">
                Сонгосон өнгөний зураг preview дээр солигдлоо. Gallery дотор зөвхөн ерөнхий зургууд үлдэнэ.
              </p>
            ) : null}
          </div>
        ) : null}

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
              onClick={() => setQuantity((value) => Math.min(Math.max(selectedStock, 1), value + 1))}
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
            disabled={selectedStock <= 0}
            className="rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-900 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-300"
          >
            {added ? "Сагсанд нэмэгдлээ" : "Сагсанд нэмэх"}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={selectedStock <= 0}
            className="rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            Шууд худалдан авах
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <ul className="space-y-2 text-sm leading-7 text-stone-700">
          {detail.bullets.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-[0.7em] h-1 w-1 shrink-0 rounded-full bg-stone-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm leading-7 text-stone-600">{product.description}</p>
        <ul className="grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
          {detail.specs.map((item) => (
            <li key={item} className="rounded-lg border border-stone-200 bg-white/55 px-3 py-2 leading-6">
              {item}
            </li>
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
                    <p>{infoContent[item.key]}</p>
                    <p className="mt-3">
                      Дэлгэрэнгүй мэдээлэл авах бол{" "}
                      <Link href={item.href} className="font-semibold text-stone-950 underline underline-offset-4 transition hover:text-stone-600">
                        {item.linkLabel}
                      </Link>
                      .
                    </p>
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
