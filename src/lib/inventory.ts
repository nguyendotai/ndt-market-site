export type InventoryLike = {
  store?: string | number | { _id?: string | number; id?: string | number };
  stock?: number;
  availableStock?: number;
  quantityBase?: number;
  reservedQuantityBase?: number;
  availableQuantityBase?: number;
  inStock?: boolean;
  inventory?: InventoryLike;
  data?: InventoryLike;
};

const matchesStore = (inventory: InventoryLike, storeId?: string) => {
  if (!storeId) return true;
  const store = inventory.store;
  if (typeof store === "string" || typeof store === "number") return String(store) === storeId;
  return String(store?._id ?? "") === storeId || String(store?.id ?? "") === storeId;
};

const normalizeInventory = (
  inventory?: InventoryLike | InventoryLike[] | null,
  storeId?: string,
): InventoryLike | undefined => {
  if (!inventory) return undefined;
  if (Array.isArray(inventory)) {
    return inventory.find((item) => matchesStore(item, storeId)) ?? inventory[0];
  }
  if (inventory.inventory) return normalizeInventory(inventory.inventory, storeId);
  if (inventory.data) return normalizeInventory(inventory.data, storeId);
  return inventory;
};

export const getAvailableStock = (
  inventory?: InventoryLike | InventoryLike[] | null,
  storeId?: string,
): number | undefined => {
  const normalizedInventory = normalizeInventory(inventory, storeId);
  if (!normalizedInventory) return undefined;

  if (typeof normalizedInventory.availableStock === "number") return normalizedInventory.availableStock;
  if (typeof normalizedInventory.availableQuantityBase === "number") return normalizedInventory.availableQuantityBase;
  if (typeof normalizedInventory.stock === "number") return normalizedInventory.stock;
  if (typeof normalizedInventory.quantityBase === "number") {
    return normalizedInventory.quantityBase - (normalizedInventory.reservedQuantityBase ?? 0);
  }

  return undefined;
};

export const isInventoryAvailable = (
  inventory?: InventoryLike | InventoryLike[] | null,
  storeId?: string,
) => {
  const normalizedInventory = normalizeInventory(inventory, storeId);
  const availableStock = getAvailableStock(normalizedInventory);

  if (typeof normalizedInventory?.inStock === "boolean") {
    return normalizedInventory.inStock && (availableStock === undefined || availableStock > 0);
  }

  return availableStock === undefined || availableStock > 0;
};
