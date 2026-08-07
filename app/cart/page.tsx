"use client";

import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/products";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-3xl text-parchment">Your bag is empty</h1>
        <p className="mt-4 text-bone/60">Browse the collection to find your next timepiece.</p>
        <Link
          href="/shop"
          className="mt-8 inline-block bg-gold px-8 py-3 text-sm uppercase tracking-wider text-obsidian hover:bg-gold-light"
        >
          Shop All Watches
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-14 lg:px-10">
      <h1 className="mb-10 font-display text-4xl text-parchment">Your Bag</h1>

      <div className="divide-y divide-line border-y border-line">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-6 py-6">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden bg-ink">
              {item.image && (
                <ProductImage src={item.image} alt={item.name} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-widest2 text-gold/80">{item.brand}</p>
              <Link href={`/product/${item.slug}`} className="text-sm text-parchment hover:text-gold">
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-bone/60">{formatPrice(item.price)}</p>
            </div>
            <div className="flex items-center gap-3 border border-line px-3 py-2">
              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                <Minus size={14} className="text-bone/60 hover:text-gold" />
              </button>
              <span className="w-4 text-center text-sm">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                <Plus size={14} className="text-bone/60 hover:text-gold" />
              </button>
            </div>
            <p className="w-24 text-right text-sm text-parchment">
              {formatPrice(item.price * item.quantity)}
            </p>
            <button onClick={() => removeItem(item.productId)} className="text-bone/40 hover:text-bordeaux">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-end gap-4">
        <div className="flex w-full max-w-xs justify-between text-lg">
          <span className="text-bone/70">Subtotal</span>
          <span className="text-parchment">{formatPrice(totalPrice())}</span>
        </div>
        <Link
          href="/checkout"
          className="w-full max-w-xs bg-gold py-4 text-center text-sm uppercase tracking-wider text-obsidian hover:bg-gold-light"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
