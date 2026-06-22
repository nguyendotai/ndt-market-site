"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AddToCartModal, type AddToCartModalSelection } from "@/components/product/AddToCartModal";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { addCartItem, setCartDeliveryType, setCartStore } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { productService } from "@/services/product.service";
import { getAvailableStock, isInventoryAvailable } from "@/lib/inventory";
import { cn } from "@/lib/utils";
import type { Product, ProductImage, ProductVariant } from "@/types/product";

const fallbackProductImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80";

const getProductId = (product: Product) => product.id || product._id || product.slug || product.name;

const getVariantId = (variant?: ProductVariant) =>
  variant?.id || variant?._id || variant?.barcode || variant?.sku || variant?.value || variant?.name;

const getCategoryLabel = (category: Product["category"]) => {
  if (typeof category === "string") return category;
  return category?.name || "Sản phẩm";
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

const getSalePrice = (value?: number) =>
  typeof value === "number" && value > 0 ? value : undefined;

const getConversionRate = (variant?: ProductVariant) =>
  Math.max(1, variant?.conversionRateToInventoryUnit ?? 1);

const getMinimumOrderQuantityBase = (variant?: ProductVariant) =>
  Math.max(1, variant?.minOrderQuantity ?? variant?.stepQuantity ?? getConversionRate(variant));

const isWeightBasedProduct = (variant?: ProductVariant) =>
  variant?.saleType === "WEIGHT_BASED_PRODUCT";

const getDisplayQuantityFromBase = (variant: ProductVariant | undefined, quantityBase: number) =>
  quantityBase / getConversionRate(variant);

export function ProductCard({
  product,
  variant,
  compact = false,
}: {
  product: Product;
  variant?: ProductVariant;
  compact?: boolean;
}) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const currentStoreId = useAppSelector((state) => state.cart.storeId);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const defaultVariant = variant ?? product.variants?.[0] ?? product.productVariants?.[0];
  const productId = getProductId(product);
  const variantId = getVariantId(defaultVariant);
  const productDetailHref = `/products/${encodeURIComponent(product.slug || productId)}${
    variantId ? `?variant=${encodeURIComponent(variantId)}` : ""
  }`;
  const variantImage = defaultVariant?.imageUrl || defaultVariant?.image || defaultVariant?.images?.[0];
  const productImage =
    variantImage || getProductThumbnail(product) || fallbackProductImage;
  const categoryLabel = getCategoryLabel(product.category);
  const variantLabel = getVariantLabel(defaultVariant);
  const displayName = variantLabel ? `${product.name} - ${variantLabel}` : product.name;
  const activeSalePrice = getSalePrice(defaultVariant?.salePrice);
  const displayPrice = activeSalePrice ?? defaultVariant?.price ?? product.price ?? 0;
  const displayCompareAtPrice =
    activeSalePrice
      ? defaultVariant?.compareAtPrice ?? defaultVariant?.price ?? product.compareAtPrice
      : undefined;
  const displayUnit = defaultVariant?.unit || defaultVariant?.sellUnit || product.unit || "sản phẩm";
  const inStock = defaultVariant
    ? defaultVariant.status !== "OUT_OF_STOCK" && defaultVariant.inStock !== false && defaultVariant.stock !== 0
    : product.status !== "OUT_OF_STOCK" && product.inStock !== false && product.stock !== 0;
  const minimumOrderQuantityBase = getMinimumOrderQuantityBase(defaultVariant);
  const minimumOrderQuantity = getDisplayQuantityFromBase(defaultVariant, minimumOrderQuantityBase);
  const stock = defaultVariant?.stock ?? product.stock;
  const currentCartItem = cartItems.find((item) => item.variantId === variantId);
  const currentCartQuantityBase = currentCartItem?.quantityBase ?? currentCartItem?.quantity ?? 0;

  const handleConfirmAddToCart = async ({ storeId, deliveryType }: AddToCartModalSelection) => {
    if (!variantId) return;
    setCartLoading(true);

    try {
      dispatch(setCartDeliveryType(deliveryType));
      if (currentStoreId !== storeId) {
        await dispatch(setCartStore(storeId)).unwrap();
      }
      const effectiveCartQuantityBase = currentStoreId === storeId ? currentCartQuantityBase : 0;
      let availableStock = stock;

      try {
        const inventoryResponse = await productService.getVariantInventory(variantId, storeId);
        availableStock = getAvailableStock(inventoryResponse.data, storeId) ?? availableStock;
        if (!isInventoryAvailable(inventoryResponse.data, storeId)) {
          toast.error("San pham da het hang tai cua hang da chon");
          return;
        }
      } catch {
        availableStock = stock;
      }

      const remainingAtStore =
        typeof availableStock === "number" ? availableStock - effectiveCartQuantityBase : undefined;

      if (remainingAtStore !== undefined && remainingAtStore <= 0) {
        toast.error("So luong trong gio da dat toi da ton kho");
        return;
      }

      if (remainingAtStore !== undefined && effectiveCartQuantityBase === 0 && minimumOrderQuantityBase > remainingAtStore) {
        toast.error(
          `Ton kho khong du so luong toi thieu. Toi thieu ${minimumOrderQuantityBase}, con ${remainingAtStore}.`,
        );
        return;
      }

      const quantityBaseToAdd =
        remainingAtStore === undefined
          ? minimumOrderQuantityBase
          : effectiveCartQuantityBase > 0
            ? Math.min(minimumOrderQuantityBase, remainingAtStore)
            : minimumOrderQuantityBase;
      const quantityToAdd = getDisplayQuantityFromBase(defaultVariant, quantityBaseToAdd);
      const quantityPayload = isWeightBasedProduct(defaultVariant)
        ? { quantityBase: quantityBaseToAdd }
        : { quantity: quantityToAdd };

      await dispatch(
        addCartItem({
          productId,
          variantId,
          name: displayName,
          price: displayPrice,
          unit: displayUnit,
          image: productImage,
          stock: availableStock,
          inStock,
          ...quantityPayload,
          displayQuantity: quantityToAdd,
          displayUnit,
          inventoryUnit: defaultVariant?.inventoryUnit,
          priceUnit: defaultVariant?.sellUnit || displayUnit,
          saleType: defaultVariant?.saleType,
          storeId,
        }),
      ).unwrap();
      setCartModalOpen(false);
      toast.success("Da them vao gio hang");
    } catch (error) {
      toast.error(String(error || "Khong the them vao gio hang"));
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <>
      <Card className="group flex flex-col overflow-hidden rounded-md border bg-card shadow-none transition hover:border-primary/60 hover:shadow-sm">
        <div className={cn("relative shrink-0 bg-muted", compact ? "aspect-[1.05/1]" : "aspect-[4/3]")}>
        {product.discountLabel ? (
          <span className={cn(
            "absolute left-2 top-2 z-10 rounded-md bg-secondary font-bold text-secondary-foreground",
            compact ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-1 text-xs",
          )}>
            {product.discountLabel}
          </span>
        ) : null}
        {product.badge ? (
          <span className={cn(
            "absolute right-2 top-2 z-10 rounded-md bg-primary font-semibold text-primary-foreground",
            compact ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-1 text-xs",
          )}>
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
            sizes={compact ? "(min-width: 1536px) 14vw, (min-width: 1024px) 18vw, 50vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"}
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>
      </div>
      <CardContent className={cn("flex flex-col", compact ? "gap-2 p-2.5" : "gap-3 p-3")}>
        <div className={compact ? "min-h-[70px]" : "min-h-[76px]"}>
          <p className="line-clamp-1 text-xs font-medium text-primary">{categoryLabel}</p>
          <h3 className={cn(
            "mt-1 line-clamp-2 font-medium",
            compact ? "min-h-9 text-[13px] leading-[18px]" : "min-h-10 text-sm leading-5",
          )}>
            <Link href={productDetailHref} className="transition-colors hover:text-primary">
              {displayName}
            </Link>
          </h3>
        </div>
        <div className={cn("min-h-[66px]", compact && "min-h-[58px]")}>
          <PriceDisplay
            price={displayPrice}
            unit={displayUnit}
            compareAtPrice={displayCompareAtPrice}
            className={cn("gap-x-2 gap-y-0", compact && "text-sm")}
          />
          <p className="line-clamp-1 min-h-5 text-xs font-medium text-success">
            {product.promoNote || ""}
          </p>
        </div>
        <div className="flex min-h-9 items-center justify-between gap-2">
          <p className={inStock ? "text-xs text-muted-foreground" : "text-xs text-destructive"}>
            {inStock ? "Còn hàng" : "Hết hàng"}
          </p>
          <Button
            size="sm"
            className={cn("gap-1", compact ? "h-8 px-2.5" : "h-9 px-3")}
            disabled={!inStock || !variantId}
            aria-label={`Them ${displayName} vao gio`}
            onClick={() => setCartModalOpen(true)}
          >
            <ShoppingCart className="h-4 w-4" />
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
      </Card>
      <AddToCartModal
        open={cartModalOpen}
        productName={displayName}
        loading={cartLoading}
        onClose={() => setCartModalOpen(false)}
        onConfirm={handleConfirmAddToCart}
      />
    </>
  );
}
