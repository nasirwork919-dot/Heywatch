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
  "rolex:air-king": "Aviation-inspired tool watches with bold, highly legible dials.",
  "rolex:cellini": "Refined dress watches shaped by classic proportions and quiet detail.",
  "rolex:datejust": "The iconic calendar watch, offered across sizes, metals, bezels, and dials.",
  "rolex:day-date": "Prestige references pairing day-and-date displays with President styling.",
  "rolex:daytona": "Racing chronographs with instantly recognisable bezels and dial layouts.",
  "rolex:explorer": "Purpose-built expedition watches with clean, highly legible displays.",
  "rolex:gmt-master": "Travel watches with dual-time functionality and signature bezel colours.",
  "rolex:milgauss": "Anti-magnetic sports watches distinguished by vivid crystal and hand details.",
  "rolex:sea-dweller": "Professional deep-sea watches built around substantial diving proportions.",
  "rolex:sky-dweller": "Annual-calendar travel watches combining dual time with refined presence.",
  "rolex:submariner": "The definitive dive-watch silhouette in classic and contemporary configurations.",
  "rolex:yacht-master": "Sport-luxury sailing watches balancing technical bezels with polished finishes.",
  "audemars-piguet:royal-oak": "The signature octagonal sports-watch design in an array of metals and dials.",
  "audemars-piguet:royal-oak-offshore": "Bold Royal Oak references with substantial cases and sporty detailing.",
  "audemars-piguet:royal-oak-tourbillon": "Complication-led Royal Oak designs showcasing openworked and tourbillon movements.",
  "richard-mille:rm-011": "Technical tonneau chronographs shaped by motorsport-inspired engineering.",
  "richard-mille:rm-035": "Lightweight sports watches pairing skeletonised displays with athletic character.",
  "richard-mille:rm-055": "Distinctive skeleton watches recognised for architectural cases and open dials.",
  "richard-mille:rm-53": "Impact-resistant tourbillon designs created around high-performance sport.",
  "richard-mille:rm-59": "An expressive tourbillon collection with a vivid, highly sculptural display.",
  "richard-mille:rm-68": "Graffiti-inspired tourbillon watches where movement architecture becomes art.",
  "richard-mille:rm-70": "Cycling-inspired tonneau watches with a distinctive mechanical counter display.",
  "patek-philippe:nautilus": "Iconic porthole-shaped sports watches balancing refined finishing with everyday presence.",
  "patek-philippe:aquanaut": "Contemporary rounded-octagonal sports watches with signature embossed dials.",
  "hublot:big-bang": "Layered, contemporary sports watches with bold cases and expressive materials.",
  "hublot:classic-fusion": "A cleaner, more restrained take on Hublot's modern fusion design language.",
  "breitling:avenger": "Rugged aviation watches engineered for clarity, durability, and confident wrist presence.",
  "breitling:navitimer": "Pilot chronographs defined by intricate slide-rule bezels and aviation heritage.",
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
      description:
        modelDescriptions[`${brandSlug}:${model.slug}`] ?? `Explore the ${model.name} collection.`,
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
