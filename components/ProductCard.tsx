"use client";

import Link from "next/link";
import ProductImage from "./ProductImage";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/products";
import { useCart } from "@/store/cart";
import { ShoppingBag } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const [hover, setHover] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const img1 = product.images[0];
  const img2 = product.images[1] || img1;

  return (
    <div
      className="group relative flex flex-col"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-ink">
          {img1 && (
            <ProductImage
              src={hover ? img2 : img1}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </Link>

      <div className="mt-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-widest2 text-gold/80">
            {product.brand}
          </p>
          <Link href={`/product/${product.slug}`}>
            <h3 className="mt-1 line-clamp-2 font-display text-[15px] leading-snug text-parchment hover:text-gold transition-colors">
              {product.model || product.name}
            </h3>
          </Link>
          <p className="mt-2 text-sm text-bone/90">
            {formatPrice(product.price, product.currency)}
          </p>
        </div>

        <button
          aria-label="Add to bag"
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
          }}
          className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-line text-bone/70 transition-colors hover:border-gold hover:text-gold"
        >
          <ShoppingBag size={15} />
        </button>
      </div>
    </div>
  );
}
