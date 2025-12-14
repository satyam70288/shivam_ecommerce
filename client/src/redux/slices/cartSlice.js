import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
  totalQuantity: 0,
  totalPrice: 0,
};

const recalcTotals = (state) => {
  state.totalQuantity = state.cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  state.totalPrice = state.cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /* =====================
       SET CART (FROM API)
    ===================== */
    setCart: (state, action) => {
      const products = action.payload.products || [];

      state.cartItems = products.map((item) => ({
        cartItemId: item._id,                // ✅ ONLY ID we use
        productId: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0]?.url || "/fallback.png",
        price: item.product.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        stock: item.product.stock,
        blacklisted: item.product.blacklisted,
      }));

      recalcTotals(state);
    },

    /* =====================
       ADD TO CART
    ===================== */
    addToCart: (state, action) => {
      const incoming = action.payload;

      const existing = state.cartItems.find(
        (item) =>
          item.productId === incoming.productId &&
          item.color === incoming.color &&
          item.size === incoming.size
      );

      if (existing) {
        existing.quantity += incoming.quantity;
      } else {
        state.cartItems.push(incoming);
      }

      recalcTotals(state);
    },

    /* =====================
       REMOVE / DECREASE
    ===================== */
    removeFromCart: (state, action) => {
      const { cartItemId } = action.payload;

      const item = state.cartItems.find(
        (i) => i.cartItemId === cartItemId
      );

      if (!item) return;

      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        state.cartItems = state.cartItems.filter(
          (i) => i.cartItemId !== cartItemId
        );
      }

      recalcTotals(state);
    },

    /* =====================
       EMPTY CART
    ===================== */
    emptyCart: (state) => {
      state.cartItems = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    },
  },
});

export const {
  setCart,
  addToCart,
  removeFromCart,
  emptyCart,
} = cartSlice.actions;

export default cartSlice.reducer;
