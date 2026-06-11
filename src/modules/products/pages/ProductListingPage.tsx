"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ProductGrid } from "@/modules/products/components/ProductGrid";
import {
  MobileFilterDrawer,
  ProductFilters,
  defaultProductFilters,
  type ProductFilterValues,
} from "@/modules/products/components/ProductFilters";
import { Breadcrumb } from "@/modules/products/components/Breadcrumb";
import { ProductSort } from "@/modules/products/components/ProductSort";
import { categoryService, type CategoryDto } from "@/services/category.service";
import { productService, type ProductQueryParams } from "@/services/product.service";
import type { Product } from "@/types/product";
import type { ApiMeta } from "@/services/types";

const PAGE_LIMIT = 20;

type ProductListingPageProps = {
  categorySlug?: string;
  searchQueryParam?: "keyword" | "q";
  title?: string;
  description?: string;
  showSearchSections?: boolean;
};

const readFiltersFromParams = (
  searchParams: URLSearchParams,
  categorySlug?: string,
  searchQueryParam: "keyword" | "q" = "keyword",
): ProductFilterValues => ({
  keyword: searchParams.get(searchQueryParam) ?? searchParams.get("keyword") ?? "",
  category: categorySlug ?? searchParams.get("category") ?? "",
  brand: searchParams.get("brand") ?? "",
  minPrice: searchParams.get("minPrice") ?? "",
  maxPrice: searchParams.get("maxPrice") ?? "",
  origin: searchParams.get("origin") ?? "",
  tags: searchParams.get("tags") ?? "",
  rating: searchParams.get("rating") ?? "",
  inStock: searchParams.get("inStock") === "true",
  storeId: searchParams.get("storeId") ?? "",
});

const toProductQuery = (
  filters: ProductFilterValues,
  sort: string,
  page: number,
): ProductQueryParams => ({
  keyword: filters.keyword || undefined,
  category: filters.category || undefined,
  brand: filters.brand || undefined,
  minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
  maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
  origin: filters.origin || undefined,
  tags: filters.tags || undefined,
  rating: filters.rating ? Number(filters.rating) : undefined,
  inStock: filters.inStock || undefined,
  storeId: filters.storeId || undefined,
  sort,
  page,
  limit: PAGE_LIMIT,
});

export function ProductListingPage({
  categorySlug,
  searchQueryParam = "keyword",
  title,
  description,
  showSearchSections = false,
}: ProductListingPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [category, setCategory] = useState<CategoryDto | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<ApiMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilterValues>(() =>
    readFiltersFromParams(searchParams, categorySlug, searchQueryParam),
  );

  const sort = searchParams.get("sort") ?? "newest";
  const page = Number(searchParams.get("page") ?? "1");
  const totalPages = meta?.totalPages ?? (meta?.total && meta.limit ? Math.ceil(meta.total / meta.limit) : 1);

  useEffect(() => {
    let mounted = true;

    const fetchStaticData = async () => {
      try {
        const [categoryTreeResponse, categoryResponse] = await Promise.all([
          categoryService.getCategoryTree().catch(() => ({ data: [] as CategoryDto[] })),
          categorySlug
            ? categoryService.getCategoryBySlug(categorySlug).catch(() => ({ data: null }))
            : Promise.resolve({ data: null }),
        ]);

        if (!mounted) return;
        setCategories(categoryTreeResponse.data ?? []);
        setCategory(categoryResponse.data);
      } catch {
        if (!mounted) return;
        setCategories([]);
        setCategory(null);
      }
    };

    void fetchStaticData();

    return () => {
      mounted = false;
    };
  }, [categorySlug]);

  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.getProducts(toProductQuery(filters, sort, page));
        if (!mounted) return;
        setProducts(response.data ?? []);
        setMeta(response.meta);
      } catch {
        if (!mounted) return;
        setProducts([]);
        setMeta(undefined);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchProducts();

    return () => {
      mounted = false;
    };
  }, [filters, page, sort]);

  const flatCategories = useMemo(() => {
    const result: CategoryDto[] = [];
    const walk = (items: CategoryDto[]) => {
      items.forEach((item) => {
        result.push(item);
        if (item.children?.length) walk(item.children);
      });
    };
    walk(categories);
    return result;
  }, [categories]);

  const relatedCategories = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    if (!showSearchSections || !keyword) return [];

    return flatCategories
      .filter((item) => {
        const haystack = [item.name, item.slug, item.description].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(keyword) || keyword.includes(item.name.toLowerCase());
      })
      .slice(0, 8);
  }, [filters.keyword, flatCategories, showSearchSections]);

  const updateUrl = (nextFilters: ProductFilterValues, nextSort = sort, nextPage = 1) => {
    const params = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (key === "category" && categorySlug) return;
      if (key === "keyword") {
        if (value) params.set(searchQueryParam, String(value));
        return;
      }
      if (typeof value === "boolean") {
        if (value) params.set(key, "true");
        return;
      }
      if (value) params.set(key, String(value));
    });
    params.set("sort", nextSort);
    params.set("page", String(nextPage));
    params.set("limit", String(PAGE_LIMIT));
    router.replace(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    const resetValues = {
      ...defaultProductFilters,
      category: categorySlug ?? "",
    };
    setFilters(resetValues);
    updateUrl(resetValues, "newest", 1);
  };

  const breadcrumbItems = category
    ? [
        { href: "/", label: "Trang chu" },
        { href: "/categories", label: "Danh muc" },
        { label: category.name },
      ]
    : [
        { href: "/", label: "Trang chu" },
        { label: "San pham" },
      ];

  return (
    <div className="grid gap-5">
      <Breadcrumb items={breadcrumbItems} />

      {category ? (
        <section className="relative overflow-hidden rounded-md border bg-card">
          {category.banner || category.image ? (
            <div className="relative h-44 md:h-56">
              <Image
                src={(category.banner || category.image) as string}
                alt={category.name}
                fill
                sizes="(min-width: 1024px) 80vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />
              <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-center p-5 text-white md:p-8">
                <h1 className="text-3xl font-bold tracking-normal md:text-5xl">{category.name}</h1>
                {category.description ? <p className="mt-3">{category.description}</p> : null}
              </div>
            </div>
          ) : (
            <div className="p-5 md:p-8">
              <h1 className="text-3xl font-bold tracking-normal">{category.name}</h1>
              {category.description ? (
                <p className="mt-2 max-w-2xl text-muted-foreground">{category.description}</p>
              ) : null}
            </div>
          )}
        </section>
      ) : (
        <div>
          <h1 className="text-3xl font-bold tracking-normal">{title || "Tat ca san pham"}</h1>
          <p className="mt-2 text-muted-foreground">
            {description || "Tim kiem va loc san pham theo nhu cau mua sam."}
          </p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <ProductFilters
            categories={flatCategories}
            values={filters}
            onChange={setFilters}
            onApply={() => updateUrl(filters, sort, 1)}
            onReset={resetFilters}
          />
        </div>

        <div className="grid min-w-0 gap-4">
          {showSearchSections && relatedCategories.length > 0 ? (
            <section className="rounded-md border bg-card p-4">
              <div className="mb-3">
                <h2 className="text-lg font-bold tracking-normal">Danh muc lien quan</h2>
                <p className="text-sm text-muted-foreground">Cac nganh hang phu hop voi tu khoa ban dang tim.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {relatedCategories.map((item) => (
                  <button
                    key={item.id || item._id || item.slug}
                    type="button"
                    className="grid grid-cols-[52px_1fr] items-center gap-3 rounded-md border bg-background p-2 text-left transition hover:border-primary hover:bg-muted"
                    onClick={() => router.push(`/categories/${encodeURIComponent(item.slug)}`)}
                  >
                    <span className="relative aspect-square overflow-hidden rounded-full bg-muted">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes="52px" className="object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-primary">
                          {item.name.slice(0, 1)}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 text-sm font-semibold">{item.name}</span>
                      {item.productCount ? (
                        <span className="text-xs text-muted-foreground">{item.productCount} san pham</span>
                      ) : null}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <div className="flex flex-col gap-3 rounded-md border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2 lg:hidden"
                onClick={() => setFilterOpen(true)}
              >
                <Filter className="h-4 w-4" />
                Bo loc
              </Button>
              <p className="text-sm text-muted-foreground">
                {meta?.total ? `${meta.total} san pham` : `${products.length} san pham`}
              </p>
            </div>
            <ProductSort value={sort} onChange={(value) => updateUrl(filters, value, 1)} />
          </div>

          {showSearchSections ? (
            <div>
              <h2 className="text-xl font-bold tracking-normal">San pham lien quan</h2>
              <p className="mt-1 text-sm text-muted-foreground">Ket qua phu hop voi tu khoa va bo loc hien tai.</p>
            </div>
          ) : null}

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <LoadingSkeleton key={index} className="h-80 w-full" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <EmptyState
              title="Khong tim thay san pham"
              description="Thu thay doi bo loc hoac tu khoa tim kiem de xem them san pham."
              actionLabel="Xoa bo loc"
              onAction={resetFilters}
            />
          )}

          {!loading && products.length > 0 ? (
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={page <= 1}
                onClick={() => updateUrl(filters, sort, page - 1)}
              >
                Truoc
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {page} / {Math.max(totalPages || 1, 1)}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={page >= Math.max(totalPages || 1, 1)}
                onClick={() => updateUrl(filters, sort, page + 1)}
              >
                Sau
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <MobileFilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)}>
        <ProductFilters
          categories={flatCategories}
          values={filters}
          onChange={setFilters}
          onApply={() => {
            updateUrl(filters, sort, 1);
            setFilterOpen(false);
          }}
          onReset={resetFilters}
          className="border-0 shadow-none"
        />
      </MobileFilterDrawer>
    </div>
  );
}
