"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { formatPrice } from "@/lib/data";
import { Product } from "@/lib/types";
import { ProductImage } from "@/components/product-image";

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const cardRef = useRef<HTMLAnchorElement | null>(null);
  const [visible, setVisible] = useState(false);
  const href = `/products/${product.slug}`;

  useEffect(() => {
    const element = cardRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.16 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (visible) {
      router.prefetch(href);
    }
  }, [href, router, visible]);

  return (
    <Link
      ref={cardRef}
      href={href}
      onMouseEnter={() => router.prefetch(href)}
      onFocus={() => router.prefetch(href)}
      className={[
        "group block transition-all duration-700",
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      ].join(" ")}
    >
      <div className="overflow-hidden rounded-[2rem] bg-[#f4f1eb]">
        <div className="relative aspect-[4/4.8] overflow-hidden">
          <ProductImage
            src={product.image}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
          />
        </div>
      </div>

      <div className="space-y-2 px-1 pb-2 pt-5 text-stone-800">
        <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">{product.category}</p>
        <h3 className="text-lg font-medium text-stone-900">{product.name}</h3>
        <p className="line-clamp-2 text-sm leading-6 text-stone-600">{product.description}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold text-stone-900">
            {formatPrice(product.price, product.currency)}
          </span>
          <span className="text-sm text-stone-500 transition group-hover:text-stone-900">Дэлгэрэнгүй</span>
        </div>
      </div>
    </Link>
  );
}
