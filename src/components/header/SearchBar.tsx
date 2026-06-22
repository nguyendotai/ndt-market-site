"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Search, TrendingUp, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { clearRecentSearches, getRecentSearches, saveRecentSearch } from "@/lib/recentSearches";
import { useDebounce } from "@/hooks/useDebounce";
import { categoryService, type CategoryDto } from "@/services/category.service";
import { productService } from "@/services/product.service";
import type { Product, ProductImage } from "@/types/product";

export type SearchBarProps = {
  className?: string;
  compact?: boolean;
};

const fallbackProductImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80";

const trendingKeywords = ["uc ga", "sua chua", "gao"];

const getProductId = (product: Product) => product.id || product._id || product.slug || product.name;

const getImageUrl = (image?: string | ProductImage) => {
  if (!image) return "";
  return typeof image === "string" ? image : image.imageUrl;
};

const getProductImage = (product: Product) => {
  const thumbnail = product.images?.find((image) => typeof image !== "string" && image.isThumbnail);
  return product.imageUrl || product.image || product.thumbnail || getImageUrl(thumbnail) || getImageUrl(product.images?.[0]);
};

const getProductVariants = (product: Product) => {
  const variants = product.variants?.length ? product.variants : product.productVariants;
  return variants ?? [];
};

const getVariantId = (variant?: ReturnType<typeof getProductVariants>[number]) =>
  variant?.id || variant?._id || variant?.barcode || variant?.sku || variant?.name;

const buildVariantPreviewItems = (products: Product[], seed = 0) => {
  const seenProductIds = new Set<string>();

  return products
    .filter((product) => {
      const productId = getProductId(product);
      if (seenProductIds.has(productId)) return false;
      seenProductIds.add(productId);
      return true;
    })
    .map((product, index) => {
      const variants = getProductVariants(product);
      const variant = variants.length ? variants[(index + seed) % variants.length] : undefined;
      const variantName = variant?.name || variant?.value || variant?.barcode || variant?.sku;
      const salePrice = typeof variant?.salePrice === "number" && variant.salePrice > 0
        ? variant.salePrice
        : undefined;
      const price = salePrice ?? variant?.price ?? product.price ?? 0;
      const image = variant?.imageUrl || variant?.image || variant?.images?.[0] || getProductImage(product) || fallbackProductImage;

      return {
        product,
        variant,
        id: `${getProductId(product)}-${getVariantId(variant) || "default"}`,
        name: variantName ? `${product.name} - ${variantName}` : product.name,
        price,
        image,
      };
    });
};

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

export function SearchBar({ className, compact = false }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = pathname === "/search" ? searchParams.get("q") ?? "" : "";
  const [keyword, setKeyword] = useState(currentQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => getRecentSearches());
  const [open, setOpen] = useState(false);
  const debouncedKeyword = useDebounce(keyword, 300);

  useEffect(() => {
    let mounted = true;

    const fetchSuggestions = async () => {
      const term = debouncedKeyword.trim();
      if (!term) {
        setProducts([]);
        return;
      }

      try {
        const response = await productService.getProducts({ keyword: term, limit: 5 });
        if (mounted) setProducts(response.data ?? []);
      } catch {
        if (mounted) setProducts([]);
      }
    };

    void fetchSuggestions();

    return () => {
      mounted = false;
    };
  }, [debouncedKeyword]);

  useEffect(() => {
    let mounted = true;

    const fetchDiscoveryData = async () => {
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          categoryService.getCategoryTree(),
          productService.getProducts({ sort: "best_selling", limit: 4 }).catch(() => ({ data: [] as Product[] })),
        ]);
        if (!mounted) return;
        setCategories(flattenCategories(categoryResponse.data ?? []));
        setFeaturedProducts(productResponse.data ?? []);
      } catch {
        if (!mounted) return;
        setCategories([]);
        setFeaturedProducts([]);
      }
    };

    void fetchDiscoveryData();

    return () => {
      mounted = false;
    };
  }, []);

  const featuredCategories = useMemo(() => categories.slice(0, 8), [categories]);

  const matchedCategories = useMemo(() => {
    const term = debouncedKeyword.trim().toLowerCase();
    if (!term) return [];
    return categories
      .filter((category) => category.name.toLowerCase().includes(term))
      .slice(0, 5);
  }, [categories, debouncedKeyword]);

  const suggestedKeywords = useMemo(() => {
    const term = debouncedKeyword.trim().toLowerCase();
    if (!term) return [];

    const values = [
      term,
      ...matchedCategories.map((category) => `${term} ${category.name}`),
      ...products.map((product) => product.name),
      ...recentSearches.filter((item) => item.toLowerCase().includes(term)),
    ];

    return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean))).slice(0, 9);
  }, [debouncedKeyword, matchedCategories, products, recentSearches]);

  const suggestedProductVariants = useMemo(() => {
    return buildVariantPreviewItems(products, debouncedKeyword.length);
  }, [debouncedKeyword.length, products]);

  const featuredProductVariants = useMemo(() => {
    return buildVariantPreviewItems(featuredProducts, 1).slice(0, 4);
  }, [featuredProducts]);

  const viewMoreHref = useMemo(() => {
    const term = debouncedKeyword.trim();
    return term ? `/search?q=${encodeURIComponent(term)}` : "/products";
  }, [debouncedKeyword]);

  const submitSearch = (value = keyword) => {
    const normalizedKeyword = value.trim().replace(/\s+/g, " ");
    if (!normalizedKeyword) return;
    setRecentSearches(saveRecentSearch(normalizedKeyword));
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(normalizedKeyword)}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitSearch();
  };

  const clearHistory = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const hasSuggestions = open;
  const isTyping = Boolean(keyword.trim());

  return (
    <form
      role="search"
      aria-label="Tim kiem san pham"
      className={cn("relative z-[60] flex w-full items-center gap-2", className)}
      onSubmit={handleSubmit}
    >
      {hasSuggestions ? (
        <button
          type="button"
          aria-label="Dong goi y tim kiem"
          className="fixed inset-0 -z-10 bg-foreground/45"
          onMouseDown={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        />
      ) : null}
      <Search className="pointer-events-none absolute left-3 z-10 h-4 w-4 text-primary" />
      <Input
        name="q"
        type="search"
        autoComplete="off"
        value={keyword}
        placeholder="Tim rau cu, thit ca, sua..."
        className={cn(
          "relative z-10 h-10 rounded-full border-blue-500 bg-card pl-9 pr-9 shadow-sm",
          compact && "h-9 text-sm",
        )}
        aria-expanded={hasSuggestions}
        aria-controls="search-suggestion-list"
        onChange={(event) => {
          setKeyword(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
      />
      {keyword ? (
        <button
          type="button"
          aria-label="Xoa tu khoa"
          className={cn(
            "absolute z-20 text-muted-foreground hover:text-foreground",
            compact ? "right-3" : "right-16 hidden sm:inline-flex",
          )}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setKeyword("");
            setProducts([]);
          }}
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
      {!compact ? (
        <Button type="submit" className="relative z-10 hidden sm:inline-flex">
          Tim
        </Button>
      ) : null}

      {hasSuggestions ? (
        <div
          id="search-suggestion-list"
          className={cn(
            "absolute left-0 top-[calc(100%+10px)] z-50 max-h-[76vh] w-[min(56rem,calc(100vw-2rem))] overflow-y-auto rounded-md border bg-popover shadow-2xl",
            compact && "w-[calc(100vw-2rem)]",
          )}
        >
          {!isTyping ? (
            <>
              <section className="border-b p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-foreground">Tim kiem gan day</h2>
                  {recentSearches.length > 0 ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-medium text-destructive"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={clearHistory}
                    >
                      <Trash2 className="h-3 w-3" />
                      Xoa lich su
                    </button>
                  ) : null}
                </div>
                {recentSearches.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.slice(0, 6).map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:border-primary hover:text-primary"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => submitSearch(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Chua co tu khoa nao.</p>
                )}
              </section>

              <section className="border-b p-4">
                <h2 className="mb-3 text-sm font-semibold text-foreground">Tim kiem thinh hanh</h2>
                <div className="grid gap-2 sm:grid-cols-3">
                  {trendingKeywords.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="flex items-center gap-3 rounded-md px-1 py-2 text-left text-sm hover:bg-muted"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => submitSearch(item)}
                    >
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              </section>

              {featuredCategories.length > 0 ? (
                <section className="border-b p-4">
                  <h2 className="mb-3 text-sm font-semibold text-foreground">Nganh hang noi bat</h2>
                  <div className="flex gap-5 overflow-x-auto pb-1">
                    {featuredCategories.map((category) => (
                      <button
                        key={category.id || category._id || category.slug}
                        type="button"
                        className="grid w-24 shrink-0 justify-items-center gap-2 text-center text-sm text-muted-foreground hover:text-primary"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setOpen(false);
                          router.push(`/categories/${encodeURIComponent(category.slug)}`);
                        }}
                      >
                        <span className="relative h-16 w-16 overflow-hidden rounded-full bg-muted">
                          <Image
                            src={category.image || fallbackProductImage}
                            alt={category.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </span>
                        <span className="line-clamp-2">{category.name}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {featuredProductVariants.length > 0 ? (
                <section className="p-4">
                  <h2 className="mb-3 text-sm font-semibold text-foreground">San pham noi bat</h2>
                  <div className="grid gap-4 sm:grid-cols-4">
                    {featuredProductVariants.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="grid gap-3 text-left"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setOpen(false);
                          const variantId = getVariantId(item.variant);
                          const query = variantId ? `?variant=${encodeURIComponent(variantId)}` : "";
                          router.push(`/products/${encodeURIComponent(item.product.slug || getProductId(item.product))}${query}`);
                        }}
                      >
                        <span className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="180px"
                            className="object-cover"
                          />
                        </span>
                        <span className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{item.name}</span>
                        <span className="text-sm font-semibold">{formatCurrency(item.price)}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : (
            <>
              {matchedCategories.length > 0 ? (
                <section className="border-b p-4">
                  <div className="flex gap-5 overflow-x-auto">
                    {matchedCategories.slice(0, 6).map((category) => (
                      <button
                        key={category.id || category._id || category.slug}
                        type="button"
                        className="grid w-20 shrink-0 justify-items-center gap-2 text-center text-sm text-muted-foreground hover:text-primary"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setOpen(false);
                          router.push(`/categories/${encodeURIComponent(category.slug)}`);
                        }}
                      >
                        <span className="relative h-16 w-16 overflow-hidden rounded-full bg-muted">
                          <Image
                            src={category.image || fallbackProductImage}
                            alt={category.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </span>
                        <span className="line-clamp-2">{category.name}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="p-4">
                <h2 className="mb-4 text-sm font-semibold text-muted-foreground">De xuat</h2>
                <div className="grid gap-1">
                  {suggestedKeywords.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="flex min-h-11 items-center gap-4 rounded-md px-1 text-left text-base hover:bg-muted"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => submitSearch(item)}
                    >
                      <Search className="h-5 w-5 text-foreground" />
                      <span>{item}</span>
                    </button>
                  ))}
                  {suggestedKeywords.length === 0 ? (
                    <button
                      type="button"
                      className="flex min-h-11 items-center gap-4 rounded-md px-1 text-left text-base hover:bg-muted"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => submitSearch()}
                    >
                      <Search className="h-5 w-5 text-foreground" />
                      <span>{keyword.trim()}</span>
                    </button>
                  ) : null}
                </div>
              </section>

              {suggestedProductVariants.length > 0 ? (
                <section className="border-t p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold text-muted-foreground">San pham phu hop</h2>
                    {suggestedProductVariants.length > 4 ? (
                      <button
                        type="button"
                        className="text-sm font-semibold text-primary hover:underline"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setOpen(false);
                          router.push(viewMoreHref);
                        }}
                      >
                        Xem them
                      </button>
                    ) : null}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {suggestedProductVariants.slice(0, 4).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="grid grid-cols-[56px_1fr] gap-3 rounded-md p-2 text-left hover:bg-muted"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setOpen(false);
                          const variantId =
                            item.variant?.id ||
                            item.variant?._id ||
                            item.variant?.barcode ||
                            item.variant?.sku ||
                            item.variant?.name;
                          const query = variantId ? `?variant=${encodeURIComponent(variantId)}` : "";
                          router.push(`/products/${encodeURIComponent(item.product.slug || getProductId(item.product))}${query}`);
                        }}
                      >
                        <span className="relative aspect-square overflow-hidden rounded-md bg-muted">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="line-clamp-1 text-sm font-medium">{item.name}</span>
                          <span className="text-xs font-semibold text-primary">{formatCurrency(item.price)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </form>
  );
}
