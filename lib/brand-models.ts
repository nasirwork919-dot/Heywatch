import rawBrandModels from "@/data/brand-models.json";
import { getProductBySlug, getProductsByBrand } from "./products";
import type { Product } from "./types";

type IndexedBrandModel = {
  sourceCategory: string;
  name: string;
  slug: string;
  productSlugs: string[];
};

type BrandModelIndex = Record<string, IndexedBrandModel[]>;

export type BrandModel = {
  name: string;
  slug: string;
  count: number;
  image: string;
  description: string;
};

const brandModels = rawBrandModels as BrandModelIndex;

const modelDescriptions: Record<string, string> = {
  "air-king": "Aviation-inspired tool watches with bold, highly legible dials.",
  cellini: "Refined dress watches shaped by classic proportions and quiet detail.",
  datejust: "The iconic calendar watch, offered across sizes, metals, bezels, and dials.",
  "day-date": "Prestige references pairing day-and-date displays with President styling.",
  daytona: "Racing chronographs with instantly recognisable bezels and dial layouts.",
  explorer: "Purpose-built expedition watches with clean, highly legible displays.",
  "gmt-master": "Travel watches with dual-time functionality and signature bezel colours.",
  milgauss: "Anti-magnetic sports watches distinguished by vivid crystal and hand details.",
  "sea-dweller": "Professional deep-sea watches built around substantial diving proportions.",
  "sky-dweller": "Annual-calendar travel watches combining dual time with refined presence.",
  submariner: "The definitive dive-watch silhouette in classic and contemporary configurations.",
  "yacht-master": "Sport-luxury sailing watches balancing technical bezels with polished finishes.",
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function productsForModel(model: IndexedBrandModel): Product[] {
  return model.productSlugs
    .map((slug) => getProductBySlug(slug))
    .filter((product): product is Product => product !== undefined);
}

export function getBrandModels(brandSlug: string): BrandModel[] {
  return (brandModels[brandSlug] ?? []).map((model) => {
    const products = productsForModel(model);
    const modelName = normalize(model.name);
    const representative =
      products.find((product) => normalize(product.name).includes(modelName)) ?? products[0];

    return {
      name: model.name,
      slug: model.slug,
      count: products.length,
      image: representative?.images[0] ?? "",
      description: modelDescriptions[model.slug] ?? `Explore the ${model.name} collection.`,
    };
  });
}

export function getBrandModel(brandSlug: string, modelSlug: string): BrandModel | undefined {
  return getBrandModels(brandSlug).find((model) => model.slug === modelSlug);
}

export function getProductsByBrandModel(brandSlug: string, modelSlug: string): Product[] {
  if (modelSlug === "all") return getProductsByBrand(brandSlug);
  const model = (brandModels[brandSlug] ?? []).find((entry) => entry.slug === modelSlug);
  return model ? productsForModel(model) : [];
}

export function getAllBrandModelParams(): { slug: string; model: string }[] {
  return Object.entries(brandModels).flatMap(([slug, models]) => [
    { slug, model: "all" },
    ...models.map((model) => ({ slug, model: model.slug })),
  ]);
}
