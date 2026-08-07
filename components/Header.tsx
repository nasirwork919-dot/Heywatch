"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/store/cart";
import { getAllBrands } from "@/lib/products";
import { useRouter } from "next/navigation";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { totalItems, openCart } = useCart();
  const router = useRouter();
  const brands = getAllBrands().slice(0, 6);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
      setMobileOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-obsidian/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="group flex flex-col items-start leading-none">
          <span className="font-display text-2xl tracking-wide text-parchment group-hover:text-gold transition-colors">
            Royal<span className="text-gold">.</span>
          </span>
          <span className="text-[10px] uppercase tracking-widest2 text-bone/60">
            Luxury Watches
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {brands.map((b) => (
            <Link
              key={b.slug}
              href={`/brand/${b.slug}`}
              className="text-sm uppercase tracking-wider text-bone/80 hover:text-gold transition-colors"
            >
              {b.name}
            </Link>
          ))}
          <Link
            href="/shop"
            className="text-sm uppercase tracking-wider text-bone/80 hover:text-gold transition-colors"
          >
            All Watches
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden items-center md:flex">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search timepieces..."
              className="w-44 border-b border-line bg-transparent py-1 text-sm text-parchment placeholder:text-bone/40 focus:border-gold focus:outline-none transition-colors lg:w-56"
            />
            <button type="submit" aria-label="Search">
              <Search size={16} className="ml-2 text-bone/60 hover:text-gold" />
            </button>
          </form>

          <button
            onClick={openCart}
            aria-label="Open cart"
            className="relative flex items-center text-bone/80 hover:text-gold transition-colors"
          >
            <ShoppingBag size={20} />
            {totalItems() > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-obsidian">
                {totalItems()}
              </span>
            )}
          </button>

          <button
            className="text-bone/80 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-line px-6 py-4 lg:hidden">
          <form onSubmit={handleSearch} className="mb-4 flex items-center border-b border-line pb-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search timepieces..."
              className="w-full bg-transparent text-sm text-parchment placeholder:text-bone/40 focus:outline-none"
            />
            <button type="submit" aria-label="Search">
              <Search size={16} className="text-bone/60" />
            </button>
          </form>
          <div className="flex flex-col gap-3">
            {brands.map((b) => (
              <Link
                key={b.slug}
                href={`/brand/${b.slug}`}
                onClick={() => setMobileOpen(false)}
                className="text-sm uppercase tracking-wider text-bone/80 hover:text-gold"
              >
                {b.name}
              </Link>
            ))}
            <Link
              href="/shop"
              onClick={() => setMobileOpen(false)}
              className="text-sm uppercase tracking-wider text-gold"
            >
              All Watches
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
