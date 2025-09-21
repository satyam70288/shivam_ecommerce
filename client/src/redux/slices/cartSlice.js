import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
  totalQuantity: 0,
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Set cart from backend (used when fetching user cart)
    setCart: (state, action) => {
      const products = action.payload.products || [];

      // Map over the products and create cartItems
      state.cartItems = products.map((item) => {
        const variant = item.product.variants?.find(
          (v) => v.color === item.color
        );

        return {
          cartItemId: item._id,       // ✅ Cart item ID, for remove API
          productId: item.product._id, // ✅ Product ID
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          price: item.product.price,
          name: item.product.name,
          image: variant?.images?.[0]?.url || "/fallback.png",
          stock: item.product.stock,
          blacklisted: item.product.blacklisted,
        };
      });


      // Calculate totals
      state.totalQuantity = state.cartItems.reduce(
        (acc, item) => acc + item.quantity,
        0
      );
      state.totalPrice = state.cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
    },


    // Add an item to cart
    addToCart: (state, action) => {
      const existingItem = state.cartItems.find(
        (item) =>
          item._id === action.payload._id &&
          item.color === action.payload.color &&
          item.size === action.payload.size
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.cartItems.push(action.payload);
      }

      // recalc totals
      state.totalQuantity = state.cartItems.reduce(
        (acc, item) => acc + item.quantity,
        0
      );
      state.totalPrice = state.cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
    },

    // Remove a single item from cart
    removeFromCart: (state, action) => {
      const { productId, color, size } = action.payload;
      console.log(action.payload, "payload");
      console.log(state.cartItems);
      const existingItem = state.cartItems.find(
        (item) =>
          item._id === action.payload._id &&
          item.color === action.payload.color &&
          item.size === action.payload.size
      );

      console.log(existingItem, "existing item");
      if (existingItem) {
        if (existingItem.quantity > 1) {
          existingItem.quantity -= 1; // decrease by 1
        } else {
          state.cartItems = state.cartItems.filter(
            (item) =>
              !(
                item._id === productId &&
                item.color === color &&
                item.size === size
              )
          );
        }
      }

      // recalc totals
      state.totalQuantity = state.cartItems.reduce(
        (acc, item) => acc + item.quantity,
        0
      );
      state.totalPrice = state.cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
    },

    // Empty the entire cart
    emptyCart: (state) => {
      state.cartItems = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    },
  },
});

export const { setCart, addToCart, removeFromCart, emptyCart } =
  cartSlice.actions;
export default cartSlice.reducer;
