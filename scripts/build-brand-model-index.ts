import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SCRAPED_PRODUCTS = path.join(ROOT, "scrape-output", "superclonewatches", "products.json");
const CATALOG_PRODUCTS = path.join(ROOT, "data", "products.json");
const OUTPUT = path.join(ROOT, "data", "brand-models.json");

type ScrapedProduct = { slug: string; title: string; categories: string[] };
type CatalogProduct = { slug: string; brand: string };
type ModelConfig = {
  sourceCategory: string;
  name: string;
  slug: string;
  matches: (product: ScrapedProduct) => boolean;
};
type BrandConfig = { brand: string; slug: string; models: ModelConfig[] };

function categoryModel(sourceCategory: string, name: string, slug: string): ModelConfig {
  return {
    sourceCategory,
    name,
    slug,
    matches: (product) => product.categories.includes(sourceCategory),
  };
}

const brandConfigs: BrandConfig[] = [
  {
    brand: "Rolex",
    slug: "rolex",
    models: [
      categoryModel("Rolex Air King", "Air-King", "air-king"),
      categoryModel("Rolex Cellini", "Cellini", "cellini"),
      categoryModel("Rolex Datejust", "Datejust", "datejust"),
      categoryModel("Rolex Day Date", "Day-Date", "day-date"),
      categoryModel("Rolex Daytona", "Daytona", "daytona"),
      categoryModel("Rolex Explorer", "Explorer", "explorer"),
      categoryModel("Rolex GMT Master", "GMT-Master", "gmt-master"),
      categoryModel("Rolex Milgauss", "Milgauss", "milgauss"),
      categoryModel("Rolex Sea Dweller", "Sea-Dweller", "sea-dweller"),
      categoryModel("Rolex Sky Dweller", "Sky-Dweller", "sky-dweller"),
      categoryModel("Rolex Submariner", "Submariner", "submariner"),
      categoryModel("Rolex Yacht Master", "Yacht-Master", "yacht-master"),
    ],
  },
  {
    brand: "Audemars Piguet",
    slug: "audemars-piguet",
    models: [
      {
        sourceCategory: "Audemars Piguet",
        name: "Royal Oak",
        slug: "royal-oak",
        matches: (product) =>
          product.categories.includes("Audemars Piguet") &&
          !product.categories.includes("Royal Oak Offshore") &&
          !product.categories.includes("Royal Oak Tourbillon"),
      },
      categoryModel("Royal Oak Offshore", "Royal Oak Offshore", "royal-oak-offshore"),
      categoryModel("Royal Oak Tourbillon", "Royal Oak Tourbillon", "royal-oak-tourbillon"),
    ],
  },
  {
    brand: "Richard Mille",
    slug: "richard-mille",
    models: [
      categoryModel("RM 011", "RM 011", "rm-011"),
      categoryModel("RM 035", "RM 035", "rm-035"),
      {
        sourceCategory: "RM 055",
        name: "RM 055",
        slug: "rm-055",
        matches: (product) =>
          product.categories.includes("RM 055") || /\bRM\s*055\b/i.test(product.title),
      },
      categoryModel("RM 53", "RM 53", "rm-53"),
      categoryModel("RM 59", "RM 59", "rm-59"),
      categoryModel("RM 68", "RM 68", "rm-68"),
      categoryModel("RM 70", "RM 70", "rm-70"),
    ],
  },
  {
    brand: "Patek Philippe",
    slug: "patek-philippe",
    models: [
      categoryModel("Nautilus", "Nautilus", "nautilus"),
      categoryModel("Patek Philippe Aquanaut", "Aquanaut", "aquanaut"),
    ],
  },
  {
    brand: "Hublot",
    slug: "hublot",
    models: [
      categoryModel("Big Bang", "Big Bang", "big-bang"),
      categoryModel("Fusion", "Classic Fusion", "classic-fusion"),
    ],
  },
  {
    brand: "Breitling",
    slug: "breitling",
    models: [
      categoryModel("Avenger", "Avenger", "avenger"),
      {
        sourceCategory: "Navitimer",
        name: "Navitimer",
        slug: "navitimer",
        matches: (product) =>
          product.categories.includes("Navitimer") && !product.categories.includes("Avenger"),
      },
    ],
  },
];

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function main(): void {
  if (!fs.existsSync(SCRAPED_PRODUCTS)) {
    throw new Error(`Missing scraped source data: ${SCRAPED_PRODUCTS}`);
  }

  const scraped = readJson<ScrapedProduct[]>(SCRAPED_PRODUCTS);
  const catalog = readJson<CatalogProduct[]>(CATALOG_PRODUCTS);
  const output: Record<string, Array<Omit<ModelConfig, "matches"> & { productSlugs: string[] }>> = {};
  let indexedTotal = 0;

  for (const brandConfig of brandConfigs) {
    const catalogSlugs = new Set(
      catalog.filter((product) => product.brand === brandConfig.brand).map((product) => product.slug)
    );
    const models = brandConfig.models.map(({ matches, ...model }) => ({
      ...model,
      productSlugs: scraped
        .filter((product) => catalogSlugs.has(product.slug) && matches(product))
        .map((product) => product.slug),
    }));
    const indexedSlugs = models.flatMap((model) => model.productSlugs);
    const uniqueIndexedSlugs = new Set(indexedSlugs);
    const missing = [...catalogSlugs].filter((slug) => !uniqueIndexedSlugs.has(slug));

    if (indexedSlugs.length !== uniqueIndexedSlugs.size) {
      throw new Error(`${brandConfig.brand} has products assigned to more than one model.`);
    }
    if (missing.length > 0) {
      throw new Error(
        `Missing ${brandConfig.brand} model assignments for ${missing.length} products; first: ${missing[0]}`
      );
    }

    output[brandConfig.slug] = models;
    indexedTotal += indexedSlugs.length;
    console.log(
      `${brandConfig.brand}: ${models.map((model) => `${model.name} ${model.productSlugs.length}`).join(", ")}`
    );
  }

  if (indexedTotal !== catalog.length) {
    throw new Error(`Indexed ${indexedTotal} of ${catalog.length} catalog products.`);
  }

  fs.writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Indexed all ${indexedTotal} products across ${brandConfigs.length} brands.`);
  console.log(OUTPUT);
}

main();
