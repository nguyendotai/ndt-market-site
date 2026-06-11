"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { categoryService, type CategoryDto } from "@/services/category.service";

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

export function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await categoryService.getCategoryTree();
        if (!mounted) return;
        setCategories(response.data ?? []);
      } catch {
        if (!mounted) return;
        setCategories([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

  return (
    <section className="grid gap-6">
      <div>
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Trang chu
          </Link>{" "}
          / <span className="font-medium text-foreground">Danh muc</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-normal">Danh muc san pham</h1>
        <p className="mt-2 text-muted-foreground">Chon nhanh nhom hang can mua.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-32 w-full" />
          ))}
        </div>
      ) : flatCategories.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
          {flatCategories.map((category, index) => (
            <Link
              key={category.id || category._id || category.slug || `${category.name}-${index}`}
              href={`/categories/${category.slug || category.id || category._id}`}
              className="rounded-md border bg-card p-5 transition-colors hover:border-primary hover:bg-accent"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-bold text-primary">
                {category.name.slice(0, 1)}
              </div>
              <h2 className="mt-4 line-clamp-2 font-semibold">{category.name}</h2>
              {typeof category.productCount === "number" ? (
                <p className="mt-1 text-sm text-muted-foreground">{category.productCount} san pham</p>
              ) : null}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Chua co danh muc"
          description="Danh muc san pham se hien thi khi backend tra ve du lieu."
        />
      )}
    </section>
  );
}
