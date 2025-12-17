import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
  name: "product",

  initialState: {
    products: [],
  },

  reducers: {
    // For first page / filters / search
    setProducts: (state, action) => {
      state.products = action.payload;
    },

    // For mobile "Load more"
    appendProducts: (state, action) => {
      state.products.push(...action.payload);
    },

    // Optional but useful
    clearProducts: (state) => {
      state.products = [];
    },
  },
});

export const {
  setProducts,
  appendProducts,
  clearProducts,
} = productSlice.actions;

export default productSlice.reducer;
