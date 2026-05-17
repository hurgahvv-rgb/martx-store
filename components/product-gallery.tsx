"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export function ProductGallery({
  images,
  title,
  selectedImage
}: {
  images: string[];
  title: string;
  selectedImage?: string;
}) {
  const galleryImages = useMemo(() => images.filter(Boolean), [images]);
  const fallbackImage = galleryImages[0] ?? selectedImage ?? "/martx-logo.png";
  const [activeImage, setActiveImage] = useState(selectedImage ?? fallbackImage);

  useEffect(() => {
    if (selectedImage) {
      setActiveImage(selectedImage);
    }
  }, [selectedImage]);

  return (
    <div className="space-y-4 lg:sticky lg:top-28 lg:w-full">
      <div className="overflow-hidden rounded-[1.2rem] bg-[#f3f0ea]">
        <div className="relative aspect-[1/1.15]">
          <Image src={activeImage} alt={title} fill className="object-cover" />
        </div>
      </div>

      <div className="grid w-full grid-cols-5 gap-3">
        {galleryImages.map((image) => (
          <button
            key={image}
            type="button"
            onClick={() => setActiveImage(image)}
            className={[
              "overflow-hidden rounded-[0.95rem] border bg-[#f3f0ea] transition",
              activeImage === image ? "border-stone-900" : "border-transparent hover:border-stone-300"
            ].join(" ")}
          >
            <div className="relative aspect-square">
              <Image src={image} alt={title} fill className="object-cover" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
