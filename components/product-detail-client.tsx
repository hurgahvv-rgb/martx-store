"use client";

import { useMemo, useState } from "react";

import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import type { Product, ProductDetail } from "@/lib/types";

export function ProductDetailClient({
  product,
  detail,
  selectedImage
}: {
  product: Product;
  detail: ProductDetail;
  selectedImage?: string;
}) {
  const initialVariantImage = useMemo(() => product.variants?.[0]?.image, [product.variants]);
  const [activeImage, setActiveImage] = useState(selectedImage ?? initialVariantImage ?? product.image);

  return (
    <div className="items-start gap-12 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <ProductGallery images={detail.gallery} title={product.name} selectedImage={activeImage} onImageChange={setActiveImage} />
      <ProductPurchasePanel product={product} detail={detail} onVariantImageChange={setActiveImage} />
    </div>
  );
}
