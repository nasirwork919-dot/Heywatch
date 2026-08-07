/**
 * Pushes data/products.json into the Supabase `products` and `brands`
 * tables. Run once after applying supabase/schema.sql:
 *
 *   npm run seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 * (the service role key bypasses RLS, which is required for a bulk insert).
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import type { Product } from "../lib/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your environment (.env.local)."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function main() {
  const productsPath = path.join(__dirname, "../data/products.json");
  const brandsPath = path.join(__dirname, "../data/brands.json");
  const products: Product[] = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
  const brandSlugs: Record<string, string> = JSON.parse(
    fs.readFileSync(brandsPath, "utf-8")
  );

  console.log(`Seeding ${products.length} products and ${Object.keys(brandSlugs).length} brands...`);

  const brandRows = Object.entries(brandSlugs).map(([name, slug]) => ({ name, slug }));
  const { error: brandErr } = await supabase.from("brands").upsert(brandRows, {
    onConflict: "name",
  });
  if (brandErr) throw brandErr;

  const productRows = products.map((p) => ({
    id: p.id,
    brand: p.brand,
    name: p.name,
    slug: p.slug,
    model: p.model,
    description: p.description,
    price: p.price,
    currency: p.currency,
    spec: p.spec,
    images: p.images,
  }));

  // Batch in chunks of 100 to stay well under request size limits.
  const chunkSize = 100;
  for (let i = 0; i < productRows.length; i += chunkSize) {
    const chunk = productRows.slice(i, i + chunkSize);
    const { error } = await supabase.from("products").upsert(chunk, { onConflict: "id" });
    if (error) throw error;
    console.log(`  seeded ${Math.min(i + chunkSize, productRows.length)} / ${productRows.length}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
