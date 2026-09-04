import Link from "next/link";
import { getAllBrands } from "@/lib/products";

export default function Footer() {
  const brands = getAllBrands();

  return (
    <footer className="border-t border-line bg-charcoal/80">
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <span className="font-display text-3xl font-light text-parchment">
              Royal<span className="italic text-gold">.</span>
            </span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-bone/60">
              A curated house of fine in-house timepieces. Every watch is
              inspected and shipped with a two-year international warranty.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs uppercase tracking-widest2 text-gold">
              Collections
            </h4>
            <ul className="space-y-2">
              {brands.slice(0, 6).map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/brand/${b.slug}`}
                    className="text-sm text-bone/70 hover:text-gold transition-colors"
                  >
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs uppercase tracking-widest2 text-gold">
              Client Care
            </h4>
            <ul className="space-y-2 text-sm text-bone/70">
              <li>
                <Link href="/shop" className="hover:text-gold transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-gold transition-colors">
                  Your Bag
                </Link>
              </li>
              <li>International Shipping</li>
              <li>2-Year Warranty</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs uppercase tracking-widest2 text-gold">
              The House
            </h4>
            <p className="mb-5 text-sm leading-relaxed text-bone/60">
              Discover the complete world of Royal and find the reference that feels entirely your own.
            </p>
            <Link href="/shop" className="inline-block border-b border-gold/60 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold transition-colors hover:text-gold-light">Explore all timepieces</Link>
          </div>
        </div>

        <div className="rule my-10" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-bone/40 md:flex-row">
          <span>© {new Date().getFullYear()} Royal Luxury Watches. All rights reserved.</span>
          <span>Crafted with precision.</span>
        </div>
      </div>
    </footer>
  );
}
