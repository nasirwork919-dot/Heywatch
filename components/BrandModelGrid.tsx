import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import type { BrandModel } from "@/lib/brand-models";

export default function BrandModelGrid({
  brandSlug,
  models,
  total,
}: {
  brandSlug: string;
  models: BrandModel[];
  total: number;
}) {
  return (
    <section aria-labelledby="model-directory-title">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Model directory</p>
          <h2 id="model-directory-title" className="mt-3 font-display text-3xl font-light text-parchment sm:text-4xl">
            Choose your collection.
          </h2>
        </div>
        <Link
          href={`/brand/${brandSlug}/all`}
          className="inline-flex items-center gap-2 self-start border-b border-gold/60 pb-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-gold transition-colors hover:text-gold-light sm:self-auto"
        >
          View all {total} watches <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 min-[460px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {models.map((model) => (
          <Link
            key={model.slug}
            href={`/brand/${brandSlug}/${model.slug}`}
            className="group overflow-hidden border border-line/80 bg-charcoal/55 transition-colors hover:border-gold/55 focus-visible:border-gold"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#efede8]">
              <ProductImage
                src={model.image}
                alt=""
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 460px) 50vw, 100vw"
                className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.035]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              <span className="absolute left-4 top-4 border border-black/10 bg-white/90 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#281f1d]/65">
                {model.count} references
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-display text-2xl font-light text-parchment transition-colors group-hover:text-gold-light">
                {model.name}
              </h3>
              <p className="mt-2 min-h-12 text-xs leading-6 text-bone/50">{model.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-gold">
                View collection <ArrowRight size={12} aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
