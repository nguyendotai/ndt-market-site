"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { setCartStore } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { storeService, type StoreDto } from "@/services/store.service";
import { cn } from "@/lib/utils";

const getStoreId = (store: StoreDto) => String(store.id || store._id || "");

export function CartStoreSelector({ className }: { className?: string }) {
  const dispatch = useAppDispatch();
  const selectedStoreId = useAppSelector((state) => state.cart.storeId ?? "");
  const itemCount = useAppSelector((state) => state.cart.items.length);
  const syncing = useAppSelector((state) => state.cart.status === "syncing");
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchStores = async () => {
      setLoading(true);
      try {
        const response = await storeService.getStores({ limit: 50 });
        if (!mounted) return;
        setStores(response.data ?? []);
      } catch {
        if (!mounted) return;
        setStores([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchStores();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={cn("rounded-md border bg-card p-3", className)}>
      <div className="mb-2 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        <Label htmlFor="cart-store" className="font-semibold">
          Cua hang kiem tra ton kho
        </Label>
      </div>
      <select
        id="cart-store"
        value={selectedStoreId}
        disabled={loading || syncing}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        onChange={(event) => {
          if (!event.target.value) return;
          if (event.target.value === selectedStoreId) return;
          void dispatch(setCartStore(event.target.value));
        }}
      >
        <option value="">{loading ? "Dang tai cua hang..." : "Chon cua hang"}</option>
        {stores.map((store) => (
          <option key={getStoreId(store)} value={getStoreId(store)}>
            {store.name}
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs text-muted-foreground">
        Doi cua hang se xoa cac san pham hien tai de tranh sai ton kho
        {itemCount > 0 ? "." : ""}
      </p>
    </div>
  );
}
