"use client";

import { useEffect, useState } from "react";

import { FALLBACK_IMAGE, normalizeImageSrc } from "@/lib/image-src";

type ProductImageProps = {
  src: string | null | undefined;
  alt: string;
  className?: string;
};

export function ProductImage({ src, alt, className = "" }: ProductImageProps) {
  const [currentSrc, setCurrentSrc] = useState(() => normalizeImageSrc(src));

  useEffect(() => {
    setCurrentSrc(normalizeImageSrc(src));
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (currentSrc !== FALLBACK_IMAGE) {
          setCurrentSrc(FALLBACK_IMAGE);
        }
      }}
    />
  );
}
