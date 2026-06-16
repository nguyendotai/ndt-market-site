import { ProductCard } from "@/components/product/ProductCard";
import type { Product, ProductVariant } from "@/types/product";
import { cn } from "@/lib/utils";

export type ProductGridProps = {
  products: Product[];
  className?: string;
  compact?: boolean;
};

type ProductGridItem = {
  product: Product;
  variant?: ProductVariant;
};

export function ProductGrid({ products, className, compact = false }: ProductGridProps) {
  const items: ProductGridItem[] = products.flatMap((product) => {
    const variants = product.productVariants?.length ? product.productVariants : product.variants;

    if (!variants?.length) {
      return [{ product }];
    }

    return variants.map((variant) => ({ product, variant }));
  });

  const getVariantKey = (variant?: ProductVariant) =>
    variant?.id || variant?._id || variant?.sku || variant?.value || variant?.name;

  return (
    <div
      className={cn(
        "grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5",
        compact && "grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
        className,
      )}
    >
      {items.map(({ product, variant }, index) => (
        <ProductCard
          key={[
            product.id || product._id || product.slug || product.name,
            getVariantKey(variant),
            index,
          ]
            .filter(Boolean)
            .join("-")}
          product={product}
          variant={variant}
          compact={compact}
        />
      ))}
    </div>
  );
}
