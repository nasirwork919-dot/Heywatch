import fs from "node:fs";
import path from "node:path";
import type { ScrapeSetEntry, ScrapeManifest } from "../lib/scrape-types";

const ROOT = path.join(__dirname, "..");
const SCRAPED_ROOT = path.join(ROOT, "scraped-products");
const PUBLIC_ROOT = path.join(ROOT, "public", "scrape-products");
const MANIFEST_PATH = path.join(ROOT, "data", "scrape-manifest.json");

interface ScrapedEntry {
  title: string;
  local_image?: string;
  [key: string]: unknown;
}

interface ImageMaps {
  byBaseLower: Map<string, string>;
  byLower: Map<string, string>;
}

function safeReadJson(file: string): ScrapedEntry[] | null {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as ScrapedEntry[];
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[stage-images] Failed to parse ${file}: ${msg}`);
    return null;
  }
}

function readManifestSafe(): ScrapeManifest | null {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8")) as ScrapeManifest;
  } catch {
    return null;
  }
}

function setsEqual(a: ScrapeSetEntry[], b: ScrapeSetEntry[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id || a[i].title !== b[i].title) return false;
    const ia = a[i].images;
    const ib = b[i].images;
    if (ia.length !== ib.length) return false;
    for (let j = 0; j < ia.length; j++) {
      if (ia[j] !== ib[j]) return false;
    }
  }
  return true;
}

function buildImageMaps(sourceDir: string): ImageMaps {
  const byBaseLower = new Map<string, string>();
  const byLower = new Map<string, string>();

  let files: string[] = [];
  try {
    files = fs.readdirSync(sourceDir).sort();
  } catch {
    return { byBaseLower, byLower };
  }

  for (const f of files) {
    const lower = f.toLowerCase();
    if (!byLower.has(lower)) byLower.set(lower, f);

    const base = f.replace(/\.[^.]+$/, "").toLowerCase();
    const existing = byBaseLower.get(base);
    if (!existing) {
      byBaseLower.set(base, f);
    } else if (lower.endsWith(".jpg") && !existing.toLowerCase().endsWith(".jpg")) {
      byBaseLower.set(base, f);
    }
  }

  return { byBaseLower, byLower };
}

function resolveImageFile(maps: ImageMaps, filename: string): string | null {
  const base = filename.replace(/\.[^.]+$/, "").toLowerCase();
  const sameBase = maps.byBaseLower.get(base);
  if (sameBase) return sameBase;
  return maps.byLower.get(filename.toLowerCase()) ?? null;
}

function stageSet(
  setId: string,
  entries: ScrapedEntry[],
  sourceImagesDir: string,
  destRoot: string
): { set: ScrapeSetEntry[]; copied: number; entries: number } {
  const manifestSets: ScrapeSetEntry[] = [];
  let copied = 0;
  let staged = 0;

  if (!fs.existsSync(sourceImagesDir)) {
    return { set: manifestSets, copied, entries: staged };
  }

  const maps = buildImageMaps(sourceImagesDir);
  const destDir = path.join(destRoot, setId);
  fs.mkdirSync(destDir, { recursive: true });

  for (const entry of entries) {
    const raw = (entry.local_image ?? "").trim();
    if (!raw) continue;

    const filenames = raw
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);

    if (filenames.length === 0) continue;

    const stagedPaths: string[] = [];

    for (const fname of filenames) {
      const resolved = resolveImageFile(maps, fname);
      if (!resolved) continue;

      const srcPath = path.join(sourceImagesDir, resolved);
      const destPath = path.join(destDir, resolved);

      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
        copied++;
      }

      stagedPaths.push("/scrape-products/" + setId + "/" + resolved);
    }

    if (stagedPaths.length === 0) continue;

    manifestSets.push({
      id: setId,
      title: entry.title,
      images: stagedPaths,
    });
    staged++;
  }

  return { set: manifestSets, copied, entries: staged };
}

function main(): void {
  if (!fs.existsSync(SCRAPED_ROOT)) {
    console.warn(
      "[stage-images] scraped-products directory not found; skipping image staging."
    );
    process.exit(0);
  }

  fs.mkdirSync(PUBLIC_ROOT, { recursive: true });

  const allSets: ScrapeSetEntry[] = [];
  let totalCopied = 0;
  let totalEntries = 0;

  const rootJson = path.join(SCRAPED_ROOT, "products.json");
  if (fs.existsSync(rootJson)) {
    const data = safeReadJson(rootJson);
    if (data) {
      const result = stageSet("root", data, path.join(SCRAPED_ROOT, "images"), PUBLIC_ROOT);
      allSets.push(...result.set);
      totalCopied += result.copied;
      totalEntries += result.entries;
    }
  }

  const dirs = fs
    .readdirSync(SCRAPED_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "images");

  for (const dir of dirs) {
    const jsonPath = path.join(SCRAPED_ROOT, dir.name, "products.json");
    if (!fs.existsSync(jsonPath)) continue;

    const data = safeReadJson(jsonPath);
    if (!data) continue;

    const imagesDir = path.join(SCRAPED_ROOT, dir.name, "images");
    const result = stageSet(dir.name, data, imagesDir, PUBLIC_ROOT);
    allSets.push(...result.set);
    totalCopied += result.copied;
    totalEntries += result.entries;
  }

  let effectiveSets: ScrapeSetEntry[] = allSets;

  if (allSets.length === 0) {
    if (fs.existsSync(MANIFEST_PATH)) {
      console.log("[stage-images] No entries staged; keeping existing manifest.");
      effectiveSets = readManifestSafe()?.sets ?? [];
    } else {
      console.log("[stage-images] No entries staged; manifest was not written.");
      effectiveSets = [];
    }
  } else {
    const newManifest: ScrapeManifest = {
      generatedAt: new Date().toISOString(),
      sets: allSets,
    };

    const existing = readManifestSafe();
    const identical = existing !== null && setsEqual(existing.sets ?? [], allSets);
    if (identical) {
      console.log("[stage-images] Manifest unchanged.");
    } else {
      fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(newManifest, null, 2));
    }
  }

  // Validate manifest image paths exist on disk
  const missing: string[] = [];
  for (const set of effectiveSets) {
    for (const img of set.images) {
      const rel = img.replace(/^\/scrape-products\//, "");
      const p = path.join(PUBLIC_ROOT, rel);
      if (!fs.existsSync(p)) missing.push(img);
    }
  }
  if (missing.length > 0) {
    console.warn(
      `[stage-images] ${missing.length} manifest path(s) missing in public/scrape-products.`
    );
    console.warn(`[stage-images] First missing paths: ${missing.slice(0, 3).join(", ")}`);
  }

  const totalDatasets = dirs.length + (fs.existsSync(rootJson) ? 1 : 0);

  console.log("");
  console.log("  Dataset dirs scanned: " + totalDatasets);
  console.log("  Entries staged:      " + totalEntries);
  console.log("  Image files copied:  " + totalCopied);
  console.log("  Manifest entries:    " + allSets.length);
  console.log("  Manifest:            " + MANIFEST_PATH);
  console.log("  Images output:       " + PUBLIC_ROOT);
  console.log("");
}

main();
