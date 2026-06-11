import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, "quantity">>) => {
      const item = state.items.find(
        (cartItem) =>
          cartItem.productId === action.payload.productId &&
          cartItem.variantId === action.payload.variantId,
      );

      if (item) {
        item.quantity += 1;
        return;
      }

      state.items.push({ ...action.payload, quantity: 1 });
    },
    removeFromCart: (
      state,
      action: PayloadAction<{ productId: string; variantId?: string }>,
    ) => {
      state.items = state.items.filter(
        (item) =>
          item.productId !== action.payload.productId ||
          item.variantId !== action.payload.variantId,
      );
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, clearCart, removeFromCart } = cartSlice.actions;
export default cartSlice.reducer;
