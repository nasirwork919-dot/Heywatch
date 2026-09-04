import { notFound } from "next/navigation";
import {
  getProductsByBrand,
  getBrandNameFromSlug,
  getAllBrands,
} from "@/lib/products-data";
import ProductCard from "@/components/ProductCard";

export function generateStaticParams() {
  return getAllBrands().map((b) => ({ slug: b.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const name = getBrandNameFromSlug(params.slug);
  return {
    title: name || "Collection Not Found",
    description: name ? `Explore the ${name} collection from Royal Luxury Watches.` : undefined,
  };
}

export default function BrandPage({ params }: { params: { slug: string } }) {
  const brandName = getBrandNameFromSlug(params.slug);
  if (!brandName) notFound();

  const products = getProductsByBrand(params.slug);

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <p className="eyebrow">House collection</p>
      <h1 className="mt-3 font-display text-5xl font-light italic text-parchment sm:text-6xl">{brandName}</h1>
      <p className="mt-5 max-w-xl text-sm leading-7 text-bone/50">A distinctive edit of {products.length} timepieces, united by character and considered detail.</p>

      <div className="rule my-10" />

      <div className="grid grid-cols-1 gap-x-5 gap-y-11 min-[460px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

