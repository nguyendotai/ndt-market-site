import { ProductGrid as BaseProductGrid } from "@/components/product/ProductGrid";
import type { ProductListItem } from "@/modules/products/types";

export function ProductGrid({
  products,
  compact = false,
  className,
}: {
  products: ProductListItem[];
  compact?: boolean;
  className?: string;
}) {
  return <BaseProductGrid products={products} compact={compact} className={className} />;
}
