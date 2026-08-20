import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { getAllProducts, getAllBrands } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const products = getAllProducts();
  const brands = getAllBrands();
  const featured = products.slice(0, 8);
  const heroImage = products[0]?.images[0];

  return (
    <main>
      {/* Hero */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden border-b border-line">
        <div className="absolute inset-0">
          {heroImage && (
            <ProductImage
              src={heroImage}
              alt=""
              fill
              priority
              className="object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-obsidian/40" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
          <div className="stagger max-w-2xl">
            <p className="text-xs uppercase tracking-widest2 text-gold">
              Est. Fine Timepieces
            </p>
            <h1 className="mt-6 font-display text-5xl italic leading-[1.05] text-parchment sm:text-6xl lg:text-7xl">
              Time, <span className="text-shimmer animate-shimmer not-italic">Mastered</span>.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-bone/70">
              346 rare and iconic references across our in-house
              collections — each piece inspected and delivered worldwide.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="bg-gold px-8 py-4 text-sm uppercase tracking-wider text-obsidian transition-colors hover:bg-gold-light"
              >
                Explore The Collection
              </Link>
              <Link
                href="/brand/marinier"
                className="border border-line px-8 py-4 text-sm uppercase tracking-wider text-bone/80 transition-colors hover:border-gold hover:text-gold"
              >
                Shop Marinier
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brand strip */}
      <section className="border-b border-line bg-charcoal py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 lg:px-10">
          {brands.map((b) => (
            <Link
              key={b.slug}
              href={`/brand/${b.slug}`}
              className="font-display text-sm uppercase tracking-widest2 text-bone/50 transition-colors hover:text-gold"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest2 text-gold">Curated Selection</p>
            <h2 className="mt-2 font-display text-3xl text-parchment">Featured Timepieces</h2>
          </div>
          <Link
            href="/shop"
            className="hidden text-sm uppercase tracking-wider text-bone/70 hover:text-gold sm:block"
          >
            View All &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Editorial band */}
      <section className="border-y border-line bg-charcoal">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-20 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-widest2 text-gold">The Promise</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-parchment sm:text-4xl">
              Inspected. Insured.
              <br />
              Delivered With Care.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-bone/70">
              Every timepiece that leaves our atelier is inspected by our
              in-house horologists, backed by a two-year international
              warranty, and shipped fully insured — wherever you are in the
              world.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-block border-b border-gold pb-1 text-sm uppercase tracking-wider text-gold"
            >
              Discover the Collection
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {products.slice(8, 12).map((p) => (
              <div key={p.id} className="relative aspect-square overflow-hidden bg-ink">
                {p.images[0] && (
                  <ProductImage
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
