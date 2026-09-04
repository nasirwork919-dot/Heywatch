import type { Product } from "./types";
import rawProducts from "@/data/products.json";
import rawBrands from "@/data/brands.json";

export { formatPrice } from "./format";

// Static catalog (bundled at build time). Swap for Supabase queries in
// lib/products-db.ts once you've run `npm run seed` if you want the catalog
// to be editable from Supabase directly. See README for details.
const products = rawProducts as Product[];
const brandSlugs = rawBrands as Record<string, string>;

export function getAllProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByBrand(brandSlug: string): Product[] {
  return products.filter((p) => brandSlugs[p.brand] === brandSlug);
}

export function getBrandNameFromSlug(brandSlug: string): string | undefined {
  return Object.keys(brandSlugs).find((name) => brandSlugs[name] === brandSlug);
}

export function getAllBrands(): { name: string; slug: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const p of products) counts[p.brand] = (counts[p.brand] || 0) + 1;
  return Object.entries(brandSlugs)
    .map(([name, slug]) => ({ name, slug, count: counts[name] || 0 }))
    .sort((a, b) => b.count - a.count);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.brand === product.brand && p.id !== product.id)
    .slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.model.toLowerCase().includes(q)
  );
}
