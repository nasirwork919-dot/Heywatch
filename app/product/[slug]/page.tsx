import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProductBySlug,
  getAllProducts,
  formatPrice,
  getRelatedProducts,
} from "@/lib/products-data";
import ProductGallery from "@/components/ProductGallery";
import AddToCartPanel from "@/components/AddToCartPanel";
import ProductCard from "@/components/ProductCard";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  return { title: product ? `${product.name} | Royal Luxury Watches` : "Not Found" };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const related = getRelatedProducts(product);
  const specEntries = Object.entries(product.spec).filter(([, v]) => v);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
      <nav className="mb-8 text-xs text-bone/50">
        <Link href="/shop" className="hover:text-gold">
          Shop
        </Link>{" "}
        /{" "}
        <Link href={`/brand/${product.brand.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-gold">
          {product.brand}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />

        <div>
          <p className="text-xs uppercase tracking-widest2 text-gold">{product.brand}</p>
          <h1 className="mt-2 font-display text-3xl leading-tight text-parchment sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl text-bone/90">
            {formatPrice(product.price, product.currency)}
          </p>

          <AddToCartPanel product={product} />

          {specEntries.length > 0 && (
            <div className="mt-10 border-t border-line pt-8">
              <h3 className="mb-4 text-xs uppercase tracking-widest2 text-gold">
                Specifications
              </h3>
              <dl className="grid grid-cols-2 gap-y-3 text-sm">
                {specEntries.map(([key, value]) => (
                  <div key={key} className="col-span-2 grid grid-cols-2 border-b border-line/50 pb-2">
                    <dt className="text-bone/50">{key}</dt>
                    <dd className="text-bone/90">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-8 border-t border-line pt-8">
            <h3 className="mb-4 text-xs uppercase tracking-widest2 text-gold">
              About This Piece
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-bone/70">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 font-display text-2xl text-parchment">
            More from {product.brand}
          </h2>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

