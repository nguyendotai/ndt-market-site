import { http } from "@/services/http";
import type { Id, ListQueryParams } from "@/services/types";

export type StoreDto = {
  id: Id;
  _id?: Id;
  name: string;
  address: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
};

export type NearbyStoreParams = ListQueryParams & {
  latitude: number;
  longitude: number;
  radius?: number;
};

export const storeService = {
  getStores: (params?: ListQueryParams) => http.get<StoreDto[]>("/stores", { params }),
  getNearbyStores: (params: NearbyStoreParams) => http.get<StoreDto[]>("/stores/nearby", { params }),
  getStoreById: (id: Id) => http.get<StoreDto>(`/stores/${id}`),
  checkStoreDelivery: (id: Id, addressId: Id) =>
    http.get<{ available: boolean }>(`/stores/${id}/delivery`, { params: { addressId } }),
};
