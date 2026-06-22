import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DeliveryType } from "@/constants/deliveryType";
import { cartService, type CartDto, type CartItemDto } from "@/services/cart.service";
import type { RootState } from "@/store";

const LOCAL_CART_KEY = "freshmart_cart";

export type CartItem = {
  id?: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  quantityBase?: number;
  displayQuantity?: number;
  displayUnit?: string;
  inventoryUnit?: string;
  priceUnit?: string;
  saleType?: string;
  image?: string;
  stock?: number;
  inStock?: boolean;
};

type CartStatus = "idle" | "loading" | "syncing" | "ready" | "error";

type CartState = {
  id?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  totalItems: number;
  storeId?: string;
  deliveryType?: DeliveryType;
  status: CartStatus;
  isInitialized: boolean;
  error: string | null;
};

type CartSnapshot = Pick<CartState, "id" | "items" | "subtotal" | "total" | "totalItems" | "storeId" | "deliveryType">;

type AddCartItemPayload = Omit<CartItem, "id" | "quantity"> & {
  quantity?: number;
  quantityBase?: number;
  storeId?: string;
};

type UpdateCartItemPayload = {
  itemId?: string;
  productId: string;
  variantId?: string;
  quantity: number;
  quantityBase?: number;
};

type RemoveCartItemPayload = {
  itemId?: string;
  productId: string;
  variantId?: string;
};

const initialState: CartState = {
  items: [],
  subtotal: 0,
  total: 0,
  totalItems: 0,
  status: "idle",
  isInitialized: false,
  error: null,
};

const canUseStorage = () => typeof window !== "undefined";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const getNestedRecord = (value: unknown, key: string) => asRecord(asRecord(value)[key]);

const getNumber = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return undefined;
};

const getString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return undefined;
};

const getBoolean = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "boolean") return value;
  }
  return undefined;
};

const getPositiveNumber = (...values: unknown[]) => {
  const value = getNumber(...values);
  return value && value > 0 ? value : undefined;
};

const clampPositiveQuantity = (quantity: number) => Math.max(0.001, quantity);

const getImageFromImages = (value: unknown) => {
  if (!Array.isArray(value)) return undefined;
  const thumbnail = value.find((image) => asRecord(image).isThumbnail);
  const firstImage = thumbnail ?? value[0];

  if (typeof firstImage === "string") return firstImage;
  const image = asRecord(firstImage);
  return getString(image.imageUrl, image.url, image.src);
};

const getLineKey = (item: Pick<CartItem, "productId" | "variantId">) =>
  `${item.productId}::${item.variantId ?? "default"}`;

const isPositiveFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const buildCartQuantityPayload = (payload: { quantity?: number; quantityBase?: number }) => {
  if (isPositiveFiniteNumber(payload.quantityBase)) {
    return { quantityBase: payload.quantityBase };
  }

  if (isPositiveFiniteNumber(payload.quantity)) {
    return { quantity: payload.quantity };
  }

  return { quantity: 1 };
};

const calculateTotals = (items: CartItem[], fallbackSubtotal?: number, fallbackTotal?: number) => {
  const subtotal =
    fallbackSubtotal ??
    items.reduce((sum, item) => sum + item.price * (item.displayQuantity ?? item.quantity), 0);
  return {
    subtotal,
    total: fallbackTotal ?? subtotal,
    totalItems: items.reduce((sum, item) => sum + (item.quantityBase ?? item.quantity), 0),
  };
};

const readLocalCart = (): CartSnapshot => {
  if (!canUseStorage()) return { items: [], subtotal: 0, total: 0, totalItems: 0 };

  try {
    const rawCart = window.localStorage.getItem(LOCAL_CART_KEY);
    if (!rawCart) return { items: [], subtotal: 0, total: 0, totalItems: 0 };
    const parsed = JSON.parse(rawCart) as Partial<CartSnapshot>;
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    const totals = calculateTotals(items);

    return {
      id: parsed.id,
      items,
      subtotal: totals.subtotal,
      total: totals.total,
      totalItems: totals.totalItems,
      storeId: parsed.storeId,
      deliveryType: parsed.deliveryType,
    };
  } catch {
    window.localStorage.removeItem(LOCAL_CART_KEY);
    return { items: [], subtotal: 0, total: 0, totalItems: 0 };
  }
};

const writeLocalCart = (cart: CartSnapshot) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(
    LOCAL_CART_KEY,
    JSON.stringify({
      items: cart.items,
      subtotal: cart.subtotal,
      total: cart.total,
      totalItems: cart.totalItems,
      storeId: cart.storeId,
      deliveryType: cart.deliveryType,
    }),
  );
};

const clearLocalCart = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(LOCAL_CART_KEY);
};

const normalizeCartItem = (item: CartItemDto): CartItem | null => {
  const raw = asRecord(item);
  const product = getNestedRecord(item, "product");
  const variant = getNestedRecord(item, "variant");
  const productFromVariant = getNestedRecord(variant, "product");
  const productId = getString(
    raw.productId,
    raw.product,
    product.id,
    product._id,
    product.slug,
    variant.product,
    productFromVariant.id,
    productFromVariant._id,
    productFromVariant.slug,
  );

  if (!productId) return null;

  const variantId = getString(raw.variantId, raw.variant, variant.id, variant._id, variant.sku);
  const stock = getNumber(
    raw.availableQuantityBase,
    raw.quantityBaseAvailable,
    raw.stock,
    raw.availableStock,
    variant.stock,
    product.stock,
  );
  const explicitInStock = getBoolean(raw.inStock, variant.inStock, product.inStock);
  const statusInStock =
    raw.status !== "OUT_OF_STOCK" &&
    variant.status !== "OUT_OF_STOCK" &&
    product.status !== "OUT_OF_STOCK";
  const inStock = explicitInStock ?? statusInStock;
  const salePrice = getPositiveNumber(raw.salePrice, variant.salePrice);
  const price = salePrice ?? getNumber(raw.priceSnapshot, raw.price, variant.price, product.price) ?? 0;
  const displayQuantity = Math.max(0, getNumber(raw.displayQuantity, raw.quantity, raw.qty) ?? 1);
  const quantityBase = getNumber(raw.quantityBase);
  const displayUnit = getString(raw.displayUnit, variant.sellUnit, raw.unit, variant.unit, product.unit);
  const inventoryUnit = getString(raw.inventoryUnit, variant.inventoryUnit);
  const priceUnit = getString(raw.priceUnit, variant.sellUnit, raw.unit, variant.unit, product.unit);

  return {
    id: getString(raw.id, raw._id),
    productId,
    variantId,
    name:
      getString(raw.name, raw.productName, product.name, variant.name) ??
      "San pham",
    price,
    unit: displayUnit ?? priceUnit ?? "san pham",
    quantity: displayQuantity,
    quantityBase,
    displayQuantity,
    displayUnit,
    inventoryUnit,
    priceUnit,
    saleType: getString(raw.saleType, variant.saleType),
    image: getString(
      raw.image,
      raw.imageUrl,
      variant.imageUrl,
      variant.image,
      getImageFromImages(variant.images),
      product.imageUrl,
      product.image,
      product.thumbnail,
      getImageFromImages(product.images),
    ),
    stock,
    inStock: stock === undefined ? inStock : inStock && stock > 0,
  };
};

const normalizeCart = (cart?: CartDto | null): CartSnapshot => {
  const raw = asRecord(cart);
  const store = getNestedRecord(cart, "store");
  const items = (Array.isArray(raw.items) ? raw.items : [])
    .map((item) => normalizeCartItem(item as CartItemDto))
    .filter((item): item is CartItem => Boolean(item));
  const totals = calculateTotals(
    items,
    getNumber(raw.subtotal, raw.subTotal),
    getNumber(raw.total),
  );

  return {
    id: getString(raw.id, raw._id),
    items,
    subtotal: totals.subtotal,
    total: totals.total,
    totalItems: getNumber(raw.totalItems) ?? totals.totalItems,
    storeId: getString(raw.storeId, raw.store, store.id, store._id),
  };
};

const upsertLocalItem = (cart: CartSnapshot, payload: AddCartItemPayload): CartSnapshot => {
  const quantity = clampPositiveQuantity(payload.quantity ?? 1);
  const quantityBase = Math.max(1, payload.quantityBase ?? quantity);
  const items = [...cart.items];
  const index = items.findIndex((item) => getLineKey(item) === getLineKey(payload));

  if (index >= 0) {
    const current = items[index];
    const nextQuantityBase = current.stock === undefined
      ? (current.quantityBase ?? current.quantity) + quantityBase
      : Math.min(current.stock, (current.quantityBase ?? current.quantity) + quantityBase);
    const nextQuantity = current.stock === undefined
      ? current.quantity + quantity
      : Math.min(current.stock, current.quantity + quantity);
    items[index] = {
      ...current,
      ...payload,
      quantity: clampPositiveQuantity(nextQuantity),
      displayQuantity: clampPositiveQuantity(nextQuantity),
      quantityBase: Math.max(1, nextQuantityBase),
    };
  } else {
    items.push({
      productId: payload.productId,
      variantId: payload.variantId,
      name: payload.name,
      price: payload.price,
      unit: payload.unit,
      image: payload.image,
      stock: payload.stock,
      inStock: payload.inStock,
      quantityBase: payload.stock === undefined ? quantityBase : Math.min(payload.stock, quantityBase),
      displayQuantity: quantity,
      displayUnit: payload.displayUnit,
      inventoryUnit: payload.inventoryUnit,
      priceUnit: payload.priceUnit,
      saleType: payload.saleType,
      quantity: payload.stock === undefined ? quantity : clampPositiveQuantity(Math.min(payload.stock, quantity)),
    });
  }

  const totals = calculateTotals(items);
  return { ...cart, items, ...totals, storeId: payload.storeId ?? cart.storeId };
};

const updateLocalItem = (cart: CartSnapshot, payload: UpdateCartItemPayload): CartSnapshot => {
  const items = cart.items
    .map((item) => {
      if (payload.itemId ? item.id !== payload.itemId : getLineKey(item) !== getLineKey(payload)) {
        return item;
      }

      const quantity = item.stock === undefined
        ? payload.quantity
        : Math.min(item.stock, payload.quantity);
      const quantityBase = payload.quantityBase ?? quantity;
      return {
        ...item,
        quantity: clampPositiveQuantity(quantity),
        displayQuantity: clampPositiveQuantity(quantity),
        quantityBase: Math.max(1, quantityBase),
      };
    })
    .filter((item) => item.quantity > 0);
  const totals = calculateTotals(items);
  return { ...cart, items, ...totals };
};

const removeLocalItem = (cart: CartSnapshot, payload: RemoveCartItemPayload): CartSnapshot => {
  const items = cart.items.filter((item) =>
    payload.itemId ? item.id !== payload.itemId : getLineKey(item) !== getLineKey(payload),
  );
  const totals = calculateTotals(items);
  return { ...cart, items, ...totals };
};

const isAuthenticated = (state: RootState) => state.auth.status === "authenticated";
const getSelectedStoreId = (state: RootState, payloadStoreId?: string) =>
  payloadStoreId || state.cart.storeId;

function requireVariant(variantId?: string): asserts variantId is string {
  if (!variantId) {
    throw new Error("Vui long chon phan loai san pham truoc khi them vao gio");
  }
}

function requireStore(storeId?: string): asserts storeId is string {
  if (!storeId) {
    throw new Error("Vui long chon cua hang truoc khi them san pham vao gio");
  }
}

export const initializeCart = createAsyncThunk<CartSnapshot, void, { state: RootState; rejectValue: string }>(
  "cart/initialize",
  async (_, { getState, rejectWithValue }) => {
    const localCart = readLocalCart();

    if (!isAuthenticated(getState())) {
      return localCart;
    }

    try {
      if (localCart.items.length > 0 && localCart.storeId) {
        await cartService.setStore(localCart.storeId);
      }

      for (const item of localCart.storeId ? localCart.items : []) {
        requireVariant(item.variantId);
        const variantId = item.variantId;
        const quantityPayload = buildCartQuantityPayload(item);
        await cartService.addItem({
          variant: variantId,
          ...quantityPayload,
        });
      }

      const response = await cartService.getCart();
      clearLocalCart();
      return normalizeCart(response.data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Khong the dong bo gio hang"));
    }
  },
);

export const addCartItem = createAsyncThunk<CartSnapshot, AddCartItemPayload, { state: RootState; rejectValue: string }>(
  "cart/addItem",
  async (payload, { getState, rejectWithValue }) => {
    const state = getState();
    const storeId = getSelectedStoreId(state, payload.storeId);

    try {
      requireStore(storeId);
      requireVariant(payload.variantId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Khong the them san pham vao gio"));
    }

    if (!isAuthenticated(state)) {
      const nextCart = upsertLocalItem(readLocalCart(), payload);
      writeLocalCart(nextCart);
      return nextCart;
    }

    try {
      if (payload.storeId && payload.storeId !== state.cart.storeId) {
        await cartService.setStore(payload.storeId);
      }

      const variantId = payload.variantId;
      requireVariant(variantId);
      const quantityPayload = buildCartQuantityPayload(payload);
      const response = await cartService.addItem({
        variant: variantId,
        ...quantityPayload,
      });
      return normalizeCart(response.data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Khong the them san pham vao gio"));
    }
  },
);

export const updateCartItem = createAsyncThunk<CartSnapshot, UpdateCartItemPayload, { state: RootState; rejectValue: string }>(
  "cart/updateItem",
  async (payload, { getState, rejectWithValue }) => {
    if (!isAuthenticated(getState()) || !payload.itemId) {
      const nextCart = updateLocalItem(readLocalCart(), payload);
      writeLocalCart(nextCart);
      return nextCart;
    }

    try {
      const quantityPayload = buildCartQuantityPayload(payload);
      const response = await cartService.updateItem(payload.itemId, quantityPayload);
      return normalizeCart(response.data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Khong the cap nhat gio hang"));
    }
  },
);

export const removeCartItem = createAsyncThunk<CartSnapshot, RemoveCartItemPayload, { state: RootState; rejectValue: string }>(
  "cart/removeItem",
  async (payload, { getState, rejectWithValue }) => {
    if (!isAuthenticated(getState()) || !payload.itemId) {
      const nextCart = removeLocalItem(readLocalCart(), payload);
      writeLocalCart(nextCart);
      return nextCart;
    }

    try {
      const response = await cartService.removeItem(payload.itemId);
      return normalizeCart(response.data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Khong the xoa san pham"));
    }
  },
);

export const clearCart = createAsyncThunk<CartSnapshot, void, { state: RootState; rejectValue: string }>(
  "cart/clear",
  async (_, { getState, rejectWithValue }) => {
    if (!isAuthenticated(getState())) {
      clearLocalCart();
      return { items: [], subtotal: 0, total: 0, totalItems: 0 };
    }

    try {
      const response = await cartService.clearCart();
      return normalizeCart(response.data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Khong the xoa gio hang"));
    }
  },
);

export const setCartStore = createAsyncThunk<CartSnapshot, string, { state: RootState; rejectValue: string }>(
  "cart/setStore",
  async (storeId, { getState, rejectWithValue }) => {
    if (!isAuthenticated(getState())) {
      const localCart = readLocalCart();
      const storeChanged = localCart.storeId && localCart.storeId !== storeId;
      const nextCart = storeChanged
        ? { items: [], subtotal: 0, total: 0, totalItems: 0, storeId, deliveryType: localCart.deliveryType }
        : { ...localCart, storeId };
      writeLocalCart(nextCart);
      return nextCart;
    }

    try {
      const response = await cartService.setStore(storeId);
      return normalizeCart(response.data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Khong the cap nhat cua hang"));
    }
  },
);

const applyCartSnapshot = (state: CartState, cart: CartSnapshot) => {
  state.id = cart.id;
  state.items = cart.items;
  state.subtotal = cart.subtotal;
  state.total = cart.total;
  state.storeId = cart.storeId;
  state.deliveryType = cart.deliveryType;
  state.status = "ready";
  state.isInitialized = true;
  state.error = null;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, "quantity">>) => {
      const nextCart = upsertLocalItem(state, { ...action.payload, quantity: 1 });
      applyCartSnapshot(state, nextCart);
      writeLocalCart(nextCart);
    },
    removeFromCart: (state, action: PayloadAction<RemoveCartItemPayload>) => {
      const nextCart = removeLocalItem(state, action.payload);
      applyCartSnapshot(state, nextCart);
      writeLocalCart(nextCart);
    },
    setCartDeliveryType: (state, action: PayloadAction<DeliveryType>) => {
      state.deliveryType = action.payload;
      writeLocalCart(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(initializeCart.fulfilled, (state, action) => {
        applyCartSnapshot(state, action.payload);
      })
      .addCase(initializeCart.rejected, (state, action) => {
        state.status = "error";
        state.isInitialized = true;
        state.error = action.payload ?? "Khong the tai gio hang";
      })
      .addMatcher(
        (action) =>
          [
            addCartItem.pending.type,
            updateCartItem.pending.type,
            removeCartItem.pending.type,
            clearCart.pending.type,
            setCartStore.pending.type,
          ].includes(action.type),
        (state) => {
          state.status = "syncing";
          state.error = null;
        },
      )
      .addMatcher(
        (action): action is PayloadAction<CartSnapshot> =>
          [
            addCartItem.fulfilled.type,
            updateCartItem.fulfilled.type,
            removeCartItem.fulfilled.type,
            clearCart.fulfilled.type,
            setCartStore.fulfilled.type,
          ].includes(action.type),
        (state, action) => {
          applyCartSnapshot(state, action.payload);
        },
      )
      .addMatcher(
        (action) =>
          [
            addCartItem.rejected.type,
            updateCartItem.rejected.type,
            removeCartItem.rejected.type,
            clearCart.rejected.type,
            setCartStore.rejected.type,
          ].includes(action.type),
        (state, action: PayloadAction<string | undefined>) => {
          state.status = "error";
          state.error = action.payload ?? "Thao tac gio hang that bai";
        },
      );
  },
});

export const { addToCart, removeFromCart, setCartDeliveryType } = cartSlice.actions;
export default cartSlice.reducer;
