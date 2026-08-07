"use client";

import { useMemo, useState } from "react";
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

  const [activeBrand, setActiveBrand] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [query, setQuery] = useState(initialQuery);
  const [maxPrice, setMaxPrice] = useState<number>(1000);

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
          p.model.toLowerCase().includes(q)
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
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest2 text-gold">The Full Collection</p>
        <h1 className="mt-2 font-display text-4xl text-parchment">All Watches</h1>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters */}
        <aside className="w-full flex-shrink-0 lg:w-64">
          <div className="mb-8">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full border-b border-line bg-transparent py-2 text-sm text-parchment placeholder:text-bone/40 focus:border-gold focus:outline-none"
            />
          </div>

          <div className="mb-8">
            <h4 className="mb-3 text-xs uppercase tracking-widest2 text-gold">Brand</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveBrand("all")}
                  className={`text-sm ${
                    activeBrand === "all" ? "text-gold" : "text-bone/70 hover:text-gold"
                  }`}
                >
                  All Brands ({products.length})
                </button>
              </li>
              {brands.map((b) => (
                <li key={b.slug}>
                  <button
                    onClick={() => setActiveBrand(b.name)}
                    className={`text-sm ${
                      activeBrand === b.name ? "text-gold" : "text-bone/70 hover:text-gold"
                    }`}
                  >
                    {b.name} ({b.count})
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <h4 className="mb-3 text-xs uppercase tracking-widest2 text-gold">
              Max Price: ${maxPrice}
            </h4>
            <input
              type="range"
              min={100}
              max={1000}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-gold"
            />
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-bone/50">{filtered.length} results</p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="border border-line bg-charcoal px-3 py-2 text-sm text-bone/80 focus:border-gold focus:outline-none"
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
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
