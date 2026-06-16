"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";

export type CartButtonProps = {
  compact?: boolean;
  className?: string;
};

export function CartButton({ compact = false, className }: CartButtonProps) {
  const [open, setOpen] = useState(false);
  const totalItems = useAppSelector((state) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0),
  );

  return (
    <>
      <Button
        type="button"
        size={compact ? "icon" : "sm"}
        variant="outline"
        className={cn("relative gap-2", className)}
        aria-label={`Gio hang co ${totalItems} san pham`}
        onClick={() => setOpen(true)}
      >
        <ShoppingCart className="h-4 w-4" />
        {!compact ? <span className="hidden sm:inline">Gio hang</span> : null}
        {totalItems > 0 ? (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
            {totalItems}
          </span>
        ) : null}
      </Button>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
