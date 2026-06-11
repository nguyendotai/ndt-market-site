"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartSummary } from "@/modules/cart/components/CartSummary";
import { removeFromCart } from "@/store/slices/cartSlice";
import { formatCurrency } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function CartPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <section className="container py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">Gio hang</h1>
          <p className="mt-2 text-muted-foreground">Redux Toolkit quan ly gio hang client-side.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/products">Tiep tuc mua sam</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-lg font-semibold">Gio hang dang trong</p>
            <p className="max-w-md text-muted-foreground">
              Them mot vai san pham tuoi ngon de kiem tra flow gio hang.
            </p>
            <Button asChild>
              <Link href="/products">Chon san pham</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <CardTitle>San pham da chon</CardTitle>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)} / {item.unit} x {item.quantity}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Xoa ${item.name}`}
                    onClick={() => dispatch(removeFromCart(item.productId))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
          <CartSummary total={total} />
        </div>
      )}
    </section>
  );
}
