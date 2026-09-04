import Link from "next/link";
import { ArrowRight, Globe2, ShieldCheck, Sparkles } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import ProductCard from "@/components/ProductCard";
import { getAllBrands, getAllProducts } from "@/lib/products-data";

export default function Home() {
  const products = getAllProducts();
  const brands = getAllBrands();
  const featured = products.slice(0, 8);
  const heroProduct = products[0];
  const heroSecondary = products[40] ?? products[1];
  const heroTertiary = products[120] ?? products[2];
  const editorialProduct = products[40] ?? products[8] ?? heroProduct;
  const signatureEdits = [
    {
      label: "The daily icon",
      title: "Quiet confidence",
      copy: "Clean proportions and enduring finishes for every day.",
      product: products[12] ?? heroProduct,
    },
    {
      label: "After dark",
      title: "Evening distinction",
      copy: "A stronger silhouette for moments that call for presence.",
      product: products[Math.floor(products.length / 2)] ?? heroSecondary,
    },
    {
      label: "Modern sport",
      title: "Built for motion",
      copy: "Technical character balanced with a refined point of view.",
      product: products[products.length - 18] ?? heroTertiary,
    },
  ];
  const collectionCards = brands.map((brand) => ({
    ...brand,
    product: products.find((product) => product.brand === brand.name),
  }));

  return (
    <main className="overflow-hidden">
      <section className="relative flex min-h-[78vh] items-center overflow-hidden border-b border-line/80 bg-obsidian">
        {heroProduct && heroSecondary && heroTertiary && (
          <div className="absolute inset-0 grid grid-cols-1 sm:grid-cols-3">
            {[heroProduct, heroSecondary, heroTertiary].map((product, index) => (
              <div key={product.id} className={`relative overflow-hidden ${index > 0 ? "hidden sm:block" : ""}`}>
                <ProductImage src={product.images[0] || ""} alt="" fill priority={index === 0} sizes="(max-width: 640px) 100vw, 34vw" className="object-cover" />
              </div>
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(9,8,6,0.2)_50%,rgba(9,8,6,0.58)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-obsidian/70 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-3xl text-center [text-shadow:0_2px_24px_rgba(0,0,0,0.75)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-light">A private world of time</p>
            <h1 className="mt-6 font-display text-5xl font-light leading-[0.98] text-white sm:text-6xl lg:text-7xl">
              Crafted for the moment.
              <span className="mt-2 block italic text-gold-light">Chosen for a lifetime.</span>
            </h1>
            <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
              Explore {products.length} distinctive timepieces across {brands.length} curated collections—selected for presence, detail, and enduring style.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/shop" className="inline-flex items-center gap-3 bg-gold px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.19em] text-obsidian shadow-lg transition-colors hover:bg-gold-light">
                Shop all watches <ArrowRight size={14} />
              </Link>
              <Link href="/brand/marinier" className="border border-white/60 bg-black/20 px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.19em] text-white backdrop-blur-sm transition-colors hover:border-gold hover:bg-black/35 hover:text-gold-light">
                View featured collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line/80 bg-charcoal/65">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 divide-y divide-line/70 px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-12">
          {[
            { icon: ShieldCheck, title: "Inspected", copy: "Quality checked before dispatch" },
            { icon: Globe2, title: "Delivered worldwide", copy: "Secure, insured international shipping" },
            { icon: Sparkles, title: "Two-year warranty", copy: "Long-term confidence with every piece" },
          ].map(({ icon: Icon, title, copy }) => (
            <div key={title} className="flex items-center gap-4 px-2 py-5 md:px-7">
              <Icon size={18} strokeWidth={1.4} className="shrink-0 text-gold" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-parchment/85">{title}</p>
                <p className="mt-1 text-xs text-bone/40">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">The house collections</p>
            <h2 className="mt-3 font-display text-3xl font-light text-parchment sm:text-4xl">Choose your character.</h2>
          </div>
          <Link href="/shop" className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-bone/50 transition-colors hover:text-gold sm:flex">View all <ArrowRight size={13} /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {collectionCards.map(({ name, slug, count, product }) => (
            <Link key={slug} href={`/brand/${slug}`} className="group relative aspect-[4/5] overflow-hidden border border-line/70 bg-ink">
              {product && <ProductImage src={product.images[0] || ""} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw" className="object-cover opacity-75 transition duration-700 group-hover:scale-[1.035] group-hover:opacity-90" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="font-display text-2xl font-light text-white">{name}</p>
                <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-white/70">{count} timepieces</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-line/80 bg-ink/55">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="eyebrow">Find your signature</p>
            <h2 className="mt-4 font-display text-3xl font-light text-parchment sm:text-5xl">A watch for every rhythm.</h2>
            <p className="mt-5 text-sm leading-7 text-bone/50">Three distinct directions, each selected from our real collection to help you begin with a feeling rather than a specification.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {signatureEdits.map(({ label, title, copy, product }) => product && (
              <Link key={label} href={`/product/${product.slug}`} className="group relative min-h-[460px] overflow-hidden border border-line/80 bg-charcoal sm:min-h-[540px]">
                <ProductImage src={product.images[0] || ""} alt={product.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/10" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-light">{label}</p>
                  <h3 className="mt-3 font-display text-3xl font-light text-white">{title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">{copy}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-colors group-hover:text-gold-light">
                    View timepiece <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line/80 bg-charcoal/55">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mb-11 flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Curated selection</p>
              <h2 className="mt-3 font-display text-3xl font-light text-parchment sm:text-4xl">Notable timepieces.</h2>
            </div>
            <Link href="/shop" className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-gold transition-colors hover:text-gold-light sm:flex">Shop the collection <ArrowRight size={13} /></Link>
          </div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-11 min-[460px]:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      {editorialProduct && (
        <section className="mx-auto grid max-w-[1440px] items-stretch px-5 py-20 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-28">
          <div className="relative min-h-[440px] overflow-hidden bg-[#efede8] lg:min-h-[620px]">
            <ProductImage src={editorialProduct.images[0] || ""} alt={editorialProduct.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="luxury-panel flex items-center px-7 py-14 sm:px-12 lg:px-16">
            <div className="max-w-md">
              <p className="eyebrow">The Royal promise</p>
              <h2 className="mt-5 font-display text-4xl font-light leading-tight text-parchment sm:text-5xl">Considered in every detail.</h2>
              <p className="mt-7 text-sm leading-7 text-bone/55">Every timepiece is selected with an eye for proportion, finish, and character, then carefully inspected before it begins its journey to you.</p>
              <Link href={`/product/${editorialProduct.slug}`} className="mt-9 inline-flex items-center gap-3 border-b border-gold/60 pb-2 text-[10px] font-semibold uppercase tracking-[0.19em] text-gold transition-colors hover:text-gold-light">Explore this reference <ArrowRight size={13} /></Link>
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-line/80 bg-charcoal/60">
        <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="eyebrow">Your time, considered</p>
              <h2 className="mt-4 font-display text-4xl font-light leading-tight text-parchment sm:text-5xl">Choosing well should feel effortless.</h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-bone/55">Begin with the collection that speaks to you, compare the details that matter, and discover the piece that feels unmistakably yours.</p>
              <Link href="/shop" className="mt-8 inline-flex items-center gap-3 bg-gold px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.19em] text-obsidian transition-colors hover:bg-gold-light">
                Begin your search <ArrowRight size={14} />
              </Link>
            </div>

            <ol className="grid border-y border-line/80 sm:grid-cols-3 sm:border-y-0">
              {[
                { number: "01", title: "Discover", copy: "Explore five distinct house collections." },
                { number: "02", title: "Compare", copy: "Consider movement, finish, size, and strap." },
                { number: "03", title: "Choose", copy: "Select the watch that fits your life." },
              ].map(({ number, title, copy }) => (
                <li key={number} className="border-b border-line/80 py-8 last:border-b-0 sm:border-b-0 sm:border-l sm:px-7 sm:first:border-l-0">
                  <span className="font-display text-3xl italic text-gold/55">{number}</span>
                  <h3 className="mt-7 font-display text-2xl font-light text-parchment">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-bone/45">{copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}
