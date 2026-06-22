"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateCartItem, removeCartItem, type CartItem } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const fallbackProductImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";

const getProductHref = (item: CartItem) => `/products/${encodeURIComponent(item.productId)}`;

export function CartLineItem({
  item,
  compact = false,
}: {
  item: CartItem;
  compact?: boolean;
}) {
  const dispatch = useAppDispatch();
  const syncing = useAppSelector((state) => state.cart.status === "syncing");
  const displayQuantity = item.displayQuantity ?? item.quantity;
  const basePerDisplay =
    item.quantityBase && displayQuantity > 0 ? item.quantityBase / displayQuantity : undefined;
  const maxReached =
    item.stock !== undefined &&
    (item.quantityBase !== undefined ? item.quantityBase >= item.stock : displayQuantity >= item.stock);
  const unavailable = item.inStock === false || item.stock === 0;

  const updateQuantity = (quantity: number) => {
    if (quantity < 1) return;
    const quantityBase = basePerDisplay ? Math.round(quantity * basePerDisplay) : undefined;
    void dispatch(
      updateCartItem({
        itemId: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity,
        quantityBase,
      }),
    );
  };

  const removeItem = () => {
    void dispatch(
      removeCartItem({
        itemId: item.id,
        productId: item.productId,
        variantId: item.variantId,
      }),
    );
  };

  return (
    <div className={cn("grid gap-3", compact ? "grid-cols-[64px_1fr]" : "grid-cols-[84px_1fr]")}>
      <Link
        href={getProductHref(item)}
        className={cn(
          "relative overflow-hidden rounded-md border bg-muted",
          compact ? "h-16 w-16" : "h-20 w-20",
        )}
      >
        <Image
          src={item.image || fallbackProductImage}
          alt={item.name}
          fill
          sizes={compact ? "64px" : "84px"}
          className="object-contain p-1"
        />
      </Link>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={getProductHref(item)}
              className={cn("line-clamp-2 font-medium hover:text-primary", compact ? "text-sm" : "text-base")}
            >
              {item.name}
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatCurrency(item.price)} / {item.unit}
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            disabled={syncing}
            aria-label={`Xoa ${item.name}`}
            onClick={removeItem}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex h-9 items-center overflow-hidden rounded-md border">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-none"
              disabled={syncing || displayQuantity <= 1}
              aria-label={`Giam so luong ${item.name}`}
              onClick={() => updateQuantity(displayQuantity - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="flex h-9 min-w-10 items-center justify-center border-x px-2 text-sm font-semibold">
              {displayQuantity}
            </span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-none"
              disabled={syncing || maxReached || unavailable}
              aria-label={`Tang so luong ${item.name}`}
              onClick={() => updateQuantity(displayQuantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="shrink-0 font-semibold">{formatCurrency(item.price * displayQuantity)}</p>
        </div>

        <div className="mt-2 min-h-5 text-xs">
          {unavailable ? (
            <span className="font-medium text-destructive">San pham dang het hang</span>
          ) : item.stock !== undefined ? (
            <span className="text-muted-foreground">Con {item.stock} san pham</span>
          ) : (
            <span className="text-muted-foreground">Se kiem tra ton kho khi dong bo gio hang</span>
          )}
        </div>
      </div>
    </div>
  );
}
