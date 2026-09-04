import { Suspense } from "react";
import { getAllProducts, getAllBrands } from "@/lib/products-data";
import ShopGrid from "@/components/ShopGrid";

export const metadata = {
  title: "Shop All Watches",
  description: "Explore the complete Royal Luxury Watches collection.",
};

export default function ShopPage() {
  const products = getAllProducts();
  const brands = getAllBrands();

  return (
    <Suspense fallback={null}>
      <ShopGrid products={products} brands={brands} />
    </Suspense>
  );
}

