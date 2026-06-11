"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { addToCart } from "@/store/slices/cartSlice";
import { useAppDispatch } from "@/store/hooks";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <CardContent className="space-y-4 p-4">
        <div>
          <p className="text-xs font-medium text-primary">{product.category}</p>
          <h3 className="mt-1 min-h-11 text-base font-semibold">{product.name}</h3>
        </div>
        <div className="flex items-center justify-between gap-3">
          <PriceDisplay price={product.price} unit={product.unit} />
          <Button
            size="icon"
            aria-label={`Them ${product.name} vao gio`}
            onClick={() => {
              dispatch(
                addToCart({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  unit: product.unit,
                }),
              );
              toast.success("Da them vao gio hang");
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
