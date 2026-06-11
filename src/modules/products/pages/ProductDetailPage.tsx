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
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { ProductGrid } from "@/components/product/ProductGrid";
import { QuantityInput } from "@/components/product/QuantityInput";
import { Breadcrumb } from "@/modules/products/components/Breadcrumb";
import { cartService } from "@/services/cart.service";
import { productService } from "@/services/product.service";
import { reviewService, type ReviewDto } from "@/services/review.service";
import { wishlistService } from "@/services/wishlist.service";
import type { Product, ProductVariant } from "@/types/product";

type ProductDetailPageProps = {
  slug: string;
};

const fallbackProductImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80";

type ProductTab = "description" | "ingredients" | "reviews";

const tabs: Array<{ value: ProductTab; label: string }> = [
  { value: "description", label: "Mo ta" },
  { value: "ingredients", label: "Thanh phan" },
  { value: "reviews", label: "Danh gia" },
];

const isProductInStock = (product: Product | null, variant?: ProductVariant, storeId?: string | null) => {
  if (!product) return false;
  if (storeId && product.stock === 0) return false;
  if (variant) return variant.inStock !== false && variant.stock !== 0;
  return product.inStock !== false && product.stock !== 0;
};

const getProductId = (product: Product) => product.id || product._id || product.slug || product.name;

const getCategoryLabel = (category: Product["category"]) => {
  if (typeof category === "string") return category;
  return category?.name || "San pham";
};

export function ProductDetailPage({ slug }: ProductDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");
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
        setSelectedVariant(
          productResponse.data.productVariants?.[0] ?? productResponse.data.variants?.[0],
        );
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
  }, [slug]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const images = product.images?.filter(Boolean);
    if (images?.length) return images;
    return [product.image || product.thumbnail || fallbackProductImage];
  }, [product]);

  const currentPrice = selectedVariant?.salePrice ?? selectedVariant?.price ?? product?.price ?? 0;
  const currentCompareAtPrice = selectedVariant?.compareAtPrice ?? product?.compareAtPrice;
  const inStock = isProductInStock(product, selectedVariant, storeId);
  const productVariants = product?.productVariants?.length ? product.productVariants : product?.variants;

  const addToCart = async (buyNow = false) => {
    if (!product || !inStock) return;
    setCartLoading(true);

    try {
      await cartService.addItem({
        productId: getProductId(product),
        quantity,
        variantId: selectedVariant?.id || selectedVariant?._id,
        storeId: storeId || undefined,
      });
      toast.success("Da them vao gio hang");
      if (buyNow) router.push("/checkout");
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

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.7fr)]">
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
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-secondary text-secondary" />
                  {reviews.length ? "Co danh gia" : "Chua co danh gia"}
                </span>
                <span>{product.unit}</span>
                <span className={inStock ? "text-success" : "text-destructive"}>
                  {inStock ? "Con hang" : "Het hang"}
                </span>
              </div>
            </div>

            <PriceDisplay
              price={currentPrice}
              compareAtPrice={currentCompareAtPrice}
              unit={product.unit}
              className="text-2xl"
            />

            {productVariants?.length ? (
              <div className="grid gap-2">
                <p className="text-sm font-semibold">Chon phan loai</p>
                <div className="flex flex-wrap gap-2">
                  {productVariants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      className={[
                        "rounded-md border px-3 py-2 text-sm transition-colors",
                        selectedVariant?.id === variant.id
                          ? "border-primary bg-accent text-accent-foreground"
                          : "bg-background hover:bg-accent",
                      ].join(" ")}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      {variant.name || variant.value}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid gap-2">
              <p className="text-sm font-semibold">So luong</p>
              <QuantityInput value={quantity} max={product.stock || 99} onChange={setQuantity} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                className="gap-2"
                disabled={!inStock || cartLoading}
                onClick={() => addToCart(false)}
              >
                <ShoppingCart className="h-4 w-4" />
                Them vao gio
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={!inStock || cartLoading}
                onClick={() => addToCart(true)}
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
                <p>Don vi: {product.unit}</p>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <p>Bao quan: {product.storageInstruction || "Bao quan noi kho mat, dung theo huong dan tren bao bi."}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-md border bg-card">
        <div className="flex overflow-x-auto border-b">
          {tabs.map((tab) => (
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
            <p className="leading-7 text-muted-foreground">
              {product.description || "Mo ta san pham dang duoc cap nhat."}
            </p>
          ) : null}
          {activeTab === "ingredients" ? (
            <p className="leading-7 text-muted-foreground">
              {product.ingredients || "Thanh phan san pham dang duoc cap nhat."}
            </p>
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
    </div>
  );
}
