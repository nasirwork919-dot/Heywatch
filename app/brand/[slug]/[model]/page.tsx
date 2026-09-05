import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import BrandProductGrid from "@/components/BrandProductGrid";
import {
  getAllBrandModelParams,
  getBrandModel,
  getProductsByBrandModel,
} from "@/lib/brand-models";
import { getBrandNameFromSlug } from "@/lib/products-data";

export function generateStaticParams() {
  return getAllBrandModelParams();
}

export function generateMetadata({ params }: { params: { slug: string; model: string } }) {
  const brandName = getBrandNameFromSlug(params.slug);
  const model = params.model === "all" ? undefined : getBrandModel(params.slug, params.model);

  return {
    title: brandName ? `${brandName} ${model?.name ?? "Watches"}` : "Collection Not Found",
    description:
      brandName && model
        ? `Explore ${model.count} ${brandName} ${model.name} timepieces from HEYWATCHES.`
        : brandName
          ? `Explore all ${brandName} timepieces from HEYWATCHES.`
          : undefined,
  };
}

export default function BrandModelPage({ params }: { params: { slug: string; model: string } }) {
  const brandName = getBrandNameFromSlug(params.slug);
  const model = params.model === "all" ? undefined : getBrandModel(params.slug, params.model);

  if (!brandName || (params.model !== "all" && !model)) notFound();

  const products = getProductsByBrandModel(params.slug, params.model);
  const title = model ? `${brandName} ${model.name}` : `All ${brandName} Watches`;

  return (
    <main>
      <div className="border-b border-line/70 bg-charcoal/40">
        <nav
          aria-label="Breadcrumb"
          className="mx-auto flex max-w-[1440px] items-center gap-2 overflow-hidden px-5 py-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-bone/40 sm:px-8 lg:px-12"
        >
          <Link href="/" className="shrink-0 transition-colors hover:text-gold">Home</Link>
          <ChevronRight size={11} className="shrink-0" aria-hidden="true" />
          <Link href={`/brand/${params.slug}`} className="shrink-0 transition-colors hover:text-gold">
            {brandName}
          </Link>
          <ChevronRight size={11} className="shrink-0" aria-hidden="true" />
          <span className="truncate text-bone/65">{model?.name ?? "All watches"}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <p className="eyebrow">{model ? "Model collection" : "Complete collection"}</p>
        <h1 className="mt-3 font-display text-4xl font-light italic text-parchment sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-bone/50">
          {model?.description ?? `Browse every ${brandName} timepiece in the HEYWATCHES catalog.`}
        </p>

        <div className="rule my-10" />
        <BrandProductGrid products={products} />
      </div>
    </main>
  );
}
