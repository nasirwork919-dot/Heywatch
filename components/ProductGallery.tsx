"use client";

import ProductImage from "./ProductImage";
import { useState } from "react";

export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const shown = images.length > 0 ? images : [""];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden border border-line/70 bg-[#efede8]">
        <ProductImage
          src={shown[active] || ""}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-contain"
        />
      </div>
      {shown.length > 1 && (
        <div className="mt-4 grid grid-cols-6 gap-2">
          {shown.slice(0, 12).map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${shown.length}`}
              aria-pressed={active === i}
              className={`relative aspect-square overflow-hidden border bg-[#efede8] transition-opacity ${
                active === i ? "border-gold" : "border-line opacity-55 hover:opacity-100"
              }`}
            >
              <ProductImage src={src} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
