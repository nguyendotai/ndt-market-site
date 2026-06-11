"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { categoryMenu } from "@/configs/menu";
import { CategorySidebarItem } from "@/components/category/CategorySidebarItem";
import { cn } from "@/lib/utils";

export type CategorySidebarProps = {
  activeHref?: string;
};

export function CategorySidebar({ activeHref }: CategorySidebarProps) {
  const [openHref, setOpenHref] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const activeItem = useMemo(
    () => categoryMenu.find((item) => item.href === openHref),
    [openHref],
  );

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
      <div className="shrink-0 border-b px-5 py-4">
        <p className="text-sm font-semibold">Danh muc san pham</p>
        <p className="mt-1 text-xs text-muted-foreground">Chon nhanh theo nhu cau mua sam</p>
      </div>
      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {categoryMenu.map((item) => (
          <CategorySidebarItem
            key={item.href}
            item={item}
            activeHref={activeHref}
            open={openHref === item.href}
            onToggle={() => setOpenHref((current) => (current === item.href ? null : item.href))}
          />
        ))}
      </ul>
      {activeItem?.children?.length ? (
        <div
          role="menu"
          className={cn(
            "absolute z-[80] rounded-md border bg-popover p-2 text-popover-foreground shadow-lg",
            "left-[calc(100%+0.75rem)] top-[5.25rem] w-72",
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
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setOpenHref(null)}
                >
                  <span>{child.label}</span>
                  {typeof child.count === "number" ? (
                    <span className="text-xs">{child.count}</span>
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
