"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function GalleryImageManager({ images, productName }: { images: string[]; productName: string }) {
  const [keptImages, setKeptImages] = useState(images);

  const removeImage = (image: string) => {
    setKeptImages((current) => current.filter((item) => item !== image));
  };

  if (keptImages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 xl:col-span-4">
        Gallery зураг алга. &quot;Нэмэлт зураг нэмэх&quot; дээрээс шинээр upload хийнэ.
      </div>
    );
  }

  return (
    <div className="xl:col-span-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Gallery зураг</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {keptImages.map((image) => (
          <div key={image} className="overflow-hidden rounded-lg border border-slate-200 bg-white p-2">
            <input type="hidden" name="keepGalleryImages" value={image} />
            <div className="relative aspect-square overflow-hidden rounded-md bg-slate-100">
              <Image src={image} alt={productName} fill className="object-cover" sizes="120px" />
              <button
                type="button"
                onClick={() => removeImage(image)}
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-sm transition hover:bg-red-50"
                aria-label="Gallery зураг устгах"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
