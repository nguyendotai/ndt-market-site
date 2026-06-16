"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";

export type CategorySidebarMenuItem = {
  href: string;
  label: string;
  image?: string;
  count?: number;
  children?: CategorySidebarMenuItem[];
};

export type CategorySidebarItemProps = {
  item: CategorySidebarMenuItem;
  activeHref?: string;
  open?: boolean;
  onToggle?: () => void;
};

export function CategorySidebarItem({
  item,
  activeHref,
  open = false,
  onToggle,
}: CategorySidebarItemProps) {
  const active = activeHref === item.href;
  const children = item.children ?? [];
  const hasChildren = children.length > 0;

  const content = (
    <>
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-primary">
        {item.image ? (
          <Image
            src={item.image}
            alt=""
            fill
            unoptimized
            sizes="36px"
            className="object-cover"
            aria-hidden="true"
          />
        ) : (
          <PackageSearch className="h-4 w-4" aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
      {typeof item.count === "number" ? (
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {item.count}
        </span>
      ) : null}
      {hasChildren ? (
        <ChevronRight
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-90",
          )}
          aria-hidden="true"
        />
      ) : null}
    </>
  );

  return (
    <li className="relative">
      {hasChildren ? (
        <button
          type="button"
          aria-current={active ? "page" : undefined}
          aria-expanded={open}
          className={cn(
            "flex min-h-11 w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active && "bg-accent font-semibold text-accent-foreground",
            open && "bg-accent text-accent-foreground",
          )}
          onClick={onToggle}
        >
          {content}
        </button>
      ) : (
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active && "bg-accent font-semibold text-accent-foreground",
          )}
        >
          {content}
        </Link>
      )}
    </li>
  );
}
