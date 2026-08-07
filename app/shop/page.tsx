import { Suspense } from "react";
import { getAllProducts, getAllBrands } from "@/lib/products";
import ShopGrid from "@/components/ShopGrid";

export const metadata = { title: "Shop All Watches | Royal Luxury Watches" };

export default function ShopPage() {
  const products = getAllProducts();
  const brands = getAllBrands();

  return (
    <Suspense fallback={null}>
      <ShopGrid products={products} brands={brands} />
    </Suspense>
  );
}
