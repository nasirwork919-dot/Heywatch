# HEYWATCHES

A full e-commerce storefront built from your product catalog: 762 watches
across 6 brands, real cart, real Stripe checkout, orders stored in Supabase.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Zustand for cart state (persisted to localStorage)
- Supabase (orders + optional product mirror)
- Stripe Checkout for payments

## 1. Install

```bash
npm install
```

## 2. Set up Supabase

1. Create a project at supabase.com (free tier is fine to start).
2. Open the SQL editor and run everything in `supabase/schema.sql`.
3. Project Settings → API → copy the URL, anon key, and service role key.

## 3. Set up Stripe

1. Create a Stripe account (or use your existing one).
2. Developers → API keys → copy the secret key.
3. Developers → Webhooks → Add endpoint → `https://your-domain.com/api/webhook`,
   listening for `checkout.session.completed` and `checkout.session.expired`.
   Copy the signing secret.
4. For local testing: `stripe listen --forward-to localhost:3000/api/webhook`

## 4. Environment variables

Copy `.env.example` to `.env.local` and fill in the values from steps 2–3.

## 5. (Optional) Seed Supabase with the product catalog

The storefront reads products straight from `data/products.json` at build
time — no seeding required to launch. If you'd rather manage stock/pricing
from Supabase directly, run:

```bash
npm run seed
```

This upserts all 762 products into the `products` table. You'd then swap
`lib/products.ts` to query Supabase instead of the JSON file.

## 6. Run locally

```bash
npm run dev
```

Visit http://localhost:3000

## 7. Deploy to Vercel

```bash
npx vercel
```

Add the same environment variables from `.env.local` in the Vercel project
settings, then re-run the webhook step above pointing at your production
domain.

## Scrape the source catalog

The public WooCommerce catalog at `superclonewatches.com` can be captured into
an isolated, git-ignored directory without changing the storefront catalog:

```bash
npm run scrape:superclone
```

This writes the original API records, normalized JSON, CSV, metadata, failures,
and downloaded product images to `scrape-output/superclonewatches/`. The
command is resumable: existing non-empty images are reused. Useful options are
`-- --skip-images`, `-- --limit=10`, `-- --concurrency=4`, and
`-- --force-images`.

After reviewing the isolated scrape, import it into the storefront with:

```bash
npm run import:superclone
```

This converts the source records into `data/products.json`, writes the brand
index, and copies referenced images into `public/superclone-products/`.

## Project structure

```
app/                 routes (home, /shop, /product/[slug], /brand/[slug], /cart, /checkout, /api/*)
components/          UI components
lib/                 product data access, Supabase client, Stripe client, types
store/               Zustand cart store
data/                products.json + brands.json (generated from your spreadsheet)
supabase/schema.sql  run this once in the Supabase SQL editor
scripts/seed.ts       optional: push products.json into Supabase
```

## Notes

- **Images** are served locally from `public/superclone-products/`; the
  storefront does not depend on the source site to render its catalog.
- **Currency** is USD throughout; change in `lib/products.ts` `formatPrice`
  and the Stripe checkout route if you need multi-currency.
- **Orders table** is locked down with RLS — all reads/writes happen via the
  service-role key inside `/api/checkout` and `/api/webhook`, never from the
  browser.
- Catalog is organized under 6 source brands: Rolex, Audemars Piguet,
  Richard Mille, Patek Philippe, Hublot, and Breitling.
