"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import type { Product } from "@/lib/types";
import { Minus, Plus } from "lucide-react";
import Link from "next/link";

export default function AddToCartPanel({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.images[0] || "",
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mt-7 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex h-12 items-center justify-between border border-line px-4 sm:w-32" role="group" aria-label="Quantity selector">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="flex h-10 w-8 items-center justify-center">
            <Minus size={14} className="text-bone/60 hover:text-gold" />
          </button>
          <span className="w-6 text-center text-sm text-parchment" aria-live="polite">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity" className="flex h-10 w-8 items-center justify-center">
            <Plus size={14} className="text-bone/60 hover:text-gold" />
          </button>
        </div>
        <button
          onClick={handleAdd}
          className="h-12 flex-1 bg-gold px-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-obsidian shadow-[0_12px_35px_rgba(185,150,82,0.14)] transition-colors hover:bg-gold-light"
        >
          {added ? "Added ✓" : "Add To Bag"}
        </button>
      </div>
      <Link
        href="/checkout"
        className="block w-full border border-gold/35 py-3.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-gold transition-colors hover:border-gold hover:bg-gold/5 hover:text-gold-light"
        onClick={handleAdd}
      >
        Buy Now
      </Link>
      <p className="sr-only" aria-live="polite">
        {added ? `${qty} item${qty === 1 ? "" : "s"} added to your bag.` : ""}
      </p>
    </div>
  );
}
