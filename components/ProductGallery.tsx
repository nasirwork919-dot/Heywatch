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
      <div className="relative aspect-square overflow-hidden bg-ink">
        <ProductImage
          src={shown[active] || ""}
          alt={alt}
          fill
          priority
          className="object-cover"
        />
      </div>
      {shown.length > 1 && (
        <div className="mt-4 grid grid-cols-6 gap-2">
          {shown.slice(0, 12).map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden bg-ink transition-opacity ${
                active === i ? "ring-1 ring-gold" : "opacity-60 hover:opacity-100"
              }`}
            >
              <ProductImage src={src} alt={`${alt} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
