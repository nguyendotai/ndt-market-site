import { ProductCard } from "@/components/product/ProductCard";
import type { Product, ProductVariant } from "@/types/product";
import { cn } from "@/lib/utils";

export type ProductGridProps = {
  products: Product[];
  className?: string;
};

type ProductGridItem = {
  product: Product;
  variant?: ProductVariant;
};

export function ProductGrid({ products, className }: ProductGridProps) {
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
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5", className)}>
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
        />
      ))}
    </div>
  );
}
