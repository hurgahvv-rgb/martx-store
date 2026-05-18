"use client";

import { useEffect, useMemo, useState } from "react";

import { ProductImage } from "@/components/product-image";

export function ProductGallery({
  images,
  title,
  selectedImage,
  onImageChange
}: {
  images: string[];
  title: string;
  selectedImage?: string;
  onImageChange?: (image: string) => void;
}) {
  const galleryImages = useMemo(() => images.filter(Boolean), [images]);
  const fallbackImage = galleryImages[0] ?? selectedImage ?? "/martx-logo.png";
  const [activeImage, setActiveImage] = useState(selectedImage ?? fallbackImage);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setActiveImage(selectedImage ?? fallbackImage);
  }, [fallbackImage, selectedImage]);

  const handleImageSelect = (image: string) => {
    setActiveImage(image);
    onImageChange?.(image);
  };

  const handleSwipeEnd = (touchEndX: number) => {
    if (touchStartX === null || galleryImages.length < 2) {
      setTouchStartX(null);
      return;
    }

    const deltaX = touchStartX - touchEndX;

    if (Math.abs(deltaX) < 42) {
      setTouchStartX(null);
      return;
    }

    const currentIndex = Math.max(0, galleryImages.indexOf(activeImage));
    const nextIndex =
      deltaX > 0
        ? Math.min(currentIndex + 1, galleryImages.length - 1)
        : Math.max(currentIndex - 1, 0);

    handleImageSelect(galleryImages[nextIndex]);
    setTouchStartX(null);
  };

  return (
    <div className="space-y-4 lg:sticky lg:top-28 lg:w-full">
      <div className="overflow-hidden rounded-[1.2rem] bg-[#f3f0ea]">
        <div
          className="relative aspect-[1/1.15] touch-pan-y"
          onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)}
          onTouchEnd={(event) => handleSwipeEnd(event.changedTouches[0]?.clientX ?? 0)}
        >
          <ProductImage src={activeImage} alt={title} className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </div>

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:w-full sm:grid-cols-5 sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {galleryImages.map((image) => (
          <button
            key={image}
            type="button"
            onClick={() => handleImageSelect(image)}
            className={[
              "shrink-0 basis-20 overflow-hidden rounded-[0.95rem] border bg-[#f3f0ea] transition sm:basis-auto",
              activeImage === image ? "border-stone-900" : "border-transparent hover:border-stone-300"
            ].join(" ")}
            aria-label={`${title} зураг сонгох`}
          >
            <div className="relative aspect-square">
              <ProductImage src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
