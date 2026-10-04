"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const fallbackImage = galleryImages[0] ?? selectedImage ?? "/uursduu-urlaya-logo.svg";
  const [activeImage, setActiveImage] = useState(selectedImage ?? fallbackImage);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setActiveImage(selectedImage ?? fallbackImage);
  }, [fallbackImage, selectedImage]);

  const handleImageSelect = (image: string) => {
    setActiveImage(image);
    onImageChange?.(image);
  };

  const handleStep = (direction: -1 | 1) => {
    if (galleryImages.length < 2) {
      return;
    }

    const currentIndex = Math.max(0, galleryImages.indexOf(activeImage));
    const nextIndex = (currentIndex + direction + galleryImages.length) % galleryImages.length;
    handleImageSelect(galleryImages[nextIndex]);
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
    <div className="space-y-2 lg:sticky lg:top-24 lg:w-full">
      <div className="overflow-hidden bg-[#f3f0ea]">
        <div
          className="relative aspect-[1.08/0.95] touch-pan-y"
          onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)}
          onTouchEnd={(event) => handleSwipeEnd(event.changedTouches[0]?.clientX ?? 0)}
        >
          <ProductImage src={activeImage} alt={title} className="absolute inset-0 h-full w-full object-cover" />
          {galleryImages.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => handleStep(-1)}
                aria-label="Předchozí obrázek"
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/85 text-stone-900 shadow-sm transition hover:bg-white"
              >
                <ChevronLeft size={20} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={() => handleStep(1)}
                aria-label="Další obrázek"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/85 text-stone-900 shadow-sm transition hover:bg-white"
              >
                <ChevronRight size={20} strokeWidth={1.8} />
              </button>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {galleryImages.map((image, index) => (
                  <button
                    key={`dot-${image}-${index}`}
                    type="button"
                    onClick={() => handleImageSelect(image)}
                    aria-label={`Zobrazit obrázek ${index + 1}`}
                    className={[
                      "h-2 rounded-full transition-all",
                      activeImage === image ? "w-4 bg-stone-800" : "w-2 bg-stone-500/45 hover:bg-stone-700"
                    ].join(" ")}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {galleryImages.slice(0, 2).map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => handleImageSelect(image)}
            className={[
              "overflow-hidden border bg-[#f3f0ea] transition",
              activeImage === image ? "border-stone-900" : "border-transparent hover:border-stone-300"
            ].join(" ")}
            aria-label={`Vybrat obrázek ${title}`}
          >
            <div className="relative aspect-[1.06/0.78]">
              <ProductImage src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
