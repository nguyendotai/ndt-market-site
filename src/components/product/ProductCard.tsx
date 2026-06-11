"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { addToCart } from "@/store/slices/cartSlice";
import { useAppDispatch } from "@/store/hooks";
import type { Product, ProductImage, ProductVariant } from "@/types/product";

const fallbackProductImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80";

const getProductId = (product: Product) => product.id || product._id || product.slug || product.name;

const getVariantId = (variant?: ProductVariant) =>
  variant?.id || variant?._id || variant?.barcode || variant?.sku || variant?.value || variant?.name;

const getCategoryLabel = (category: Product["category"]) => {
  if (typeof category === "string") return category;
  return category?.name || "San pham";
};

const getImageUrl = (image?: string | ProductImage) => {
  if (!image) return "";
  return typeof image === "string" ? image : image.imageUrl;
};

const getProductThumbnail = (product: Product) => {
  const thumbnail = product.images?.find((image) => typeof image !== "string" && image.isThumbnail);
  return (
    product.imageUrl ||
    product.image ||
    product.thumbnail ||
    getImageUrl(thumbnail) ||
    getImageUrl(product.images?.[0])
  );
};

const getVariantLabel = (variant?: ProductVariant) => {
  if (!variant) return "";
  return variant.name || variant.value || variant.sku || "";
};

export function ProductCard({
  product,
  variant,
}: {
  product: Product;
  variant?: ProductVariant;
}) {
  const dispatch = useAppDispatch();
  const productId = getProductId(product);
  const variantId = getVariantId(variant);
  const productDetailHref = `/products/${encodeURIComponent(product.slug || productId)}${
    variantId ? `?variant=${encodeURIComponent(variantId)}` : ""
  }`;
  const variantImage = variant?.imageUrl || variant?.image || variant?.images?.[0];
  const productImage =
    variantImage || getProductThumbnail(product) || fallbackProductImage;
  const categoryLabel = getCategoryLabel(product.category);
  const variantLabel = getVariantLabel(variant);
  const displayName = variantLabel ? `${product.name} - ${variantLabel}` : product.name;
  const displayPrice = variant?.salePrice ?? variant?.price ?? product.price ?? 0;
  const displayCompareAtPrice =
    variant?.compareAtPrice ??
    (variant?.salePrice && variant.price ? variant.price : product.compareAtPrice);
  const displayUnit = variant?.unit || product.unit || "san pham";
  const inStock = variant
    ? variant.status !== "OUT_OF_STOCK" && variant.inStock !== false && variant.stock !== 0
    : product.status !== "OUT_OF_STOCK" && product.inStock !== false && product.stock !== 0;

  return (
    <Card className="group overflow-hidden rounded-md border bg-card shadow-none transition hover:border-primary/60 hover:shadow-sm">
      <div className="relative aspect-square bg-muted">
        {product.discountLabel ? (
          <span className="absolute left-2 top-2 z-10 rounded-md bg-secondary px-2 py-1 text-xs font-bold text-secondary-foreground">
            {product.discountLabel}
          </span>
        ) : null}
        {product.badge ? (
          <span className="absolute right-2 top-2 z-10 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
            {product.badge}
          </span>
        ) : null}
        <Link
          href={productDetailHref}
          aria-label={`Xem chi tiet ${displayName}`}
          className="absolute inset-0"
        >
          <Image
            src={productImage}
            alt={displayName}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>
      </div>
      <CardContent className="space-y-3 p-3">
        <div>
          <p className="text-xs font-medium text-primary">{categoryLabel}</p>
          <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-medium leading-5">
            <Link href={productDetailHref} className="transition-colors hover:text-primary">
              {displayName}
            </Link>
          </h3>
        </div>
        <div className="space-y-1">
          <PriceDisplay
            price={displayPrice}
            unit={displayUnit}
            compareAtPrice={displayCompareAtPrice}
            className="gap-x-2 gap-y-0"
          />
          {product.promoNote ? (
            <p className="min-h-5 text-xs font-medium text-success">{product.promoNote}</p>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className={inStock ? "text-xs text-muted-foreground" : "text-xs text-destructive"}>
            {inStock ? "Con hang" : "Het hang"}
          </p>
          <Button
            size="sm"
            className="h-9 gap-1 px-3"
            disabled={!inStock}
            aria-label={`Them ${displayName} vao gio`}
            onClick={() => {
              dispatch(
                addToCart({
                  productId,
                  variantId,
                  name: displayName,
                  price: displayPrice,
                  unit: displayUnit,
                }),
              );
              toast.success("Da them vao gio hang");
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
