import fs from "node:fs";
import path from "node:path";
import type { Product, ProductSpec } from "../lib/types";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE_ROOT = path.join(ROOT, "scrape-output", "superclonewatches");
const SOURCE_PRODUCTS = path.join(SOURCE_ROOT, "products.json");
const SOURCE_IMAGES = path.join(SOURCE_ROOT, "images");
const PUBLIC_IMAGES = path.join(ROOT, "public", "superclone-products");
const PRODUCTS_OUTPUT = path.join(ROOT, "data", "products.json");
const BRANDS_OUTPUT = path.join(ROOT, "data", "brands.json");
const META_OUTPUT = path.join(ROOT, "data", "catalog-meta.json");

interface ScrapedProduct {
  source_id: number;
  source_url: string;
  title: string;
  slug: string;
  sku: string;
  description: string;
  short_description: string;
  currency: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  is_in_stock: boolean;
  stock_status: string;
  categories: string[];
  brands: string[];
  attributes: Record<string, string[]>;
  weight: string;
  dimensions: Record<string, string>;
  local_image: string;
}

const BRAND_SLUGS: Record<string, string> = {
  Rolex: "rolex",
  "Audemars Piguet": "audemars-piguet",
  "Richard Mille": "richard-mille",
  "Patek Philippe": "patek-philippe",
  Hublot: "hublot",
  Breitling: "breitling",
};

function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function deriveBrand(product: ScrapedProduct): string {
  const text = [...product.brands, ...product.categories, product.title].join(" ");
  if (/rolex/i.test(text)) return "Rolex";
  if (/audemars|royal oak|\bap\b/i.test(text)) return "Audemars Piguet";
  if (/patek|nautilus|aquanaut/i.test(text)) return "Patek Philippe";
  if (/richard mille|\brm\s?\d/i.test(text)) return "Richard Mille";
  if (/hublot|big bang|fusion/i.test(text)) return "Hublot";
  if (/breitling|navitimer|avenger/i.test(text)) return "Breitling";
  throw new Error(`Could not derive a supported brand for source product ${product.source_id}: ${product.title}`);
}

function usefulDescription(product: ScrapedProduct): string {
  const candidates = [product.description, product.short_description]
    .map((value) => value.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  return candidates[0] ?? "Product details were not provided by the source catalog.";
}

function formattedDimensions(dimensions: Record<string, string>): string {
  const labels: Record<string, string> = { length: "L", width: "W", height: "H" };
  return Object.entries(dimensions)
    .filter(([, value]) => value)
    .map(([key, value]) => `${labels[key] ?? key}: ${value}`)
    .join(" × ");
}

function productSpec(product: ScrapedProduct): ProductSpec {
  const spec: ProductSpec = {};
  for (const [name, values] of Object.entries(product.attributes)) {
    const value = values.filter(Boolean).join(", ");
    if (value) spec[name] = value;
  }
  if (product.sku) spec.SKU = product.sku;
  if (product.weight) spec.Weight = product.weight;
  const dimensions = formattedDimensions(product.dimensions);
  if (dimensions) spec.Dimensions = dimensions;
  return spec;
}

function convertProduct(product: ScrapedProduct): Product {
  const price = Number(product.price);
  const regularPrice = Number(product.regular_price);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`Invalid price for source product ${product.source_id}: ${product.price}`);
  }

  const images = product.local_image
    .split("|")
    .map((filename) => filename.trim())
    .filter(Boolean)
    .map((filename) => `/superclone-products/${filename}`);

  return {
    id: `superclone-${product.source_id}`,
    brand: deriveBrand(product),
    name: decodeEntities(product.title),
    slug: product.slug,
    model: decodeEntities(product.sku || product.categories.at(-1) || product.title),
    description: decodeEntities(usefulDescription(product)),
    price,
    compareAtPrice: product.on_sale && regularPrice > price ? regularPrice : undefined,
    currency: product.currency || "USD",
    sku: product.sku || undefined,
    sourceUrl: product.source_url,
    inStock: product.is_in_stock,
    spec: productSpec(product),
    images,
  };
}

function writeJson(file: string, value: unknown): void {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function main(): void {
  if (!fs.existsSync(SOURCE_PRODUCTS)) throw new Error(`Scraped catalog not found: ${SOURCE_PRODUCTS}`);
  if (!fs.existsSync(SOURCE_IMAGES)) throw new Error(`Scraped images not found: ${SOURCE_IMAGES}`);

  const scraped = JSON.parse(fs.readFileSync(SOURCE_PRODUCTS, "utf8")) as ScrapedProduct[];
  const convertedProducts = scraped.map(convertProduct);
  const products = convertedProducts.filter((product) => product.images.length > 0);
  const excludedWithoutImages = convertedProducts.length - products.length;
  const ids = new Set(products.map((product) => product.id));
  const slugs = new Set(products.map((product) => product.slug));
  if (ids.size !== products.length) throw new Error("Converted catalog contains duplicate product IDs.");
  if (slugs.size !== products.length) throw new Error("Converted catalog contains duplicate product slugs.");

  const sourceImageNames = new Set(fs.readdirSync(SOURCE_IMAGES));
  const referencedImageNames = products.flatMap((product) =>
    product.images.map((image) => image.replace("/superclone-products/", ""))
  );
  const missing = referencedImageNames.filter((filename) => !sourceImageNames.has(filename));
  if (missing.length > 0) throw new Error(`Missing ${missing.length} source images; first: ${missing[0]}`);

  fs.mkdirSync(PUBLIC_IMAGES, { recursive: true });
  let copied = 0;
  let reused = 0;
  for (const filename of referencedImageNames) {
    const source = path.join(SOURCE_IMAGES, filename);
    const destination = path.join(PUBLIC_IMAGES, filename);
    if (fs.existsSync(destination) && fs.statSync(destination).size === fs.statSync(source).size) {
      reused++;
      continue;
    }
    fs.copyFileSync(source, destination);
    copied++;
  }

  const counts = new Map<string, number>();
  for (const product of products) counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
  const brands = Object.fromEntries(
    [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([brand]) => [brand, BRAND_SLUGS[brand]])
  );

  writeJson(PRODUCTS_OUTPUT, products);
  writeJson(BRANDS_OUTPUT, brands);
  writeJson(META_OUTPUT, {
    source: "https://superclonewatches.com",
    importedAt: new Date().toISOString(),
    sourceProductCount: scraped.length,
    productCount: products.length,
    brandCount: Object.keys(brands).length,
    imageCount: referencedImageNames.length,
    excludedWithoutImages,
    onSaleCount: products.filter((product) => product.compareAtPrice !== undefined).length,
  });

  console.log(`Imported ${products.length} products across ${Object.keys(brands).length} brands.`);
  console.log(`Excluded ${excludedWithoutImages} products without source images.`);
  console.log(`Images: ${copied} copied, ${reused} reused, ${referencedImageNames.length} referenced.`);
  console.log(`Catalog: ${PRODUCTS_OUTPUT}`);
}

main();
