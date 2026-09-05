import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SCRAPED_PRODUCTS = path.join(ROOT, "scrape-output", "superclonewatches", "products.json");
const CATALOG_PRODUCTS = path.join(ROOT, "data", "products.json");
const OUTPUT = path.join(ROOT, "data", "brand-models.json");

type ScrapedProduct = {
  slug: string;
  categories: string[];
};

type CatalogProduct = {
  slug: string;
  brand: string;
};

const rolexModels = [
  { sourceCategory: "Rolex Air King", name: "Air-King", slug: "air-king" },
  { sourceCategory: "Rolex Cellini", name: "Cellini", slug: "cellini" },
  { sourceCategory: "Rolex Datejust", name: "Datejust", slug: "datejust" },
  { sourceCategory: "Rolex Day Date", name: "Day-Date", slug: "day-date" },
  { sourceCategory: "Rolex Daytona", name: "Daytona", slug: "daytona" },
  { sourceCategory: "Rolex Explorer", name: "Explorer", slug: "explorer" },
  { sourceCategory: "Rolex GMT Master", name: "GMT-Master", slug: "gmt-master" },
  { sourceCategory: "Rolex Milgauss", name: "Milgauss", slug: "milgauss" },
  { sourceCategory: "Rolex Sea Dweller", name: "Sea-Dweller", slug: "sea-dweller" },
  { sourceCategory: "Rolex Sky Dweller", name: "Sky-Dweller", slug: "sky-dweller" },
  { sourceCategory: "Rolex Submariner", name: "Submariner", slug: "submariner" },
  { sourceCategory: "Rolex Yacht Master", name: "Yacht-Master", slug: "yacht-master" },
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
  const catalogRolexSlugs = new Set(
    catalog.filter((product) => product.brand === "Rolex").map((product) => product.slug)
  );

  const models = rolexModels.map((model) => ({
    ...model,
    productSlugs: scraped
      .filter(
        (product) =>
          catalogRolexSlugs.has(product.slug) && product.categories.includes(model.sourceCategory)
      )
      .map((product) => product.slug),
  }));

  const indexedSlugs = models.flatMap((model) => model.productSlugs);
  const uniqueIndexedSlugs = new Set(indexedSlugs);
  const missing = [...catalogRolexSlugs].filter((slug) => !uniqueIndexedSlugs.has(slug));

  if (indexedSlugs.length !== uniqueIndexedSlugs.size) {
    throw new Error("A Rolex product was assigned to more than one model category.");
  }
  if (missing.length > 0) {
    throw new Error(`Missing Rolex model assignments for ${missing.length} products; first: ${missing[0]}`);
  }

  fs.writeFileSync(
    OUTPUT,
    `${JSON.stringify({ rolex: models }, null, 2)}\n`,
    "utf8"
  );
  console.log(`Indexed ${indexedSlugs.length} Rolex products across ${models.length} models.`);
  console.log(OUTPUT);
}

main();
