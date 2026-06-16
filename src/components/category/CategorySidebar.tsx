"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PackageSearch } from "lucide-react";
import {
  CategorySidebarItem,
  type CategorySidebarMenuItem,
} from "@/components/category/CategorySidebarItem";
import { Logo } from "@/components/common/Logo";
import { env } from "@/configs/env";
import { cn } from "@/lib/utils";
import { categoryService, type CategoryDto } from "@/services/category.service";

export type CategorySidebarProps = {
  activeHref?: string;
  showLogo?: boolean;
};

const resolveAssetUrl = (value?: string) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return new URL(value, env.apiUrl.replace(/\/api\/?.*$/, "")).toString();
  return value;
};

const getCategoryHref = (category: CategoryDto) =>
  `/categories/${encodeURIComponent(category.slug || String(category.id || category._id || ""))}`;

const mapCategoryToMenuItem = (category: CategoryDto): CategorySidebarMenuItem => ({
  href: getCategoryHref(category),
  label: category.name,
  image: resolveAssetUrl(category.imageUrl || category.image || category.icon || category.thumbnail),
  count: category.productCount,
  children: category.children?.map(mapCategoryToMenuItem),
});

export function CategorySidebar({ activeHref, showLogo = false }: CategorySidebarProps) {
  const [openHref, setOpenHref] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategorySidebarMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navRef = useRef<HTMLElement>(null);
  const activeItem = useMemo(
    () => categories.find((item) => item.href === openHref),
    [categories, openHref],
  );

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await categoryService.getCategoryTree();
        if (!mounted) return;
        setCategories((response.data ?? []).map(mapCategoryToMenuItem));
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

  useEffect(() => {
    if (!openHref) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setOpenHref(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenHref(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openHref]);

  return (
    <nav
      ref={navRef}
      aria-label="Danh muc san pham"
      className="relative z-30 flex h-full w-full flex-col border-r bg-card"
    >
      <div className="shrink-0 border-b px-4 py-4">
        {showLogo ? (
          <Logo />
        ) : (
          <p className="text-sm font-semibold">Danh muc san pham</p>
        )}
      </div>
      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <li key={index} className="flex min-h-11 items-center gap-2 rounded-md px-2.5 py-2">
              <span className="h-9 w-9 rounded-full bg-muted" />
              <span className="h-4 flex-1 rounded bg-muted" />
            </li>
          ))
        ) : categories.length > 0 ? (
          categories.map((item) => (
            <CategorySidebarItem
              key={item.href}
              item={item}
              activeHref={activeHref}
              open={openHref === item.href}
              onToggle={() => setOpenHref((current) => (current === item.href ? null : item.href))}
            />
          ))
        ) : (
          <li className="px-3 py-4 text-sm text-muted-foreground">Chua co danh muc</li>
        )}
      </ul>
      {activeItem?.children?.length ? (
        <div
          role="menu"
          className={cn(
            "absolute z-[80] rounded-md border bg-popover p-2 text-popover-foreground shadow-lg",
            "left-[calc(100%+0.5rem)] top-[5.25rem] w-72",
          )}
        >
          <Link
            role="menuitem"
            href={activeItem.href}
            className="mb-1 flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold hover:bg-accent hover:text-accent-foreground"
            onClick={() => setOpenHref(null)}
          >
            Tat ca {activeItem.label}
            {typeof activeItem.count === "number" ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {activeItem.count}
              </span>
            ) : null}
          </Link>
          <ul className="grid gap-1">
            {activeItem.children.map((child) => (
              <li key={child.href}>
                <Link
                  role="menuitem"
                  href={child.href}
                  className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setOpenHref(null)}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-primary">
                      {child.image ? (
                        <Image
                          src={child.image}
                          alt=""
                          fill
                          unoptimized
                          sizes="28px"
                          className="object-cover"
                          aria-hidden="true"
                        />
                      ) : (
                        <PackageSearch className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </span>
                    <span className="truncate">{child.label}</span>
                  </span>
                  {typeof child.count === "number" ? (
                    <span className="shrink-0 text-xs">{child.count}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
