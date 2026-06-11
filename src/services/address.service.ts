import { http } from "@/services/http";
import type { Id } from "@/services/types";

export type AddressDto = {
  id: Id;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  addressLine: string;
  isDefault?: boolean;
};

export type AddressPayload = Omit<AddressDto, "id">;

export const addressService = {
  getAddresses: () => http.get<AddressDto[]>("/addresses"),
  getAddressById: (id: Id) => http.get<AddressDto>(`/addresses/${id}`),
  createAddress: (payload: AddressPayload) => http.post<AddressDto>("/addresses", payload),
  updateAddress: (id: Id, payload: Partial<AddressPayload>) =>
    http.patch<AddressDto>(`/addresses/${id}`, payload),
  deleteAddress: (id: Id) => http.delete<null>(`/addresses/${id}`),
  setDefaultAddress: (id: Id) => http.patch<AddressDto>(`/addresses/${id}/default`),
};
