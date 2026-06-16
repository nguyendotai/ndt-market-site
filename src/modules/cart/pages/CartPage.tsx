"use client";

import Link from "next/link";
import { AlertCircle, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartLineItem } from "@/modules/cart/components/CartLineItem";
import { CartSummary } from "@/modules/cart/components/CartSummary";
import { useAppSelector } from "@/store/hooks";

export function CartPage() {
  const items = useAppSelector((state) => state.cart.items);
  const status = useAppSelector((state) => state.cart.status);
  const error = useAppSelector((state) => state.cart.error);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="container py-8 md:py-10">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">Gio hang</h1>
          <p className="mt-2 text-muted-foreground">
            {totalItems > 0 ? `${totalItems} san pham trong gio` : "Gio hang dang san sang cho don hang moi."}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/products">Tiep tuc mua sam</Link>
        </Button>
      </div>

      {error ? (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {items.length === 0 ? (
        <Card className="shadow-none">
          <CardContent className="flex min-h-80 flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-primary">
              <ShoppingBasket className="h-8 w-8" />
            </span>
            <div>
              <p className="text-lg font-semibold">Gio hang dang trong</p>
              <p className="mt-2 max-w-md text-muted-foreground">
                Them san pham vao gio de xem tam tinh va chuyen sang thanh toan.
              </p>
            </div>
            <Button asChild>
              <Link href="/products">Chon san pham</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="shadow-none">
            <CardHeader className="border-b p-4">
              <CardTitle className="text-lg">San pham trong gio</CardTitle>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId || "default"}`} className="p-4">
                  <CartLineItem item={item} />
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="lg:sticky lg:top-20 lg:self-start">
            <CartSummary />
            {status === "syncing" ? (
              <p className="mt-3 text-center text-sm text-muted-foreground">Dang dong bo gio hang...</p>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
