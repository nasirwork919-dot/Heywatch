import Link from "next/link";
import { getAllBrands } from "@/lib/products";

export default function Footer() {
  const brands = getAllBrands();

  return (
    <footer className="border-t border-line bg-charcoal">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <span className="font-display text-2xl text-parchment">
              Royal<span className="text-gold">.</span>
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
              Newsletter
            </h4>
            <p className="mb-3 text-sm text-bone/60">
              New arrivals and private offers, occasionally.
            </p>
            <form className="flex border-b border-line pb-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-transparent text-sm text-parchment placeholder:text-bone/40 focus:outline-none"
              />
              <button type="submit" className="text-xs uppercase tracking-wider text-gold">
                Join
              </button>
            </form>
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
