"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";

export type CartButtonProps = {
  compact?: boolean;
  className?: string;
};

export function CartButton({ compact = false, className }: CartButtonProps) {
  const totalItems = useAppSelector((state) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0),
  );

  return (
    <Button asChild size={compact ? "icon" : "sm"} variant="outline" className={cn("relative", className)}>
      <Link href="/cart" className="gap-2" aria-label={`Gio hang co ${totalItems} san pham`}>
        <ShoppingCart className="h-4 w-4" />
        {!compact ? <span className="hidden sm:inline">Gio hang</span> : null}
        {totalItems > 0 ? (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
            {totalItems}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
