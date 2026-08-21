import type { Product } from "./types";
import {
  getAllProducts as rawGetAllProducts,
  getProductBySlug as rawGetProductBySlug,
  getProductsByBrand as rawGetProductsByBrand,
  getRelatedProducts as rawGetRelatedProducts,
  getAllBrands,
  getBrandNameFromSlug,
  searchProducts,
  formatPrice,
} from "./products";
import { resolveProductImages } from "./product-images";

if (typeof window !== "undefined") {
  throw new Error(
    "lib/products-data.ts is server-only. Do not import it from client components."
  );
}

const enrich = (p: Product): Product => ({ ...p, images: resolveProductImages(p) });

const catalog: Product[] = rawGetAllProducts().map(enrich);

export function getAllProducts(): Product[] {
  return catalog;
}

export function getProductBySlug(slug: string): Product | undefined {
  const p = rawGetProductBySlug(slug);
  return p ? enrich(p) : undefined;
}

export function getProductsByBrand(brandSlug: string): Product[] {
  return rawGetProductsByBrand(brandSlug).map(enrich);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return rawGetRelatedProducts(product, limit).map(enrich);
}

export { getAllBrands, getBrandNameFromSlug, searchProducts, formatPrice };
