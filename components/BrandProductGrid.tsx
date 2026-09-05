import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export default function BrandProductGrid({ products }: { products: Product[] }) {
  return (
    <>
      <p className="mb-7 text-[10px] font-semibold uppercase tracking-[0.16em] text-bone/40">
        Showing all {products.length} timepieces
      </p>
      <div className="grid grid-cols-1 gap-x-5 gap-y-11 min-[460px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
