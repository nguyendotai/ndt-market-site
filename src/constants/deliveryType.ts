export const DELIVERY_TYPE = {
  HOME_DELIVERY: "home_delivery",
  STORE_PICKUP: "store_pickup",
  EXPRESS: "express",
} as const;

export type DeliveryType = (typeof DELIVERY_TYPE)[keyof typeof DELIVERY_TYPE];
