"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, PackageCheck, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DELIVERY_TYPE, type DeliveryType } from "@/constants/deliveryType";
import { storeService, type StoreDto } from "@/services/store.service";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";

const getStoreId = (store: StoreDto) => String(store.id || store._id || "");

export type AddToCartModalSelection = {
  storeId: string;
  deliveryType: DeliveryType;
};

export type AddToCartModalProps = {
  open: boolean;
  productName: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (selection: AddToCartModalSelection) => void;
};

export function AddToCartModal({
  open,
  productName,
  loading = false,
  onClose,
  onConfirm,
}: AddToCartModalProps) {
  const currentStoreId = useAppSelector((state) => state.cart.storeId ?? "");
  const currentDeliveryType = useAppSelector(
    (state) => state.cart.deliveryType ?? DELIVERY_TYPE.HOME_DELIVERY,
  );
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storeId, setStoreId] = useState(currentStoreId);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(currentDeliveryType);

  useEffect(() => {
    if (open) {
      setStoreId(currentStoreId);
      setDeliveryType(currentDeliveryType);
    }
  }, [currentDeliveryType, currentStoreId, open]);

  useEffect(() => {
    if (!open || stores.length > 0) return;

    let mounted = true;

    const fetchStores = async () => {
      setStoresLoading(true);
      try {
        const response = await storeService.getStores({ limit: 50 });
        if (!mounted) return;
        setStores(response.data ?? []);
      } catch {
        if (!mounted) return;
        setStores([]);
      } finally {
        if (mounted) setStoresLoading(false);
      }
    };

    void fetchStores();

    return () => {
      mounted = false;
    };
  }, [open, stores.length]);

  const selectedStore = useMemo(
    () => stores.find((store) => getStoreId(store) === storeId),
    [storeId, stores],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-foreground/40 px-3 py-4 sm:items-center">
      <div className="w-full max-w-lg overflow-hidden rounded-md border bg-background shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div>
            <h2 className="text-lg font-bold tracking-normal">Chon cach nhan hang</h2>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{productName}</p>
          </div>
          <Button type="button" size="icon" variant="ghost" aria-label="Dong" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid gap-4 p-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={cn(
                "flex min-h-16 items-center gap-3 rounded-md border p-3 text-left transition-colors",
                deliveryType === DELIVERY_TYPE.HOME_DELIVERY
                  ? "border-primary bg-accent text-accent-foreground"
                  : "bg-card hover:bg-accent",
              )}
              onClick={() => setDeliveryType(DELIVERY_TYPE.HOME_DELIVERY)}
            >
              <Truck className="h-5 w-5 shrink-0 text-primary" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">Giao tan noi</span>
                <span className="block text-xs text-muted-foreground">Cua hang giao den dia chi</span>
              </span>
            </button>
            <button
              type="button"
              className={cn(
                "flex min-h-16 items-center gap-3 rounded-md border p-3 text-left transition-colors",
                deliveryType === DELIVERY_TYPE.STORE_PICKUP
                  ? "border-primary bg-accent text-accent-foreground"
                  : "bg-card hover:bg-accent",
              )}
              onClick={() => setDeliveryType(DELIVERY_TYPE.STORE_PICKUP)}
            >
              <PackageCheck className="h-5 w-5 shrink-0 text-primary" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">Tu den nhan</span>
                <span className="block text-xs text-muted-foreground">Giu hang tai cua hang</span>
              </span>
            </button>
          </div>

          <div className="grid gap-2">
            <label htmlFor="add-cart-store" className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-primary" />
              Chon cua hang
            </label>
            <select
              id="add-cart-store"
              value={storeId}
              disabled={storesLoading || loading}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              onChange={(event) => setStoreId(event.target.value)}
            >
              <option value="">{storesLoading ? "Dang tai cua hang..." : "Chon cua hang gan ban"}</option>
              {stores.map((store) => (
                <option key={getStoreId(store)} value={getStoreId(store)}>
                  {store.name}
                </option>
              ))}
            </select>
            {selectedStore ? (
              <p className="text-xs text-muted-foreground">{selectedStore.address}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Cua hang duoc dung de kiem tra ton kho va chuan bi don.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" disabled={loading} onClick={onClose}>
            Huy
          </Button>
          <Button
            type="button"
            disabled={!storeId || storesLoading || loading}
            onClick={() => onConfirm({ storeId, deliveryType })}
          >
            {loading ? "Dang them..." : "Them vao gio"}
          </Button>
        </div>
      </div>
    </div>
  );
}
