import fs from "node:fs";
import path from "node:path";

const SITE_URL = "https://superclonewatches.com";
const API_URL = `${SITE_URL}/wp-json/wc/store/v1/products`;
const USER_AGENT = "RoyalCatalogImporter/1.0 (+https://watchstore-lemon.vercel.app)";
const PAGE_SIZE = 100;

interface CliOptions {
  concurrency: number;
  downloadImages: boolean;
  forceImages: boolean;
  limit?: number;
  outputDir: string;
}

interface StoreImage {
  id: number;
  src: string;
  thumbnail?: string;
  srcset?: string;
  sizes?: string;
  name?: string;
  alt?: string;
}

interface StoreTerm {
  id: number;
  name: string;
  slug: string;
}

interface StoreAttribute {
  id: number;
  name: string;
  taxonomy: string | null;
  has_variations: boolean;
  terms: StoreTerm[];
}

interface StorePrices {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
}

interface StoreProduct {
  id: number;
  name: string;
  slug: string;
  parent: number;
  type: string;
  variation: string;
  permalink: string;
  sku: string;
  short_description: string;
  description: string;
  on_sale: boolean;
  prices: StorePrices;
  average_rating: string;
  review_count: number;
  images: StoreImage[];
  categories: StoreTerm[];
  tags: StoreTerm[];
  brands?: StoreTerm[];
  attributes: StoreAttribute[];
  variations: number[];
  grouped_products: number[];
  has_options: boolean;
  is_purchasable: boolean;
  is_in_stock: boolean;
  is_on_backorder: boolean;
  stock_availability?: { text?: string } | null;
  sold_individually: boolean;
  weight: string;
  dimensions: Record<string, string>;
  [key: string]: unknown;
}

interface ScrapedProduct {
  source_id: number;
  source_url: string;
  title: string;
  slug: string;
  sku: string;
  type: string;
  description: string;
  short_description: string;
  currency: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  is_purchasable: boolean;
  is_in_stock: boolean;
  is_on_backorder: boolean;
  stock_status: string;
  average_rating: string;
  review_count: number;
  categories: string[];
  tags: string[];
  brands: string[];
  attributes: Record<string, string[]>;
  weight: string;
  dimensions: Record<string, string>;
  image_url: string;
  image_urls: string[];
  local_image: string;
}

interface ImageTask {
  product: ScrapedProduct;
  url: string;
  candidateUrls: string[];
  filename: string;
}

interface ImageFailure {
  source_id: number;
  title: string;
  url: string;
  error: string;
}

function parseOptions(): CliOptions {
  const args = process.argv.slice(2);
  const valueFor = (name: string) => args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
  const concurrency = Number(valueFor("--concurrency") ?? "4");
  const limitRaw = valueFor("--limit");
  const outputRaw = valueFor("--output") ?? path.join("scrape-output", "superclonewatches");

  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 12) {
    throw new Error("--concurrency must be an integer between 1 and 12");
  }

  const limit = limitRaw === undefined ? undefined : Number(limitRaw);
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
    throw new Error("--limit must be a positive integer");
  }

  return {
    concurrency,
    downloadImages: !args.includes("--skip-images"),
    forceImages: args.includes("--force-images"),
    limit,
    outputDir: path.resolve(process.cwd(), outputRaw),
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class PermanentRequestError extends Error {}

async function fetchWithRetry(url: string, attempts = 4): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);

    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json,text/plain,*/*", "User-Agent": USER_AGENT },
        signal: controller.signal,
      });

      if (response.ok) return response;
      if (response.status !== 429 && response.status < 500) {
        throw new PermanentRequestError(`HTTP ${response.status} ${response.statusText}`);
      }

      const retryAfter = Number(response.headers.get("retry-after") ?? "0");
      await delay(retryAfter > 0 ? retryAfter * 1000 : attempt * 1_500);
    } catch (error) {
      if (error instanceof PermanentRequestError) throw error;
      lastError = error;
      if (attempt < attempts) await delay(attempt * 1_500);
    } finally {
      clearTimeout(timeout);
    }
  }

  const message = lastError instanceof Error ? lastError.message : String(lastError ?? "unknown error");
  throw new Error(`Request failed after ${attempts} attempts: ${url} (${message})`);
}

async function verifyRobots(): Promise<void> {
  const response = await fetchWithRetry(`${SITE_URL}/robots.txt`);
  const robots = await response.text();
  const disallowsApi = robots
    .split(/\r?\n/)
    .map((line) => line.trim().toLowerCase())
    .some((line) => line === "disallow: /wp-json/" || line === "disallow: /wp-json");

  if (disallowsApi) {
    throw new Error("The site's robots.txt disallows /wp-json; scrape stopped.");
  }
}

async function fetchCatalog(): Promise<{ products: StoreProduct[]; reportedTotal: number }> {
  const firstUrl = `${API_URL}?per_page=${PAGE_SIZE}&page=1`;
  const firstResponse = await fetchWithRetry(firstUrl);
  const reportedTotal = Number(firstResponse.headers.get("x-wp-total") ?? "0");
  const totalPages = Number(firstResponse.headers.get("x-wp-totalpages") ?? "1");
  const products = (await firstResponse.json()) as StoreProduct[];

  console.log(`Catalog reports ${reportedTotal} products across ${totalPages} API pages.`);

  for (let page = 2; page <= totalPages; page++) {
    await delay(250);
    const response = await fetchWithRetry(`${API_URL}?per_page=${PAGE_SIZE}&page=${page}`);
    const pageProducts = (await response.json()) as StoreProduct[];
    products.push(...pageProducts);
    console.log(`Fetched page ${page}/${totalPages} (${products.length}/${reportedTotal}).`);
  }

  return { products, reportedTotal };
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:0*39|x0*27);/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripHtml(value: string): string {
  return decodeEntities(
    value
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function decimalPrice(value: string, minorUnit: number): string {
  if (!/^\d+$/.test(value)) return "";
  return (Number(value) / 10 ** minorUnit).toFixed(minorUnit);
}

function normalizeProduct(product: StoreProduct): ScrapedProduct {
  const minorUnit = product.prices.currency_minor_unit ?? 2;
  const imageUrls = (product.images ?? []).map((image) => image.src).filter(Boolean);
  const attributes = Object.fromEntries(
    (product.attributes ?? []).map((attribute) => [
      attribute.name,
      (attribute.terms ?? []).map((term) => term.name),
    ])
  );

  return {
    source_id: product.id,
    source_url: product.permalink,
    title: decodeEntities(product.name),
    slug: product.slug,
    sku: product.sku ?? "",
    type: product.type,
    description: stripHtml(product.description ?? ""),
    short_description: stripHtml(product.short_description ?? ""),
    currency: product.prices.currency_code,
    price: decimalPrice(product.prices.price, minorUnit),
    regular_price: decimalPrice(product.prices.regular_price, minorUnit),
    sale_price: decimalPrice(product.prices.sale_price, minorUnit),
    on_sale: product.on_sale,
    is_purchasable: product.is_purchasable,
    is_in_stock: product.is_in_stock,
    is_on_backorder: product.is_on_backorder,
    stock_status: String(product.stock_availability?.text ?? ""),
    average_rating: product.average_rating,
    review_count: product.review_count,
    categories: (product.categories ?? []).map((category) => decodeEntities(category.name)),
    tags: (product.tags ?? []).map((tag) => decodeEntities(tag.name)),
    brands: (product.brands ?? []).map((brand) => decodeEntities(brand.name)),
    attributes,
    weight: product.weight ?? "",
    dimensions: product.dimensions ?? {},
    image_url: imageUrls[0] ?? "",
    image_urls: imageUrls,
    local_image: "",
  };
}

function safeSegment(value: string, maxLength = 70): string {
  const safe = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
  return safe || "product";
}

function imageExtension(url: string): string {
  try {
    const extension = path.extname(new URL(url).pathname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(extension)) return extension;
  } catch {
    // The download step will record an invalid URL as a failure.
  }
  return ".jpg";
}

function srcsetUrls(srcset: string | undefined): string[] {
  if (!srcset) return [];
  return srcset
    .split(",")
    .map((entry) => entry.trim().split(/\s+/))
    .map(([url, width]) => ({ url, width: Number.parseInt(width ?? "0", 10) || 0 }))
    .sort((a, b) => b.width - a.width)
    .map((entry) => entry.url)
    .filter(Boolean);
}

function buildImageTasks(products: ScrapedProduct[], rawProducts: StoreProduct[]): ImageTask[] {
  const rawById = new Map(rawProducts.map((product) => [product.id, product]));

  return products.flatMap((product) => {
    const rawImages = rawById.get(product.source_id)?.images ?? [];
    return product.image_urls.map((url, index) => {
      const rawImage = rawImages[index];
      const candidates = [url, ...srcsetUrls(rawImage?.srcset), rawImage?.thumbnail ?? ""];
      return {
        product,
        url,
        candidateUrls: [...new Set(candidates.filter(Boolean))],
        filename: `${product.source_id}-${safeSegment(product.slug)}-${index + 1}${imageExtension(url)}`,
      };
    });
  });
}

async function downloadImages(
  tasks: ImageTask[],
  imagesDir: string,
  concurrency: number,
  forceImages: boolean
): Promise<{ downloaded: number; reused: number; failures: ImageFailure[] }> {
  fs.mkdirSync(imagesDir, { recursive: true });
  const failures: ImageFailure[] = [];
  let downloaded = 0;
  let reused = 0;
  let cursor = 0;

  async function worker(): Promise<void> {
    while (true) {
      const taskIndex = cursor++;
      if (taskIndex >= tasks.length) return;
      const task = tasks[taskIndex];
      const outputPath = path.join(imagesDir, task.filename);

      try {
        if (!forceImages && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
          reused++;
          task.product.local_image = [task.product.local_image, task.filename].filter(Boolean).join("|");
          continue;
        }

        const candidateErrors: string[] = [];
        let imageBytes: Buffer | null = null;

        for (const candidateUrl of task.candidateUrls) {
          try {
            const response = await fetchWithRetry(candidateUrl);
            const contentType = response.headers.get("content-type") ?? "";
            if (!contentType.toLowerCase().startsWith("image/")) {
              throw new Error(`Expected image content but received ${contentType || "unknown content type"}`);
            }
            const bytes = Buffer.from(await response.arrayBuffer());
            if (bytes.length === 0) throw new Error("Downloaded image was empty");
            imageBytes = bytes;
            break;
          } catch (error) {
            candidateErrors.push(`${candidateUrl}: ${error instanceof Error ? error.message : String(error)}`);
          }
        }

        if (!imageBytes) throw new Error(candidateErrors.join(" | "));
        fs.writeFileSync(outputPath, imageBytes);
        task.product.local_image = [task.product.local_image, task.filename].filter(Boolean).join("|");
        downloaded++;
      } catch (error) {
        failures.push({
          source_id: task.product.source_id,
          title: task.product.title,
          url: task.url,
          error: error instanceof Error ? error.message : String(error),
        });
      }

      const completed = downloaded + reused + failures.length;
      if (completed % 50 === 0 || completed === tasks.length) {
        console.log(`Images ${completed}/${tasks.length} (downloaded ${downloaded}, reused ${reused}, failed ${failures.length}).`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()));
  return { downloaded, reused, failures };
}

function csvCell(value: unknown): string {
  const rendered = Array.isArray(value)
    ? value.join(" | ")
    : typeof value === "object" && value !== null
      ? JSON.stringify(value)
      : String(value ?? "");
  return `"${rendered.replace(/"/g, '""')}"`;
}

function writeOutputs(
  outputDir: string,
  rawProducts: StoreProduct[],
  products: ScrapedProduct[],
  meta: Record<string, unknown>,
  failures: ImageFailure[]
): void {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "raw-products.json"), JSON.stringify(rawProducts, null, 2));
  fs.writeFileSync(path.join(outputDir, "products.json"), JSON.stringify(products, null, 2));
  fs.writeFileSync(path.join(outputDir, "scrape-meta.json"), JSON.stringify(meta, null, 2));
  fs.writeFileSync(path.join(outputDir, "failures.json"), JSON.stringify(failures, null, 2));

  const columns: (keyof ScrapedProduct)[] = [
    "source_id", "source_url", "title", "slug", "sku", "type", "description", "short_description",
    "currency", "price", "regular_price", "sale_price", "on_sale", "is_purchasable", "is_in_stock",
    "is_on_backorder", "stock_status", "average_rating", "review_count", "categories", "tags", "brands",
    "attributes", "weight", "dimensions", "image_url", "image_urls", "local_image",
  ];
  const rows = [columns.join(","), ...products.map((product) => columns.map((column) => csvCell(product[column])).join(","))];
  fs.writeFileSync(path.join(outputDir, "products.csv"), `${rows.join("\n")}\n`);
}

async function main(): Promise<void> {
  const options = parseOptions();
  const startedAt = new Date();

  console.log(`Checking ${SITE_URL}/robots.txt ...`);
  await verifyRobots();
  console.log("robots.txt permits the public WooCommerce API path.");

  const catalog = await fetchCatalog();
  const rawProducts = options.limit ? catalog.products.slice(0, options.limit) : catalog.products;
  const products = rawProducts.map(normalizeProduct);
  const uniqueIds = new Set(products.map((product) => product.source_id));
  if (uniqueIds.size !== products.length) throw new Error("Duplicate source product IDs were returned by the API.");

  let imageResult = { downloaded: 0, reused: 0, failures: [] as ImageFailure[] };
  const imageTasks = buildImageTasks(products, rawProducts);
  if (options.downloadImages) {
    console.log(`Downloading ${imageTasks.length} original images with concurrency ${options.concurrency} ...`);
    imageResult = await downloadImages(
      imageTasks,
      path.join(options.outputDir, "images"),
      options.concurrency,
      options.forceImages
    );
  }

  const finishedAt = new Date();
  const meta = {
    source: SITE_URL,
    api: API_URL,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    reportedProductCount: catalog.reportedTotal,
    scrapedProductCount: products.length,
    productsWithImages: products.filter((product) => product.image_urls.length > 0).length,
    imageUrlCount: imageTasks.length,
    downloadedImageCount: imageResult.downloaded,
    reusedImageCount: imageResult.reused,
    failedImageCount: imageResult.failures.length,
    imagesDownloaded: options.downloadImages,
  };

  writeOutputs(options.outputDir, rawProducts, products, meta, imageResult.failures);

  console.log("");
  console.log(`Scrape complete: ${products.length} products.`);
  console.log(`Output: ${options.outputDir}`);
  console.log(`Images: ${imageResult.downloaded} downloaded, ${imageResult.reused} reused, ${imageResult.failures.length} failed.`);

  if (!options.limit && products.length !== catalog.reportedTotal) {
    throw new Error(`Completeness check failed: API reported ${catalog.reportedTotal}, saved ${products.length}.`);
  }
  if (options.downloadImages && imageResult.failures.length > 0) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
