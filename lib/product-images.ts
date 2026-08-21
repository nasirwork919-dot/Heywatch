import type { Product } from "./types";
import type { ScrapeManifest, ScrapeSetEntry } from "./scrape-types";
import { stableHash } from "./hash";

import manifest from "@/data/scrape-manifest.json";

const manifestData = manifest as unknown as ScrapeManifest;
const rawSets: ScrapeSetEntry[] = Array.isArray(manifestData?.sets) ? manifestData.sets : [];

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractRefKeys(text: string): string[] {
  const keys = new Set<string>();
  const normalized = normalizeText(text);

  const isUsableKey = (key: string): boolean => {
    if (key.length < 4) return false;
    if (!/\d/.test(key) || !/[a-z]/.test(key)) return false;
    if (key.endsWith("mm")) return false;
    return true;
  };

  for (const token of normalized.split(" ")) {
    if (isUsableKey(token)) keys.add(token);
  }

  const groupRegex = /[A-Za-z]*\d[\dA-Za-z.\-]{3,}/g;
  for (const match of text.match(groupRegex) ?? []) {
    const compact = match.replace(/[.\-]/g, "").toLowerCase();
    if (isUsableKey(compact)) keys.add(compact);

    for (const part of match.split(/[.\-]/)) {
      const lower = part.toLowerCase();
      if (isUsableKey(lower)) keys.add(lower);
    }
  }

  return [...keys].sort((a, b) => b.length - a.length);
}

const KEYWORD_DICTIONARY: Record<string, string> = {
  black: "black",
  white: "white",
  blue: "blue",
  green: "green",
  red: "red",
  rose: "rose",
  gold: "gold",
  silver: "silver",
  grey: "grey",
  gray: "grey",
  brown: "brown",
  yellow: "yellow",
  purple: "purple",
  pink: "pink",
  beige: "beige",
  ivory: "ivory",
  ice: "ice",
  orange: "orange",
  turquoise: "turquoise",
  pistachio: "pistachio",
  opaline: "opaline",
  cream: "cream",
  panda: "panda",
  skeleton: "skeleton",
  sunray: "sunray",
  rainbow: "rainbow",
  frost: "frost",
  openworked: "openworked",
  sunburst: "sunburst",
  "mother of pearl": "mother-of-pearl",
  "mother-of-pearl": "mother-of-pearl",
  meteorite: "meteorite",
  steel: "steel",
  ceramic: "ceramic",
  titanium: "titanium",
  carbon: "carbon",
  rubber: "rubber",
  leather: "leather",
  sapphire: "sapphire",
  platinum: "platinum",
  diamond: "diamond",
  chronograph: "chronograph",
  tourbillon: "tourbillon",
  perpetual: "perpetual",
  calendar: "calendar",
  "annual calendar": "annual-calendar",
  "annual-calendar": "annual-calendar",
  chronometer: "chronometer",
  worldtimer: "worldtimer",
  moonphase: "moonphase",
  "moon phase": "moonphase",
  gmt: "gmt",
  diver: "diver",
  regatta: "regatta",
  "day date": "day-date",
  "day-date": "day-date",
  datejust: "datejust",
  submariner: "submariner",
  daytona: "daytona",
  "royal oak": "royal-oak",
  "royal-oak": "royal-oak",
  nautilus: "nautilus",
  avenger: "avenger",
  "big bang": "big-bang",
  "big-bang": "big-bang",
  "air king": "air-king",
  "air-king": "air-king",
  cellini: "cellini",
  moonswatch: "moonswatch",
  seamaster: "seamaster",
  carrera: "carrera",
  speedmaster: "speedmaster",
  calatrava: "calatrava",
  cubitus: "cubitus",
  tank: "tank",
  santos: "santos",
  mille: "mille",
};

function extractKeywords(text: string): string[] {
  const normalized = " " + normalizeText(text) + " ";
  const found = new Set<string>();
  for (const [raw, canonical] of Object.entries(KEYWORD_DICTIONARY)) {
    const phrase = normalizeText(raw);
    if (normalized.includes(" " + phrase + " ")) found.add(canonical);
  }
  return [...found];
}

interface IndexedEntry extends ScrapeSetEntry {
  refKeys: string[];
  keywords: string[];
}

const indexedEntries: IndexedEntry[] = rawSets
  .filter((s) => s && Array.isArray(s.images) && s.images.length > 0)
  .map((s) => ({
    ...s,
    refKeys: extractRefKeys(s.title),
    keywords: extractKeywords(s.title),
  }));

const BRAND_SETS: Record<string, string[]> = {
  Ironclad: ["audemars-piguet", "1", "2", "3", "4", "9", "10", "shop"],
  Marinier: ["rolex-super-clone-watches-daytona", "5", "6", "7", "8", "root"],
  Titanforge: ["hublot"],
  Skyline: ["breitling"],
  Aurelian: ["patek-philippe"],
  Aeroform: ["richard-mille"],
  Velocity: [],
  Orbital: [],
  Cariste: [],
};

function buildBrandPools(): Record<string, IndexedEntry[]> {
  const pools: Record<string, IndexedEntry[]> = {};
  for (const brand of Object.keys(BRAND_SETS)) {
    const setIds = BRAND_SETS[brand];
    pools[brand] = setIds.length
      ? indexedEntries.filter((e) => setIds.includes(e.id))
      : indexedEntries;
  }
  return pools;
}

const brandPools = buildBrandPools();
const allIndexedEntries = indexedEntries;

export function resolveProductImages(
  product: Pick<Product, "id" | "brand" | "name" | "slug" | "model" | "spec">
): string[] {
  const refSource = [product.slug, product.model, product.name].join(" ");
  const specRefSource = Object.values(product.spec ?? {}).filter(Boolean).join(" ");
  const catalogRefKeys = extractRefKeys(refSource);
  const catalogKeywords = extractKeywords(
    product.name + " " + product.model + " " + specRefSource
  );

  const pool = brandPools[product.brand] ?? [];
  const isBrandPool = (BRAND_SETS[product.brand] ?? []).length > 0;

  let bestScore = 0;
  let bestImages: string[] | null = null;
  let bestMatchedLen = 0;
  let bestExact = false;

  for (const entry of pool) {
    let score = isBrandPool ? 25 : 5;

    let matchedLen = 0;
    let anyExact = false;

    for (const ck of catalogRefKeys) {
      for (const ek of entry.refKeys) {
        if (ck === ek) {
          anyExact = true;
          if (ck.length > matchedLen) matchedLen = ck.length;
          break;
        }
      }
    }

    if (anyExact) {
      score += 100;
    } else {
      for (const ck of catalogRefKeys) {
        for (const ek of entry.refKeys) {
          const short = ck.length <= ek.length ? ck : ek;
          const long = ck.length <= ek.length ? ek : ck;
          if (short.length >= 5 && long.includes(short)) {
            if (short.length > matchedLen) matchedLen = short.length;
            break;
          }
        }
      }
      if (matchedLen > 0) score += 60;
    }

    if (catalogKeywords.length > 0 && entry.keywords.length > 0) {
      const shared = catalogKeywords.filter((k) => entry.keywords.includes(k)).length;
      score += Math.min(shared, 4) * 10;
    }

    const isBetter =
      score > bestScore ||
      (score === bestScore && anyExact && !bestExact) ||
      (score === bestScore && anyExact === bestExact && matchedLen > bestMatchedLen);

    if (isBetter) {
      bestScore = score;
      bestImages = entry.images;
      bestMatchedLen = matchedLen;
      bestExact = anyExact;
    }
  }

  if (bestScore >= 70 && bestImages) {
    return [...new Set(bestImages)];
  }

  return localFallbackImagesFor(product.id, product.brand);
}

function localFallbackImagesFor(seed: string, brand: string): string[] {
  const pool = brandPools[brand] ?? [];
  const fallbackPool = pool.length > 0 ? pool : allIndexedEntries;
  if (fallbackPool.length === 0) return [];
  const entry = fallbackPool[stableHash(seed) % fallbackPool.length];
  return [...new Set(entry.images)];
}
