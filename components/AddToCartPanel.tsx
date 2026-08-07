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
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 border border-line px-4 py-2">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">
            <Minus size={14} className="text-bone/60 hover:text-gold" />
          </button>
          <span className="w-6 text-center text-sm">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} aria-label="Increase">
            <Plus size={14} className="text-bone/60 hover:text-gold" />
          </button>
        </div>
        <button
          onClick={handleAdd}
          className="flex-1 bg-gold py-3 text-sm uppercase tracking-wider text-obsidian transition-colors hover:bg-gold-light"
        >
          {added ? "Added ✓" : "Add To Bag"}
        </button>
      </div>
      <Link
        href="/checkout"
        className="block w-full border border-line py-3 text-center text-sm uppercase tracking-wider text-bone/80 transition-colors hover:border-gold hover:text-gold"
        onClick={handleAdd}
      >
        Buy Now
      </Link>
    </div>
  );
}
