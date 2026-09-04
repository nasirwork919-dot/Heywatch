"use client";

import Link from "next/link";
import ProductImage from "./ProductImage";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/format";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalPrice } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-obsidian/70 backdrop-blur-sm transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform border-l border-line bg-charcoal transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <h2 className="font-display text-xl text-parchment">Your Bag</h2>
            <button onClick={closeCart} aria-label="Close cart">
              <X size={20} className="text-bone/70 hover:text-gold" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <p className="mt-10 text-center text-sm text-bone/50">
                Your bag is empty.
              </p>
            ) : (
              <ul className="space-y-6">
                {items.map((item) => (
                  <li key={item.productId} className="flex gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden bg-ink">
                      <ProductImage
                        src={item.image || ""}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest2 text-gold/80">
                          {item.brand}
                        </p>
                        <p className="line-clamp-1 text-sm text-parchment">{item.name}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 border border-line px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} className="text-bone/60 hover:text-gold" />
                          </button>
                          <span className="w-4 text-center text-xs">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} className="text-bone/60 hover:text-gold" />
                          </button>
                        </div>
                        <span className="text-sm text-bone/90">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      aria-label="Remove item"
                      className="self-start text-bone/40 hover:text-bordeaux"
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-line px-6 py-6">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-bone/70">Subtotal</span>
                <span className="text-lg text-parchment">{formatPrice(totalPrice())}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full bg-gold py-3 text-center text-sm uppercase tracking-wider text-obsidian transition-colors hover:bg-gold-light"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="mt-3 block w-full border border-line py-3 text-center text-sm uppercase tracking-wider text-bone/80 hover:border-gold hover:text-gold"
              >
                View Bag
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
