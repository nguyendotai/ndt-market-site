"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Store, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ProductCard } from "@/components/product/ProductCard";
import { bannerService, type BannerDto } from "@/services/banner.service";
import { categoryService, type CategoryDto } from "@/services/category.service";
import { productService } from "@/services/product.service";
import {
  promotionService,
  type PromotionDto,
} from "@/services/promotion.service";
import { storeService, type StoreDto } from "@/services/store.service";
import { env } from "@/configs/env";
import type { Product } from "@/types/product";

type HomeState = {
  banners: BannerDto[];
  categories: CategoryDto[];
  bestSellingProducts: Product[];
  newestProducts: Product[];
  categoryProductSections: CategoryProductSection[];
  promotions: PromotionDto[];
  stores: StoreDto[];
};

type CategoryProductSection = {
  category: CategoryDto;
  products: Product[];
};

const initialHomeState: HomeState = {
  banners: [],
  categories: [],
  bestSellingProducts: [],
  newestProducts: [],
  categoryProductSections: [],
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

const resolveAssetUrl = (value?: string) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/"))
    return new URL(value, env.apiUrl.replace(/\/api\/?.*$/, "")).toString();
  return value;
};

const getBannerImage = (banner?: BannerDto) =>
  resolveAssetUrl(
    banner?.imageUrl ||
      banner?.desktopImage ||
      banner?.mobileImage ||
      banner?.image ||
      banner?.thumbnail,
  );

const getBannerHref = (banner: BannerDto, fallback: string) =>
  banner.href || banner.link || banner.linkUrl || fallback;

const isActiveBanner = (banner: BannerDto) =>
  !banner.status || banner.status === "ACTIVE";

const getBannersByPosition = (banners: BannerDto[], position: string) =>
  banners
    .filter(
      (banner) =>
        isActiveBanner(banner) &&
        banner.position === position &&
        getBannerImage(banner),
    )
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

const getCategoryHref = (category: CategoryDto) =>
  `/categories/${encodeURIComponent(category.slug || String(category.id || category._id || ""))}`;

const getCategoryBannerImage = (category: CategoryDto) =>
  resolveAssetUrl(category.bannerImage || category.banner || category.imageUrl || category.image || category.thumbnail);

const flattenCategories = (categories: CategoryDto[]) => {
  const result: CategoryDto[] = [];
  const walk = (items: CategoryDto[]) => {
    items.forEach((item) => {
      result.push(item);
      if (item.children?.length) walk(item.children);
    });
  };
  walk(categories);
  return result;
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
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
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

function ProductCarouselGrid({
  products,
  loading,
}: {
  products: Product[];
  loading: boolean;
}) {
  const [offset, setOffset] = useState(0);
  const canShift = products.length > 12;
  const visibleProducts = products.slice(offset, offset + 12);

  useEffect(() => {
    setOffset(0);
  }, [products]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <LoadingSkeleton key={index} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="Chua co san pham"
        description="Danh sach san pham se hien thi khi backend tra ve du lieu."
      />
    );
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
        {visibleProducts.map((product, index) => (
          <ProductCard
            key={product.id || product._id || product.slug || `${product.name}-${offset}-${index}`}
            product={product}
            compact
          />
        ))}
      </div>

      {canShift ? (
        <>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="absolute left-2 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full bg-background/95 shadow-sm"
            disabled={offset === 0}
            aria-label="Xem san pham truoc"
            onClick={() => setOffset(0)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="absolute right-2 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full bg-background/95 shadow-sm"
            disabled={offset > 0}
            aria-label="Xem san pham tiep theo"
            onClick={() => setOffset(2)}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      ) : null}
    </div>
  );
}

function FeaturedProductTabs({
  tabs,
  loading,
}: {
  tabs: Array<{
    id: string;
    label: string;
    href: string;
    products: Product[];
  }>;
  loading: boolean;
}) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0]?.id ?? "");
    }
  }, [activeTab, tabs]);

  if (!active) return null;

  return (
    <section className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-normal">San pham noi bat</h2>
          <p className="mt-1 text-sm text-muted-foreground">Chon nhanh nhom san pham ban muon xem.</p>
        </div>
        <div className="flex overflow-x-auto rounded-md border bg-card p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={[
                "h-9 shrink-0 rounded px-3 text-sm font-semibold transition-colors",
                active.id === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              ].join(" ")}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <ProductCarouselGrid products={active.products} loading={loading} />

      <div className="flex justify-center">
        <Button asChild variant="link" className="text-base font-semibold">
          <Link href={active.href}>Xem tat ca</Link>
        </Button>
      </div>
    </section>
  );
}

function CategoryProductSection({
  title,
  bannerImage,
  href,
  products,
  loading,
}: {
  title: string;
  bannerImage?: string;
  href: string;
  products: Product[];
  loading: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-md bg-muted/60 p-3 md:p-4">
      <div className="grid gap-3">
        {bannerImage ? (
          <div className="rounded-md bg-muted">
            <Link
              href={href}
              className="relative block h-28 w-full overflow-hidden rounded-md bg-card md:h-32 lg:w-[41.666%]"
            >
              <Image
                src={bannerImage}
                alt={title}
                fill
                unoptimized
                sizes="(min-width: 1024px) 30vw, 100vw"
                className="object-contain"
              />
            </Link>
          </div>
        ) : (
          <div className="flex min-h-24 items-center rounded-md bg-card px-4">
            <h2 className="text-2xl font-bold tracking-normal">{title}</h2>
          </div>
        )}

        <ProductCarouselGrid products={products} loading={loading} />

        <div className="flex justify-center">
          <Button asChild variant="link" className="text-base font-semibold">
            <Link href={href}>Xem tat ca</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function HeroBannerCarousel({
  banners,
  loading,
}: {
  banners: BannerDto[];
  loading: boolean;
}) {
  const visibleBanners = banners
    .map((banner) => ({
      banner,
      image: getBannerImage(banner),
    }))
    .filter((item) => item.image);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeBannerIndex = visibleBanners.length
    ? activeIndex % visibleBanners.length
    : 0;
  const activeBanner = visibleBanners[activeBannerIndex] ?? visibleBanners[0];

  useEffect(() => {
    if (visibleBanners.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % visibleBanners.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [visibleBanners.length]);

  if (loading) {
    return <LoadingSkeleton className="h-[260px] w-full md:h-[360px]" />;
  }

  if (visibleBanners.length === 0) {
    return (
      <EmptyState
        title="Chua co banner"
        description="Banner trang chu se hien thi sau khi backend tra ve du lieu."
      />
    );
  }

  return (
    <section className="relative h-[260px] overflow-hidden rounded-md border bg-card md:h-[360px]">
      <Link
        href={getBannerHref(activeBanner.banner, "/products")}
        className="absolute inset-0 block"
      >
        <Image
          key={activeBanner.image}
          src={activeBanner.image}
          alt={activeBanner.banner.title}
          fill
          priority
          unoptimized
          sizes="(min-width: 1024px) 80vw, 100vw"
          className="object-cover"
        />
      </Link>

      {visibleBanners.length > 1 ? (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {visibleBanners.map((item, index) => (
            <button
              key={item.banner.id || item.banner._id || item.banner.title}
              type="button"
              aria-label={`Chuyen den banner ${index + 1}`}
              className={[
                "h-2.5 rounded-full transition-all",
                activeBannerIndex === index
                  ? "w-8 bg-white"
                  : "w-2.5 bg-white/60 hover:bg-white",
              ].join(" ")}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function CategoryGrid({
  categories,
  loading,
}: {
  categories: CategoryDto[];
  loading: boolean;
}) {
  const getCategoryImage = (category: CategoryDto) =>
    resolveAssetUrl(category.imageUrl || category.image || category.icon || category.thumbnail);

  return (
    <HomeSection title="Danh mục sản phẩm" actionHref="/categories">
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
              key={
                category.id ||
                category._id ||
                category.slug ||
                `${category.name}-${index}`
              }
              href={`/categories/${category.slug || category.id || category._id}`}
              className="grid gap-3 rounded-md border bg-card p-3 text-center transition-colors hover:border-primary hover:bg-accent"
            >
              <span className="relative mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-bold text-primary">
                {getCategoryImage(category) ? (
                  <Image
                    src={getCategoryImage(category)}
                    alt={category.name}
                    fill
                    unoptimized
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  category.name.slice(0, 1)
                )}
              </span>
              <p className="line-clamp-2 min-h-10 text-sm font-semibold">
                {category.name}
              </p>
              {typeof category.productCount === "number" ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {category.productCount} Sản phẩm
                </p>
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
    <HomeSection
      title="Khuyen mai"
      description="Chuong trinh uu dai dang dien ra"
      actionHref="/promotions"
    >
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
        <EmptyState
          title="Chua co khuyen mai"
          description="Cac chuong trinh uu dai se duoc cap nhat tai day."
        />
      )}
    </HomeSection>
  );
}

function MiddleBanner({ banner }: { banner?: BannerDto }) {
  const image = getBannerImage(banner);

  if (!banner || !image) return null;

  return (
    <Link
      href={getBannerHref(banner, "/promotions")}
      className="relative block overflow-hidden rounded-md border bg-card"
    >
      <div className="relative h-40 md:h-56">
        <Image
          src={image}
          alt={banner.title}
          fill
          sizes="(min-width: 1024px) 80vw, 100vw"
          className="object-cover"
        />
      </div>
    </Link>
  );
}

function StoreSelection({
  stores,
  loading,
}: {
  stores: StoreDto[];
  loading: boolean;
}) {
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
        safeData(
          productService.getProducts({ sort: "best_selling", limit: 14 }),
          [],
        ),
        safeData(productService.getProducts({ sort: "newest", limit: 14 }), []),
        safeData(promotionService.getPromotions({ limit: 6 }), []),
        safeData(storeService.getStores({ limit: 3 }), []),
      ]);

      if (!mounted) return;

      const categoryProductSections = await Promise.all(
        flattenCategories(categories)
          .filter((category) => category.productCount !== 0)
          .map(async (category) => {
            const categoryKey = category.slug || String(category.id || category._id || "");
            const products = await safeData(
              productService.getProducts({ category: categoryKey, limit: 14 }),
              [],
            );

            return {
              category,
              products,
            };
          }),
      );

      if (!mounted) return;

      setHomeData({
        banners,
        categories,
        bestSellingProducts,
        newestProducts,
        categoryProductSections: categoryProductSections.filter((section) => section.products.length > 0),
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
    const merged = [
      ...homeData.bestSellingProducts,
      ...homeData.newestProducts,
    ];
    const uniqueProducts = new Map(
      merged.map((product) => [
        product.id || product._id || product.slug || product.name,
        product,
      ]),
    );
    return Array.from(uniqueProducts.values()).slice(0, 14);
  }, [homeData.bestSellingProducts, homeData.newestProducts]);

  const featuredProductTabs = useMemo(
    () => [
      {
        id: "best-selling",
        label: "San pham ban chay",
        href: "/products?sort=best_selling",
        products: homeData.bestSellingProducts,
      },
      {
        id: "newest",
        label: "San pham moi",
        href: "/products?sort=newest",
        products: homeData.newestProducts,
      },
      {
        id: "suggested",
        label: "Goi y hom nay",
        href: "/products",
        products: suggestedProducts,
      },
    ],
    [homeData.bestSellingProducts, homeData.newestProducts, suggestedProducts],
  );

  const heroBanners = useMemo(() => {
    const homeTopBanners = getBannersByPosition(homeData.banners, "HOME_TOP");
    return homeTopBanners.length
      ? homeTopBanners
      : homeData.banners.filter((banner) => isActiveBanner(banner));
  }, [homeData.banners]);

  const middleBanner = useMemo(
    () => getBannersByPosition(homeData.banners, "HOME_MIDDLE")[0],
    [homeData.banners],
  );

  return (
    <div className="grid gap-6">
      <HeroBannerCarousel banners={heroBanners} loading={loading} />
      <StoreSelection stores={homeData.stores} loading={loading} />
      <CategoryGrid categories={homeData.categories} loading={loading} />
      <FeaturedProductTabs
        tabs={featuredProductTabs}
        loading={loading}
      />
      {homeData.categoryProductSections.map((section) => (
        <CategoryProductSection
          key={section.category.id || section.category._id || section.category.slug}
          title={section.category.name}
          bannerImage={getCategoryBannerImage(section.category)}
          href={getCategoryHref(section.category)}
          products={section.products}
          loading={loading}
        />
      ))}
      <MiddleBanner banner={middleBanner} />
      <PromotionSection promotions={homeData.promotions} loading={loading} />
    </div>
  );
}
