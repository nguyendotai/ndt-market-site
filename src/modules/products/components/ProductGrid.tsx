import { ProductGrid as BaseProductGrid } from "@/components/product/ProductGrid";
import type { ProductListItem } from "@/modules/products/types";

export function ProductGrid({ products }: { products: ProductListItem[] }) {
  return <BaseProductGrid products={products} />;
}
