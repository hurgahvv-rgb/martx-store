"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function MainImageManager({ image, productName }: { image: string; productName: string }) {
  const [currentImage, setCurrentImage] = useState(image);

  return (
    <div className="md:col-span-2">
      <input type="hidden" name="currentImage" value={currentImage} />
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Одоогийн үндсэн зураг</p>
      {currentImage ? (
        <div className="relative h-44 w-44 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <Image src={currentImage} alt={productName} fill className="object-cover" sizes="176px" />
          <button
            type="button"
            onClick={() => setCurrentImage("")}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-sm transition hover:bg-red-50"
            aria-label="Үндсэн зураг устгах"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <div className="flex h-44 w-44 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500">
          Үндсэн зураг устсан. Шинэ зураг upload хийнэ.
        </div>
      )}
    </div>
  );
}
