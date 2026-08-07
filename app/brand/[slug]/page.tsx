import { notFound } from "next/navigation";
import {
  getProductsByBrand,
  getBrandNameFromSlug,
  getAllBrands,
} from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export function generateStaticParams() {
  return getAllBrands().map((b) => ({ slug: b.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const name = getBrandNameFromSlug(params.slug);
  return { title: name ? `${name} | Royal Luxury Watches` : "Brand Not Found" };
}

export default function BrandPage({ params }: { params: { slug: string } }) {
  const brandName = getBrandNameFromSlug(params.slug);
  if (!brandName) notFound();

  const products = getProductsByBrand(params.slug);

  return (
    <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
      <p className="text-xs uppercase tracking-widest2 text-gold">Collection</p>
      <h1 className="mt-2 font-display text-5xl italic text-parchment">{brandName}</h1>
      <p className="mt-4 text-sm text-bone/60">{products.length} timepieces</p>

      <div className="rule my-10" />

      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
