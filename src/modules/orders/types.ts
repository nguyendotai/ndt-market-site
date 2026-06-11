import type { OrderStatus } from "@/constants/orderStatus";
import type { PaymentStatus } from "@/constants/paymentStatus";

export type Order = {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
};
