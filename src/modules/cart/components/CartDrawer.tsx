"use client";

import Link from "next/link";
import { X, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartLineItem } from "@/modules/cart/components/CartLineItem";
import { CartSummary } from "@/modules/cart/components/CartSummary";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const items = useAppSelector((state) => state.cart.items);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] transition",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-foreground/30 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        )}
        aria-label="Dong gio hang"
        onClick={onClose}
      />
      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l bg-background shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Gio hang"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <div>
            <h2 className="font-semibold">Gio hang</h2>
            <p className="text-sm text-muted-foreground">{totalItems} san pham</p>
          </div>
          <Button type="button" size="icon" variant="ghost" aria-label="Dong gio hang" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-primary">
              <ShoppingBasket className="h-7 w-7" />
            </span>
            <div>
              <p className="font-semibold">Gio hang dang trong</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Chon san pham de xem nhanh tai day.
              </p>
            </div>
            <Button asChild onClick={onClose}>
              <Link href="/products">Mua sam ngay</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 divide-y overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId || "default"}`} className="p-4">
                  <CartLineItem item={item} compact />
                </div>
              ))}
            </div>
            <div className="shrink-0 border-t p-4">
              <CartSummary />
              <Button asChild variant="outline" className="mt-3 w-full" onClick={onClose}>
                <Link href="/cart">Xem gio hang day du</Link>
              </Button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
