"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="space-y-4 lg:sticky lg:top-28 lg:w-full">
      <div className="overflow-hidden rounded-[1.2rem] bg-[#f3f0ea]">
        <div className="relative aspect-[1/1.15]">
          <Image src={activeImage} alt={title} fill className="object-cover" />
        </div>
      </div>

      <div className="grid w-full grid-cols-5 gap-3">
        {images.map((image) => (
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
