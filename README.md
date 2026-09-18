# HEYWATCHES

A Next.js storefront for 762 watches across six brands, with a persistent cart,
direct crypto checkout, and private order storage in Supabase.

## Stack

- Next.js 14 App Router, TypeScript, and Tailwind CSS
- Zustand for the browser-persisted cart
- Supabase for orders and the optional product mirror
- Direct USDC, ETH, BTC, and BNB payment submission
- Locally generated wallet QR codes

## Local setup

1. Install packages with npm install.
2. Create a Supabase project.
3. Run supabase/schema.sql in its SQL editor.
4. Copy .env.example to .env.local and add the Supabase credentials.
5. Start the app with npm run dev.
6. Visit http://localhost:3000.

For an existing database created before crypto checkout, run
supabase/crypto-checkout-migration.sql once. Checkout remains compatible before
migration by storing the asset, network, and transaction hash in the legacy
external-payment-reference column.

## Crypto checkout

Supported assets, required networks, public wallet addresses, and
transaction-hash validation rules live in lib/crypto-payments.ts.

Checkout creates a payment_pending order before displaying its wallet
destination. After transfer, the customer submits the blockchain transaction
hash. The order then becomes payment_submitted; it must still be manually
verified on-chain before being marked paid.

Never add wallet private keys or recovery phrases to this repository or to
Vercel environment variables.

## Product catalog

The storefront reads data/products.json at build time. To capture the public
source catalog in a git-ignored directory, run npm run scrape:superclone.

After reviewing the scrape, import it with npm run import:superclone. Product
images are served locally from public/superclone-products.

## Verification and deployment

Build with npm run build and serve locally with npm run start. Deploy through
the linked Vercel project and configure the same Supabase variables from
.env.local in the Vercel project settings.

## Key directories

- app: pages and route handlers
- components: shared interface components
- data: product and brand indexes
- lib: catalog, crypto payment, and Supabase helpers
- store: persistent cart state
- supabase: base schema and migrations
