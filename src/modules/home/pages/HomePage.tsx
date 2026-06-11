"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { MapPin, Store, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ProductGrid } from "@/modules/products/components/ProductGrid";
import { bannerService, type BannerDto } from "@/services/banner.service";
import { categoryService, type CategoryDto } from "@/services/category.service";
import { productService } from "@/services/product.service";
import { promotionService, type PromotionDto } from "@/services/promotion.service";
import { storeService, type StoreDto } from "@/services/store.service";
import type { Product } from "@/types/product";

type HomeState = {
  banners: BannerDto[];
  categories: CategoryDto[];
  bestSellingProducts: Product[];
  newestProducts: Product[];
  promotions: PromotionDto[];
  stores: StoreDto[];
};

const initialHomeState: HomeState = {
  banners: [],
  categories: [],
  bestSellingProducts: [],
  newestProducts: [],
  promotions: [],
  stores: [],
};

const safeData = async <T,>(request: Promise<{ data: T }>, fallback: T) => {
  try {
    const response = await request;
    return response.data ?? fallback;
  } catch {
    return fallback;
  }
};

function HomeSection({
  title,
  description,
  actionHref,
  children,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-normal">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actionHref ? (
          <Button asChild variant="outline">
            <Link href={actionHref}>Xem tat ca</Link>
          </Button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ProductSection({
  title,
  description,
  products,
  loading,
}: {
  title: string;
  description?: string;
  products: Product[];
  loading: boolean;
}) {
  return (
    <HomeSection title={title} description={description} actionHref="/products">
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-80 w-full" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState
          title="Chua co san pham"
          description="Danh sach san pham se hien thi khi backend tra ve du lieu."
        />
      )}
    </HomeSection>
  );
}

function HeroBannerCarousel({ banners, loading }: { banners: BannerDto[]; loading: boolean }) {
  if (loading) {
    return <LoadingSkeleton className="h-[260px] w-full md:h-[360px]" />;
  }

  if (banners.length === 0) {
    return (
      <EmptyState
        title="Chua co banner"
        description="Banner trang chu se hien thi sau khi backend tra ve du lieu."
      />
    );
  }

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 4500, disableOnInteraction: false }}
      loop={banners.length > 1}
      className="overflow-hidden rounded-md border bg-card"
    >
      {banners.map((banner) => (
        <SwiperSlide key={banner.id}>
          <Link href={banner.href || "/products"} className="relative block h-[260px] md:h-[360px]">
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              priority
              sizes="(min-width: 1024px) 80vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
            <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-center p-5 text-white md:p-8">
              <p className="mb-3 inline-flex w-fit rounded-md bg-white/20 px-3 py-1 text-sm font-semibold">
                Uu dai online
              </p>
              <h1 className="text-3xl font-bold leading-tight tracking-normal md:text-5xl">
                {banner.title}
              </h1>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

function CategoryGrid({
  categories,
  loading,
}: {
  categories: CategoryDto[];
  loading: boolean;
}) {
  return (
    <HomeSection title="Danh muc san pham" description="Chon nhanh nhom hang can mua" actionHref="/categories">
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {categories.slice(0, 12).map((category, index) => (
            <Link
              key={category.id || category._id || category.slug || `${category.name}-${index}`}
              href={`/categories/${category.slug || category.id || category._id}`}
              className="rounded-md border bg-card p-4 transition-colors hover:border-primary hover:bg-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold text-primary">
                {category.name.slice(0, 1)}
              </div>
              <p className="mt-3 line-clamp-2 text-sm font-semibold">{category.name}</p>
              {typeof category.productCount === "number" ? (
                <p className="mt-1 text-xs text-muted-foreground">{category.productCount} san pham</p>
              ) : null}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Chua co danh muc"
          description="Danh muc san pham se hien thi khi co du lieu tu backend."
        />
      )}
    </HomeSection>
  );
}

function PromotionSection({
  promotions,
  loading,
}: {
  promotions: PromotionDto[];
  loading: boolean;
}) {
  return (
    <HomeSection title="Khuyen mai" description="Chuong trinh uu dai dang dien ra" actionHref="/promotions">
      {loading ? (
        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-36 w-full" />
          ))}
        </div>
      ) : promotions.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-3">
          {promotions.slice(0, 3).map((promotion) => (
            <Link key={promotion.id} href={`/promotions/${promotion.slug}`}>
              <Card className="h-full overflow-hidden shadow-none transition hover:border-primary">
                {promotion.banner ? (
                  <div className="relative h-32 bg-muted">
                    <Image
                      src={promotion.banner}
                      alt={promotion.title}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Tag className="h-4 w-4" />
                    <p className="text-xs font-semibold">Uu dai</p>
                  </div>
                  <h3 className="mt-2 font-semibold">{promotion.title}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="Chua co khuyen mai" description="Cac chuong trinh uu dai se duoc cap nhat tai day." />
      )}
    </HomeSection>
  );
}

function MiddleBanner({ banner }: { banner?: BannerDto }) {
  if (!banner) return null;

  return (
    <Link
      href={banner.href || "/promotions"}
      className="relative block overflow-hidden rounded-md border bg-card"
    >
      <div className="relative h-40 md:h-56">
        <Image
          src={banner.image}
          alt={banner.title}
          fill
          sizes="(min-width: 1024px) 80vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />
        <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-center p-5 text-white md:p-8">
          <p className="text-sm font-semibold">Banner giua trang</p>
          <h2 className="mt-2 text-2xl font-bold tracking-normal md:text-4xl">{banner.title}</h2>
        </div>
      </div>
    </Link>
  );
}

function StoreSelection({ stores, loading }: { stores: StoreDto[]; loading: boolean }) {
  if (loading) {
    return <LoadingSkeleton className="h-20 w-full" />;
  }

  if (stores.length === 0) {
    return null;
  }

  return (
    <section className="rounded-md border bg-card p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Store className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold">Chon sieu thi gan ban</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {stores[0].name} - {stores[0].address}
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/stores">
            <MapPin className="mr-2 h-4 w-4" />
            Doi cua hang
          </Link>
        </Button>
      </div>
    </section>
  );
}

export function HomePage() {
  const [homeData, setHomeData] = useState<HomeState>(initialHomeState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchHomeData = async () => {
      setLoading(true);

      const [
        banners,
        categories,
        bestSellingProducts,
        newestProducts,
        promotions,
        stores,
      ] = await Promise.all([
        safeData(bannerService.getBanners(), []),
        safeData(categoryService.getCategoryTree(), []),
        safeData(productService.getProducts({ sort: "best_selling", limit: 10 }), []),
        safeData(productService.getProducts({ sort: "newest", limit: 10 }), []),
        safeData(promotionService.getPromotions({ limit: 6 }), []),
        safeData(storeService.getStores({ limit: 3 }), []),
      ]);

      if (!mounted) return;

      setHomeData({
        banners,
        categories,
        bestSellingProducts,
        newestProducts,
        promotions,
        stores,
      });
      setLoading(false);
    };

    void fetchHomeData();

    return () => {
      mounted = false;
    };
  }, []);

  const suggestedProducts = useMemo(() => {
    const merged = [...homeData.bestSellingProducts, ...homeData.newestProducts];
    const uniqueProducts = new Map(
      merged.map((product) => [product.id || product._id || product.slug || product.name, product]),
    );
    return Array.from(uniqueProducts.values()).slice(0, 10);
  }, [homeData.bestSellingProducts, homeData.newestProducts]);

  return (
    <div className="grid gap-6">
      <HeroBannerCarousel banners={homeData.banners} loading={loading} />
      <StoreSelection stores={homeData.stores} loading={loading} />
      <CategoryGrid categories={homeData.categories} loading={loading} />
      <ProductSection
        title="San pham ban chay"
        description="Nhung mat hang duoc khach hang mua nhieu"
        products={homeData.bestSellingProducts}
        loading={loading}
      />
      <MiddleBanner banner={homeData.banners[1]} />
      <ProductSection
        title="San pham moi"
        description="Hang moi len ke trong ngay"
        products={homeData.newestProducts}
        loading={loading}
      />
      <PromotionSection promotions={homeData.promotions} loading={loading} />
      <ProductSection
        title="Goi y hom nay"
        description="Lua chon phu hop cho gio hang hien tai"
        products={suggestedProducts}
        loading={loading}
      />
    </div>
  );
}
