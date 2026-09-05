import { notFound } from "next/navigation";
import {
  getProductsByBrand,
  getBrandNameFromSlug,
  getAllBrands,
} from "@/lib/products-data";
import BrandProductGrid from "@/components/BrandProductGrid";
import BrandModelGrid from "@/components/BrandModelGrid";
import { getBrandModels } from "@/lib/brand-models";

export function generateStaticParams() {
  return getAllBrands().map((b) => ({ slug: b.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const name = getBrandNameFromSlug(params.slug);
  return {
    title: name || "Collection Not Found",
    description: name ? `Explore the ${name} collection from HEYWATCHES.` : undefined,
  };
}

export default function BrandPage({ params }: { params: { slug: string } }) {
  const brandName = getBrandNameFromSlug(params.slug);
  if (!brandName) notFound();

  const products = getProductsByBrand(params.slug);
  const models = getBrandModels(params.slug);

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <p className="eyebrow">House collection</p>
      <h1 className="mt-3 font-display text-5xl font-light italic text-parchment sm:text-6xl">{brandName}</h1>
      <p className="mt-5 max-w-xl text-sm leading-7 text-bone/50">
        {models.length > 0
          ? `Explore ${products.length} timepieces across ${models.length} distinct model families.`
          : `A distinctive edit of ${products.length} timepieces, united by character and considered detail.`}
      </p>

      <div className="rule my-10" />

      {models.length > 0 ? (
        <BrandModelGrid brandSlug={params.slug} models={models} total={products.length} />
      ) : (
        <BrandProductGrid products={products} />
      )}
    </div>
  );
}

