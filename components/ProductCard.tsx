"use client";

import Link from "next/link";
import ProductImage from "./ProductImage";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/store/cart";
import { ShoppingBag } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const [hover, setHover] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const img1 = product.images[0];
  const img2 = product.images[1] || img1;

  return (
    <article
      className="group relative flex min-w-0 flex-col [contain-intrinsic-size:0_500px] [content-visibility:auto]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setHover(true)}
      onBlurCapture={() => setHover(false)}
    >
      <Link href={`/product/${product.slug}`} className="block overflow-hidden border border-line/70 bg-[#efede8]">
        <div className="relative aspect-square overflow-hidden">
          <ProductImage
            src={(hover ? img2 : img1) || ""}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="absolute left-3 top-3 border border-black/10 bg-white/90 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#281f1d]/65 backdrop-blur-sm">
            Curated
          </span>
        </div>
      </Link>

      <div className="mt-4 flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-gold/80">
            {product.brand}
          </p>
          <Link href={`/product/${product.slug}`}>
            <h3 className="mt-1.5 line-clamp-2 text-[13px] font-medium leading-relaxed text-parchment transition-colors hover:text-gold-light sm:text-sm">
              {product.name}
            </h3>
          </Link>
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm font-medium">
            <span className="text-bone/85">{formatPrice(product.price, product.currency)}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-bone/35 line-through">{formatPrice(product.compareAtPrice, product.currency)}</span>
            )}
          </div>
        </div>

        <button
          aria-label={`Add ${product.name} to bag`}
          onClick={(e) => {
            e.preventDefault();
            addItem({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              brand: product.brand,
              price: product.price,
              image: product.images[0] || "",
            });
            setAdded(true);
            window.setTimeout(() => setAdded(false), 1600);
          }}
          className="mt-0.5 flex h-9 flex-shrink-0 items-center justify-center gap-2 rounded-full border border-line px-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-bone/65 transition-colors hover:border-gold/70 hover:bg-gold hover:text-obsidian"
        >
          <ShoppingBag size={13} />
          <span className="hidden xl:inline">{added ? "Added" : "Add"}</span>
        </button>
      </div>
    </article>
  );
}
