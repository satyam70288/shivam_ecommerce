import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  summary: {
    subtotal: 0,
    discount: 0,
    total: 0,
    grandTotal: 0,
    itemCount: 0,
  },
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    cartRequest(state) {
      state.loading = true;
      state.error = null;
    },

    setCart(state, action) {
      const { items = [], summary = {} } = action.payload.cart || {};

      state.items = items.map((item) => ({
        cartItemId:item.cartItemId,
        productId: item.productId,
        name: item.name,
        image: item.image,

        price: Number(item.price),
        finalPrice: Number(item.finalPrice),
        discountPercent: item.discountPercent || 0,

        quantity: item.quantity,
        lineTotal: Number(item.lineTotal),
        stock: item.stock,
      }));

      state.summary = {
        subtotal: Number(summary.subtotal || 0),
        discount: Number(summary.discount || 0),
        total: Number(summary.total || 0),
        grandTotal: Number(summary.grandTotal || 0),
        itemCount: Number(summary.itemCount || 0),
      };

      state.loading = false;
    },

    cartFailure(state, action) {
      state.loading = false;
      state.error = action.payload || "Cart error";
    },

    emptyCart(state) {
      state.items = [];
      state.summary = initialState.summary;
    },
  },
});

export const {
  cartRequest,
  setCart,
  cartFailure,
  emptyCart,
} = cartSlice.actions;

export default cartSlice.reducer;
