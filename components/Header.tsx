"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/store/cart";
import { useRouter } from "next/navigation";

export default function Header({
  brands,
}: {
  brands: { name: string; slug: string }[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { totalItems, openCart } = useCart();
  const router = useRouter();
  const navBrands = brands.slice(0, 4);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
      setMobileOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-obsidian/90 backdrop-blur-xl">
      <div className="border-b border-line/60 bg-charcoal/70 px-6 py-2 text-center text-[9px] font-medium uppercase tracking-[0.24em] text-bone/55">
        Inspected timepieces · Insured worldwide delivery · Two-year warranty
      </div>
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-2 sm:px-8 lg:px-12">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5 leading-none" aria-label="HEYWATCHES home">
          <Image
            src="/heywatches-logo-transparent.png"
            alt=""
            width={64}
            height={64}
            priority
            className="h-14 w-14 object-contain sm:h-16 sm:w-16"
          />
          <span className="flex flex-col">
            <span className="font-display text-lg tracking-[0.08em] text-parchment transition-colors group-hover:text-gold-light sm:text-xl">HEYWATCHES</span>
            <span className="mt-1 text-[7px] uppercase tracking-[0.25em] text-gold/65 sm:text-[8px]">Time · Style · Status</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {navBrands.map((b) => (
            <Link
              key={b.slug}
              href={`/brand/${b.slug}`}
              className="text-[11px] font-medium uppercase tracking-[0.16em] text-bone/65 transition-colors hover:text-gold-light"
            >
              {b.name}
            </Link>
          ))}
          <Link
            href="/shop"
            className="text-[11px] font-medium uppercase tracking-[0.16em] text-gold transition-colors hover:text-gold-light"
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
              aria-label="Search timepieces"
              className="w-40 border-b border-line bg-transparent py-1.5 text-xs text-parchment placeholder:text-bone/35 focus:border-gold focus:outline-none lg:w-48"
            />
            <button type="submit" aria-label="Search">
              <Search size={16} className="ml-2 text-bone/60 hover:text-gold" />
            </button>
          </form>

          <button
            onClick={openCart}
            aria-label="Open cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line text-bone/75 transition-colors hover:border-gold/60 hover:text-gold"
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
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-charcoal/95 px-6 py-5 lg:hidden">
          <form onSubmit={handleSearch} className="mb-4 flex items-center border-b border-line pb-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search timepieces..."
              aria-label="Search timepieces"
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
