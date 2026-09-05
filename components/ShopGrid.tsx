"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

export default function ShopGrid({
  products,
  brands,
}: {
  products: Product[];
  brands: { name: string; slug: string; count: number }[];
}) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const catalogMaxPrice = Math.ceil(Math.max(...products.map((p) => p.price), 100) / 50) * 50;

  const [activeBrand, setActiveBrand] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [query, setQuery] = useState(initialQuery);
  const [maxPrice, setMaxPrice] = useState<number>(catalogMaxPrice);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = products;
    if (activeBrand !== "all") {
      list = list.filter((p) => p.brand === activeBrand);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
      );
    }
    list = list.filter((p) => p.price <= maxPrice);

    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [products, activeBrand, query, sort, maxPrice]);

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
      <div className="mb-10 max-w-2xl">
        <p className="eyebrow">The full collection</p>
        <h1 className="mt-3 font-display text-4xl font-light text-parchment sm:text-5xl">Find your signature piece.</h1>
        <p className="mt-4 text-sm leading-relaxed text-bone/50">
          Explore {products.length} timepieces across {brands.length} distinctive collections.
        </p>
      </div>

      <div className="mb-10 border-y border-line/80 py-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(220px,1fr)_2fr_220px] lg:items-center">
          <div className="relative">
            <label htmlFor="catalog-search" className="sr-only">Search the collection</label>
            <input
              id="catalog-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the collection"
              className="w-full border-b border-line bg-transparent py-2.5 text-sm text-parchment placeholder:text-bone/35 focus:border-gold focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2" aria-label="Filter by collection">
                <button
                  onClick={() => setActiveBrand("all")}
                  className={`border px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                    activeBrand === "all" ? "border-gold bg-gold text-obsidian" : "border-line text-bone/55 hover:border-gold/60 hover:text-gold-light"
                  }`}
                >
                  All
                </button>
              {brands.map((b) => (
                  <button
                    key={b.slug}
                    onClick={() => setActiveBrand(b.name)}
                    className={`border px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                      activeBrand === b.name ? "border-gold bg-gold text-obsidian" : "border-line text-bone/55 hover:border-gold/60 hover:text-gold-light"
                    }`}
                  >
                    {b.name}
                  </button>
              ))}
          </div>

          <div>
            <label htmlFor="max-price" className="mb-2 flex justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-bone/50">
              <span>Max price</span><span className="text-gold">${maxPrice}</span>
            </label>
            <input
              id="max-price"
              type="range"
              min={50}
              max={catalogMaxPrice}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-gold"
            />
        </div>
      </div>
      </div>

        <div>
          <div className="mb-7 flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.15em] text-bone/40">Showing all {filtered.length} timepieces</p>
            <label htmlFor="catalog-sort" className="sr-only">Sort products</label>
            <select
              id="catalog-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="border border-line bg-charcoal px-4 py-2.5 text-xs text-bone/70 focus:border-gold focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A–Z</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <p className="py-20 text-center text-bone/50">
              No watches match your filters.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-x-5 gap-y-10 min-[460px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
