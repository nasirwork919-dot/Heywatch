import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProductBySlug,
  getAllProducts,
  getAllBrands,
  formatPrice,
  getRelatedProducts,
} from "@/lib/products-data";
import ProductGallery from "@/components/ProductGallery";
import AddToCartPanel from "@/components/AddToCartPanel";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, ChevronRight, Globe2, ShieldCheck, Sparkles } from "lucide-react";

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  return {
    title: product ? product.name : "Not Found",
    description: product?.description.slice(0, 155),
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const related = getRelatedProducts(product);
  const specEntries = Object.entries(product.spec).filter(([, value]) => value);
  const brandSlug = getAllBrands().find((brand) => brand.name === product.brand)?.slug;

  return (
    <main>
      <div className="border-b border-line/70 bg-charcoal/40">
        <nav
          className="mx-auto flex max-w-[1440px] items-center gap-2 overflow-hidden px-5 py-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-bone/40 sm:px-8 lg:px-12"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="shrink-0 transition-colors hover:text-gold">Home</Link>
          <ChevronRight size={11} className="shrink-0" />
          <Link href="/shop" className="shrink-0 transition-colors hover:text-gold">Watches</Link>
          {brandSlug && (
            <>
              <ChevronRight size={11} className="shrink-0" />
              <Link href={`/brand/${brandSlug}`} className="truncate transition-colors hover:text-gold">{product.brand}</Link>
            </>
          )}
        </nav>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <ProductGallery images={product.images} alt={product.name} />

          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold/70" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-light">{product.brand}</p>
            </div>
            <h1 className="mt-5 font-display text-3xl font-light leading-[1.12] text-parchment sm:text-4xl lg:text-[2.75rem]">{product.name}</h1>
            <p className="mt-4 text-[10px] uppercase tracking-[0.17em] text-bone/35">
              {product.sku ? `Reference · ${product.sku}` : "Curated collection"}
            </p>

            <div className="luxury-panel mt-8 p-6 sm:p-7">
              <div className="flex items-end justify-between gap-4 border-b border-line/70 pb-5">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-bone/40">Price</p>
                  <div className="mt-2 flex flex-wrap items-baseline gap-3">
                    <p className="font-display text-3xl font-light text-parchment">{formatPrice(product.price, product.currency)}</p>
                    {product.compareAtPrice && (
                      <p className="text-sm text-bone/35 line-through">{formatPrice(product.compareAtPrice, product.currency)}</p>
                    )}
                  </div>
                </div>
                <p className="pb-1 text-[9px] uppercase tracking-[0.14em] text-bone/35">{product.currency}</p>
              </div>
              <p className="mt-5 text-sm leading-6 text-bone/55">
                A distinctive piece from the {product.brand} collection, selected for finish, proportion, and presence.
              </p>
              <AddToCartPanel product={product} />
              <p className="mt-4 text-center text-[10px] leading-5 text-bone/35">Shipping and any applicable taxes are calculated at checkout.</p>
            </div>

            <div className="mt-6 grid grid-cols-3 divide-x divide-line/70 border-y border-line/70 py-5">
              {[
                { icon: ShieldCheck, title: "Inspected", copy: "Quality checked" },
                { icon: Globe2, title: "Worldwide", copy: "Insured delivery" },
                { icon: Sparkles, title: "Protected", copy: "2-year warranty" },
              ].map(({ icon: Icon, title, copy }) => (
                <div key={title} className="px-2 text-center first:pl-0 last:pr-0">
                  <Icon size={16} className="mx-auto text-gold" strokeWidth={1.4} />
                  <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-parchment/80">{title}</p>
                  <p className="mt-1 hidden text-[10px] text-bone/35 sm:block">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-20 grid gap-12 border-y border-line/70 py-14 lg:mt-28 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24 lg:py-20">
          <div>
            <p className="eyebrow">The timepiece</p>
            <h2 className="mt-4 font-display text-3xl font-light text-parchment sm:text-4xl">Designed in the details.</h2>
            <p className="mt-6 max-w-lg whitespace-pre-line text-sm leading-7 text-bone/60">{product.description}</p>
            {brandSlug && (
              <Link
                href={`/brand/${brandSlug}`}
                className="mt-8 inline-flex items-center gap-3 border-b border-gold/60 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold transition-colors hover:text-gold-light"
              >
                Explore {product.brand} <ArrowRight size={13} />
              </Link>
            )}
          </div>

          {specEntries.length > 0 && (
            <div>
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">Specifications</p>
              <dl className="grid border-t border-line/70 sm:grid-cols-2">
                {specEntries.map(([key, value], index) => (
                  <div
                    key={key}
                    className={`border-b border-line/70 py-5 sm:px-6 ${index % 2 === 0 ? "sm:border-r sm:pl-0" : "sm:pr-0"}`}
                  >
                    <dt className="text-[9px] font-semibold uppercase tracking-[0.15em] text-bone/35">{key}</dt>
                    <dd className="mt-2 text-sm text-parchment/85">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>

        {related.length > 0 && (
          <section className="mt-24 lg:mt-32">
            <p className="eyebrow">Continue exploring</p>
            <div className="mb-9 mt-3 flex items-end justify-between gap-6">
              <h2 className="font-display text-3xl font-light text-parchment">More from {product.brand}</h2>
              {brandSlug && (
                <Link href={`/brand/${brandSlug}`} className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-gold hover:text-gold-light sm:flex">
                  View collection <ArrowRight size={13} />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 gap-x-5 gap-y-10 min-[460px]:grid-cols-2 lg:grid-cols-4">
              {related.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
