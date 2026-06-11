"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategoryDto } from "@/services/category.service";
import { cn } from "@/lib/utils";

export type ProductFilterValues = {
  keyword: string;
  category: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  origin: string;
  tags: string;
  rating: string;
  inStock: boolean;
  storeId: string;
};

export const defaultProductFilters: ProductFilterValues = {
  keyword: "",
  category: "",
  brand: "",
  minPrice: "",
  maxPrice: "",
  origin: "",
  tags: "",
  rating: "",
  inStock: false,
  storeId: "",
};

type ProductFiltersProps = {
  categories: CategoryDto[];
  values: ProductFilterValues;
  onChange: (values: ProductFilterValues) => void;
  onApply: () => void;
  onReset: () => void;
  className?: string;
};

export function ProductFilters({
  categories,
  values,
  onChange,
  onApply,
  onReset,
  className,
}: ProductFiltersProps) {
  const updateValue = <K extends keyof ProductFilterValues>(
    key: K,
    value: ProductFilterValues[K],
  ) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <aside className={cn("rounded-md border bg-card", className)}>
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Bo loc san pham</h2>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          Xoa
        </Button>
      </div>
      <div className="grid gap-4 p-4">
        <div className="space-y-2">
          <Label htmlFor="filter-keyword">Tu khoa</Label>
          <Input
            id="filter-keyword"
            value={values.keyword}
            placeholder="Tim trong san pham"
            onChange={(event) => updateValue("keyword", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-category">Danh muc</Label>
          <select
            id="filter-category"
            value={values.category}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            onChange={(event) => updateValue("category", event.target.value)}
          >
            <option value="">Tat ca danh muc</option>
            {categories.map((category, index) => (
              <option
                key={category.id || category._id || category.slug || `${category.name}-${index}`}
                value={category.slug || String(category.id || category._id || "")}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-brand">Thuong hieu</Label>
          <Input
            id="filter-brand"
            value={values.brand}
            placeholder="Vi du: Vinamilk"
            onChange={(event) => updateValue("brand", event.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="filter-min-price">Gia tu</Label>
            <Input
              id="filter-min-price"
              inputMode="numeric"
              value={values.minPrice}
              onChange={(event) => updateValue("minPrice", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-max-price">Den</Label>
            <Input
              id="filter-max-price"
              inputMode="numeric"
              value={values.maxPrice}
              onChange={(event) => updateValue("maxPrice", event.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-origin">Xuat xu</Label>
          <Input
            id="filter-origin"
            value={values.origin}
            placeholder="Viet Nam, Uc..."
            onChange={(event) => updateValue("origin", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-tags">Tags</Label>
          <Input
            id="filter-tags"
            value={values.tags}
            placeholder="organic, fresh"
            onChange={(event) => updateValue("tags", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-rating">Danh gia tu</Label>
          <select
            id="filter-rating"
            value={values.rating}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            onChange={(event) => updateValue("rating", event.target.value)}
          >
            <option value="">Tat ca</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao tro len</option>
            <option value="3">3 sao tro len</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-store">Store ID</Label>
          <Input
            id="filter-store"
            value={values.storeId}
            placeholder="Nhap storeId neu can"
            onChange={(event) => updateValue("storeId", event.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.inStock}
            onChange={(event) => updateValue("inStock", event.target.checked)}
          />
          Chi hien san pham con hang
        </label>
        <Button type="button" onClick={onApply}>
          Ap dung bo loc
        </Button>
      </div>
    </aside>
  );
}

export function MobileFilterDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-foreground/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bo loc san pham"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 max-h-[86dvh] overflow-y-auto rounded-t-md bg-background p-4 shadow-2xl transition-transform lg:hidden",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Bo loc</h2>
          <Button type="button" size="icon" variant="ghost" aria-label="Dong bo loc" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </>
  );
}
