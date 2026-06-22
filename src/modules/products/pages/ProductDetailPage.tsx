"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Heart, PackageCheck, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { AddToCartModal, type AddToCartModalSelection } from "@/components/product/AddToCartModal";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { ProductGrid } from "@/components/product/ProductGrid";
import { QuantityInput } from "@/components/product/QuantityInput";
import { Breadcrumb } from "@/modules/products/components/Breadcrumb";
import { addCartItem, setCartDeliveryType, setCartStore } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { productService } from "@/services/product.service";
import { reviewService, type ReviewDto } from "@/services/review.service";
import { wishlistService } from "@/services/wishlist.service";
import { getAvailableStock, isInventoryAvailable } from "@/lib/inventory";
import type { Product, ProductComboItem, ProductImage, ProductVariant } from "@/types/product";

type ProductDetailPageProps = {
  slug: string;
};

const fallbackProductImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80";

type ProductTab = "description" | "ingredients" | "combo" | "reviews";

const tabs: Array<{ value: ProductTab; label: string }> = [
  { value: "description", label: "Mo ta" },
  { value: "ingredients", label: "Thanh phan" },
  { value: "combo", label: "Combo" },
  { value: "reviews", label: "Danh gia" },
];

const isProductInStock = (product: Product | null, variant?: ProductVariant, storeId?: string | null) => {
  if (!product) return false;
  if (storeId && product.stock === 0) return false;
  if (variant) return variant.status !== "OUT_OF_STOCK" && variant.inStock !== false && variant.stock !== 0;
  return product.status !== "OUT_OF_STOCK" && product.inStock !== false && product.stock !== 0;
};

const getProductId = (product: Product) => product.id || product._id || product.slug || product.name;

const getVariantId = (variant?: ProductVariant) =>
  variant?.id || variant?._id || variant?.barcode || variant?.sku || variant?.name;

const isVariantSelected = (current?: ProductVariant, next?: ProductVariant) =>
  Boolean(getVariantId(current) && getVariantId(current) === getVariantId(next));

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

const getBaseQuantityFromDisplay = (variant: ProductVariant | undefined, quantity: number) =>
  Math.round(quantity * getConversionRate(variant));

const getMinimumOrderQuantity = (variant?: ProductVariant) =>
  getDisplayQuantityFromBase(variant, getMinimumOrderQuantityBase(variant));

const getStepQuantity = (variant?: ProductVariant) =>
  getDisplayQuantityFromBase(variant, Math.max(1, variant?.stepQuantity ?? getConversionRate(variant)));

const getMaximumOrderQuantity = (variant?: ProductVariant, product?: Product | null) =>
  getDisplayQuantityFromBase(variant, variant?.maxOrderQuantity ?? variant?.stock ?? product?.stock ?? 99);

const sanitizeHtml = (html?: string) =>
  (html || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\sjavascript:/gi, "");

const formatIngredients = (ingredients?: string | string[]) => {
  if (Array.isArray(ingredients)) return ingredients.filter(Boolean).join(", ");
  return ingredients;
};

const getComboProductName = (item: ProductComboItem) => {
  if (typeof item.product === "string") return item.product;
  return item.product.name;
};

const getComboVariantName = (item: ProductComboItem) => {
  if (!item.variant || typeof item.variant === "string") return "";
  return item.variant.name || item.variant.value || item.variant.sku || "";
};

export function ProductDetailPage({ slug }: ProductDetailPageProps) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const currentStoreId = useAppSelector((state) => state.cart.storeId);
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");
  const requestedVariantId = searchParams.get("variant");
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<ProductTab>("description");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [buyNowAfterAdd, setBuyNowAfterAdd] = useState(false);
  const [variantInventory, setVariantInventory] = useState<{
    variantId: string;
    stock: number;
    inStock: boolean;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const [productResponse, relatedResponse, reviewsResponse] = await Promise.all([
          productService.getProductBySlug(slug),
          productService.getRelatedProducts(slug).catch(() => ({ data: [] as Product[] })),
          reviewService.getProductReviews(slug).catch(() => ({ data: [] as ReviewDto[] })),
        ]);

        if (!mounted) return;
        setProduct(productResponse.data);
        const variants = productResponse.data.variants?.length
          ? productResponse.data.variants
          : productResponse.data.productVariants;
        const requestedVariant = variants?.find((variant) => getVariantId(variant) === requestedVariantId);
        setSelectedVariant(requestedVariant ?? variants?.[0]);
        setRelatedProducts(relatedResponse.data ?? []);
        setReviews(reviewsResponse.data ?? []);
      } catch {
        if (!mounted) return;
        setProduct(null);
        setRelatedProducts([]);
        setReviews([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchProductDetail();

    return () => {
      mounted = false;
    };
  }, [requestedVariantId, slug]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const variantImage = selectedVariant?.imageUrl || selectedVariant?.image || selectedVariant?.images?.[0];
    const productImages = product.images?.map(getImageUrl).filter(Boolean) ?? [];
    const images = [variantImage, ...productImages, getProductThumbnail(product)].filter(
      (image): image is string => Boolean(image),
    );
    return Array.from(new Set(images.length ? images : [fallbackProductImage]));
  }, [product, selectedVariant]);

  const currentSalePrice = getSalePrice(selectedVariant?.salePrice);
  const currentPrice = currentSalePrice ?? selectedVariant?.price ?? product?.price ?? 0;
  const currentCompareAtPrice =
    currentSalePrice
      ? selectedVariant?.compareAtPrice ?? selectedVariant?.price ?? product?.compareAtPrice
      : undefined;
  const currentVariantId = getVariantId(selectedVariant);
  const matchedInventory =
    currentVariantId && variantInventory?.variantId === currentVariantId ? variantInventory : null;
  const inStock =
    storeId && selectedVariant && matchedInventory
      ? matchedInventory.inStock && matchedInventory.stock > 0
      : isProductInStock(product, selectedVariant, storeId);
  const productVariants = product?.variants?.length ? product.variants : product?.productVariants;
  const currentUnit = selectedVariant?.unit || selectedVariant?.sellUnit || product?.unit || "san pham";
  const minOrderQuantity = getMinimumOrderQuantity(selectedVariant);
  const stepQuantity = getStepQuantity(selectedVariant);
  const stock = matchedInventory?.stock ?? selectedVariant?.stock ?? product?.stock;
  const currentCartItem = cartItems.find((item) => item.variantId === currentVariantId);
  const currentCartQuantityBase = currentCartItem?.quantityBase ?? currentCartItem?.quantity ?? 0;
  const remainingStockBase = typeof stock === "number" ? stock - currentCartQuantityBase : undefined;
  const remainingStock = remainingStockBase === undefined
    ? undefined
    : getDisplayQuantityFromBase(selectedVariant, remainingStockBase);
  const maxOrderQuantity = Math.max(
    minOrderQuantity,
    Math.min(getMaximumOrderQuantity(selectedVariant, product), remainingStock ?? 99),
  );
  const canAddToCart = Boolean(currentVariantId) && inStock;

  const selectVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setActiveImage(0);
    setQuantity(getMinimumOrderQuantity(variant));
  };

  useEffect(() => {
    setQuantity((current) =>
      Math.min(
        Math.max(getMinimumOrderQuantity(selectedVariant), current),
        maxOrderQuantity,
      ),
    );
  }, [maxOrderQuantity, selectedVariant]);

  const getVariantImage = (variant?: ProductVariant) =>
    variant?.imageUrl ||
    variant?.image ||
    variant?.images?.[0] ||
    (product ? getProductThumbnail(product) : "") ||
    fallbackProductImage;

  const getVariantName = (variant?: ProductVariant) =>
    variant?.name || variant?.value || variant?.barcode || variant?.sku || "Mac dinh";

  const getVariantPrice = (variant?: ProductVariant) =>
    getSalePrice(variant?.salePrice) ?? variant?.price ?? product?.price ?? 0;

  const getVariantCompareAtPrice = (variant?: ProductVariant) => {
    const salePrice = getSalePrice(variant?.salePrice);
    return salePrice ? variant?.compareAtPrice ?? variant?.price ?? product?.compareAtPrice : undefined;
  };

  const isVariantInStock = (variant?: ProductVariant) =>
    variant?.status !== "OUT_OF_STOCK" && variant?.inStock !== false && variant?.stock !== 0;

  useEffect(() => {
    let mounted = true;
    const variantId = getVariantId(selectedVariant);

    if (!storeId || !variantId) return;

    const fetchInventory = async () => {
      try {
        const response = await productService.getVariantInventory(variantId, storeId);
        if (!mounted) return;
        setVariantInventory({
          variantId: String(variantId),
          stock: getAvailableStock(response.data, storeId) ?? 0,
          inStock: isInventoryAvailable(response.data, storeId),
        });
      } catch {
        if (!mounted) return;
        setVariantInventory(null);
      }
    };

    void fetchInventory();

    return () => {
      mounted = false;
    };
  }, [selectedVariant, storeId]);

  const openAddToCartModal = (buyNow = false) => {
    if (!product || !inStock) return;
    setBuyNowAfterAdd(buyNow);
    setCartModalOpen(true);
  };

  const confirmAddToCart = async ({ storeId: selectedStoreId, deliveryType }: AddToCartModalSelection) => {
    if (!product || !inStock) return;
    setCartLoading(true);

    try {
      dispatch(setCartDeliveryType(deliveryType));
      if (currentStoreId !== selectedStoreId) {
        await dispatch(setCartStore(selectedStoreId)).unwrap();
      }
      const quantityBase = getBaseQuantityFromDisplay(selectedVariant, quantity);
      const effectiveCartQuantityBase = currentStoreId === selectedStoreId ? currentCartQuantityBase : 0;
      let availableStock = stock;

      if (currentVariantId) {
        try {
          const inventoryResponse = await productService.getVariantInventory(currentVariantId, selectedStoreId);
          availableStock = getAvailableStock(inventoryResponse.data, selectedStoreId) ?? availableStock;
          if (!isInventoryAvailable(inventoryResponse.data, selectedStoreId)) {
            toast.error("San pham da het hang tai cua hang da chon");
            return;
          }
        } catch {
          availableStock = stock;
        }
      }

      const remainingAtStore =
        typeof availableStock === "number" ? availableStock - effectiveCartQuantityBase : undefined;

      if (remainingAtStore !== undefined && remainingAtStore <= 0) {
        toast.error("So luong trong gio da dat toi da ton kho");
        return;
      }

      if (remainingAtStore !== undefined && effectiveCartQuantityBase === 0 && quantityBase > remainingAtStore) {
        toast.error(
          `Ton kho khong du so luong toi thieu. Toi thieu ${quantityBase}, con ${remainingAtStore}.`,
        );
        return;
      }

      const quantityBaseToAdd =
        remainingAtStore === undefined ? quantityBase : Math.min(quantityBase, remainingAtStore);
      const quantityToAdd = getDisplayQuantityFromBase(selectedVariant, quantityBaseToAdd);
      const quantityPayload = isWeightBasedProduct(selectedVariant)
        ? { quantityBase: quantityBaseToAdd }
        : { quantity: quantityToAdd };

      await dispatch(addCartItem({
        productId: getProductId(product),
        variantId: getVariantId(selectedVariant),
        name: selectedVariant ? `${product.name} - ${getVariantName(selectedVariant)}` : product.name,
        price: currentPrice,
        unit: currentUnit,
        image: galleryImages[activeImage] || getProductThumbnail(product) || fallbackProductImage,
        stock: availableStock,
        inStock,
        ...quantityPayload,
        displayQuantity: quantityToAdd,
        displayUnit: currentUnit,
        inventoryUnit: selectedVariant?.inventoryUnit,
        priceUnit: selectedVariant?.sellUnit || currentUnit,
        saleType: selectedVariant?.saleType,
        storeId: selectedStoreId,
      })).unwrap();
      setCartModalOpen(false);
      toast.success("Da them vao gio hang");
      if (buyNowAfterAdd) router.push("/checkout");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Them gio hang that bai");
    } finally {
      setCartLoading(false);
    }
  };

  const addWishlist = async () => {
    if (!product) return;
    setWishlistLoading(true);

    try {
      await wishlistService.addToWishlist(getProductId(product));
      toast.success("Da them vao yeu thich");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Them yeu thich that bai");
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-5">
        <LoadingSkeleton className="h-6 w-64" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.7fr)]">
          <LoadingSkeleton className="h-[520px] w-full" />
          <LoadingSkeleton className="h-[520px] w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <EmptyState
        title="Khong tim thay san pham"
        description="San pham co the da ngung kinh doanh hoac duong dan khong dung."
      />
    );
  }

  return (
    <div className="grid gap-6">
      <Breadcrumb
        items={[
          { href: "/", label: "Trang chu" },
          { href: "/products", label: "San pham" },
          { label: product.name },
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.85fr)_minmax(380px,0.95fr)_320px] lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.7fr)]">
        <div className="grid gap-3">
          <div className="relative aspect-square overflow-hidden rounded-md border bg-card">
            <Image
              src={galleryImages[activeImage]}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {galleryImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                aria-label={`Xem anh ${index + 1}`}
                className={[
                  "relative aspect-square overflow-hidden rounded-md border bg-card",
                  activeImage === index ? "border-primary ring-2 ring-ring" : "",
                ].join(" ")}
                onClick={() => setActiveImage(index)}
              >
                <Image src={image} alt="" fill sizes="120px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        <Card className="h-fit shadow-none">
          <CardContent className="grid gap-5 p-5">
            <div>
              <p className="text-sm font-semibold text-primary">{getCategoryLabel(product.category)}</p>
              <h1 className="mt-2 text-3xl font-bold leading-tight tracking-normal">{product.name}</h1>
              {selectedVariant ? (
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  Dang chon: <span className="text-foreground">{getVariantName(selectedVariant)}</span>
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-secondary text-secondary" />
                  {reviews.length ? "Co danh gia" : "Chua co danh gia"}
                </span>
                <span>{currentUnit}</span>
                <span className={inStock ? "text-success" : "text-destructive"}>
                  {inStock ? "Con hang" : "Het hang"}
                </span>
              </div>
            </div>

            <PriceDisplay
              price={currentPrice}
              compareAtPrice={currentCompareAtPrice}
              unit={currentUnit}
              className="text-2xl"
            />

            {productVariants?.length ? (
              <div className="grid gap-2 xl:hidden">
                <p className="text-sm font-semibold">Chon phan loai</p>
                <div className="flex flex-wrap gap-2">
                  {productVariants.map((variant) => (
                    <button
                      key={getVariantId(variant)}
                      type="button"
                      className={[
                        "rounded-md border px-3 py-2 text-sm transition-colors",
                        isVariantSelected(selectedVariant, variant)
                          ? "border-primary bg-accent text-accent-foreground"
                          : "bg-background hover:bg-accent",
                      ].join(" ")}
                      onClick={() => selectVariant(variant)}
                    >
                      {getVariantName(variant)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid gap-2">
              <p className="text-sm font-semibold">So luong</p>
              <QuantityInput
                value={quantity}
                min={minOrderQuantity}
                max={maxOrderQuantity}
                step={stepQuantity}
                onChange={setQuantity}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                className="gap-2"
                disabled={!canAddToCart || cartLoading}
                onClick={() => openAddToCartModal(false)}
              >
                <ShoppingCart className="h-4 w-4" />
                Them vao gio
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={!canAddToCart || cartLoading}
                onClick={() => openAddToCartModal(true)}
              >
                Mua ngay
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={wishlistLoading}
              onClick={addWishlist}
            >
              <Heart className="h-4 w-4" />
              Them yeu thich
            </Button>

            <div className="grid gap-3 rounded-md bg-muted p-4 text-sm">
              <div className="flex gap-3">
                <PackageCheck className="h-5 w-5 text-primary" />
                <p>Nguon goc: {product.origin || "Dang cap nhat"}</p>
              </div>
              <div className="flex gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <p>Don vi: {currentUnit}</p>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <p>Bao quan: {product.storageInstruction || "Bao quan noi kho mat, dung theo huong dan tren bao bi."}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {productVariants?.length ? (
          <aside className="lg:col-span-2 xl:col-span-1">
            <Card className="h-fit shadow-none xl:sticky xl:top-24">
              <CardContent className="grid gap-3 p-4">
                <div>
                  <h2 className="text-base font-bold">Bien the cung san pham</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Chon dung quy cach ban muon mua.</p>
                </div>
                <div className="grid max-h-[520px] gap-2 overflow-y-auto pr-1">
                  {productVariants.map((variant) => {
                    const selected = isVariantSelected(selectedVariant, variant);
                    const variantStock = isVariantInStock(variant);

                    return (
                      <button
                        key={getVariantId(variant)}
                        type="button"
                        aria-pressed={selected}
                        className={[
                          "grid grid-cols-[72px_1fr] gap-3 rounded-md border bg-card p-2 text-left transition",
                          selected
                            ? "border-primary bg-accent shadow-sm"
                            : "hover:border-primary/60 hover:bg-muted/70",
                        ].join(" ")}
                        onClick={() => selectVariant(variant)}
                      >
                        <span className="relative aspect-square overflow-hidden rounded-md bg-muted">
                          <Image
                            src={getVariantImage(variant)}
                            alt={getVariantName(variant)}
                            fill
                            sizes="72px"
                            className="object-cover"
                          />
                        </span>
                        <span className="min-w-0 space-y-1">
                          <span className="line-clamp-2 text-sm font-semibold text-foreground">
                            {getVariantName(variant)}
                          </span>
                          <PriceDisplay
                            price={getVariantPrice(variant)}
                            compareAtPrice={getVariantCompareAtPrice(variant)}
                            unit={variant.unit || variant.sellUnit || product.unit}
                            className="gap-x-1 text-sm"
                          />
                          <span className={variantStock ? "block text-xs text-success" : "block text-xs text-destructive"}>
                            {variantStock ? "Con hang" : "Het hang"}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </aside>
        ) : null}
      </section>

      <section className="rounded-md border bg-card">
        <div className="flex overflow-x-auto border-b">
          {tabs
            .filter((tab) => tab.value !== "combo" || Boolean(product.comboItems?.length))
            .map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={[
                "min-h-12 px-5 text-sm font-semibold",
                activeTab === tab.value ? "border-b-2 border-primary text-primary" : "text-muted-foreground",
              ].join(" ")}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {activeTab === "description" ? (
            product.description ? (
              <div
                className="prose prose-sm max-w-none leading-7 text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
              />
            ) : (
              <p className="leading-7 text-muted-foreground">Mo ta san pham dang duoc cap nhat.</p>
            )
          ) : null}
          {activeTab === "ingredients" ? (
            <p className="leading-7 text-muted-foreground">
              {formatIngredients(product.ingredients) || "Thanh phan san pham dang duoc cap nhat."}
            </p>
          ) : null}
          {activeTab === "combo" ? (
            <div className="grid gap-3">
              {product.comboItems?.map((item, index) => (
                <div
                  key={item.id || item._id || `${getComboProductName(item)}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">{getComboProductName(item)}</p>
                    {getComboVariantName(item) ? (
                      <p className="mt-1 text-sm text-muted-foreground">{getComboVariantName(item)}</p>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-sm font-semibold">
                    {item.quantity} {item.unitLabel || ""}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
          {activeTab === "reviews" ? (
            <div className="grid gap-3">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="rounded-md border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{review.userName || "Khach hang"}</p>
                      <p className="text-sm text-muted-foreground">{review.rating}/5 sao</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{review.content}</p>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="Chua co danh gia"
                  description="Hay la nguoi dau tien danh gia san pham nay sau khi mua hang."
                />
              )}
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-normal">San pham lien quan</h2>
          <p className="mt-1 text-sm text-muted-foreground">Goi y them cho gio hang cua ban.</p>
        </div>
        {relatedProducts.length > 0 ? (
          <ProductGrid products={relatedProducts} />
        ) : (
          <EmptyState title="Chua co san pham lien quan" description="Backend chua tra ve goi y lien quan." />
        )}
      </section>
      <AddToCartModal
        open={cartModalOpen}
        productName={selectedVariant ? `${product.name} - ${getVariantName(selectedVariant)}` : product.name}
        loading={cartLoading}
        onClose={() => setCartModalOpen(false)}
        onConfirm={confirmAddToCart}
      />
    </div>
  );
}
