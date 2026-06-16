"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clearCart } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatCurrency } from "@/lib/format";

export function CartSummary() {
  const dispatch = useAppDispatch();
  const subtotal = useAppSelector((state) => state.cart.subtotal);
  const total = useAppSelector((state) => state.cart.total);
  const items = useAppSelector((state) => state.cart.items);
  const syncing = useAppSelector((state) => state.cart.status === "syncing");
  const hasUnavailableItem = items.some((item) => item.inStock === false || item.stock === 0);

  return (
    <Card className="h-fit shadow-none">
      <CardHeader className="p-4">
        <CardTitle className="text-lg">Tam tinh</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Tam tinh</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between gap-3 border-t pt-3 text-base font-bold">
            <span>Tong cong</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {hasUnavailableItem ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            Gio hang co san pham het hang. Vui long xoa hoac dieu chinh truoc khi thanh toan.
          </p>
        ) : null}

        {items.length === 0 || hasUnavailableItem || syncing ? (
          <Button type="button" className="w-full" disabled>
            Thanh toan
          </Button>
        ) : (
          <Button asChild className="w-full">
            <Link href="/checkout">Thanh toan</Link>
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          disabled={items.length === 0 || syncing}
          onClick={() => void dispatch(clearCart())}
        >
          <Trash2 className="h-4 w-4" />
          Xoa gio hang
        </Button>
      </CardContent>
    </Card>
  );
}
