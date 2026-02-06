// redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base URL
const API_URL = `${import.meta.env.VITE_API_URL}`;


// ================ ASYNC THUNKS ================

// Fetch user's cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/cart/${userId}`);
      return response.data.cart || {
        items: [],
        summary: {
          itemCount: 0,
          subtotal: 0,
          discount: 0,
          total: 0,
          grandTotal: 0,
        },
      };
    } catch (error) {
      // If cart doesn't exist, return empty cart
      if (error.response?.status === 404) {
        return {
          items: [],
          summary: {
            itemCount: 0,
            subtotal: 0,
            discount: 0,
            total: 0,
            grandTotal: 0,
          },
        };
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch cart"
      );
    }
  }
);

// Add to cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (
    { userId, productId, quantity = 1, color = "Default", size = "M", variantId = null },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${API_URL}/add`, {
        userId,
        productId,
        quantity,
        color,
        size,
        variantId,
      });
      
      // If API returns success, fetch updated cart
      if (response.data.success) {
        const cartResponse = await axios.get(`${API_URL}/cart/${userId}`);
        return cartResponse.data.cart;
      } else {
        throw new Error(response.data.message || "Failed to add to cart");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to add to cart"
      );
    }
  }
);

// Remove from cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ userId, cartItemId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/cart/remove`, {
        userId,
        cartItemId,
      });
      
      if (response.data.success) {
        const cartResponse = await axios.get(`${API_URL}/cart/${userId}`);
        return cartResponse.data.cart;
      } else {
        throw new Error(response.data.message || "Failed to remove item");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to remove from cart"
      );
    }
  }
);

// Increase quantity
export const increaseQuantity = createAsyncThunk(
  "cart/increaseQuantity",
  async ({ userId, cartItemId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/cart/increase`, {
        userId,
        cartItemId,
      });
      
      if (response.data.success) {
        const cartResponse = await axios.get(`${API_URL}/cart/${userId}`);
        return cartResponse.data.cart;
      } else {
        throw new Error(response.data.message || "Failed to increase quantity");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to increase quantity"
      );
    }
  }
);

// Decrease quantity
export const decreaseQuantity = createAsyncThunk(
  "cart/decreaseQuantity",
  async ({ userId, cartItemId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/cart/decrease`, {
        userId,
        cartItemId,
      });
      
      if (response.data.success) {
        const cartResponse = await axios.get(`${API_URL}/cart/${userId}`);
        return cartResponse.data.cart;
      } else {
        throw new Error(response.data.message || "Failed to decrease quantity");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to decrease quantity"
      );
    }
  }
);

// Clear entire cart
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/cart/clear/${userId}`);
      
      if (response.data.success) {
        return {
          items: [],
          summary: {
            itemCount: 0,
            subtotal: 0,
            discount: 0,
            total: 0,
            grandTotal: 0,
          },
        };
      } else {
        throw new Error(response.data.message || "Failed to clear cart");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to clear cart"
      );
    }
  }
);

// ================ SLICE ================

const initialState = {
  items: [],
  summary: {
    itemCount: 0,
    subtotal: 0,
    discount: 0,
    total: 0,
    grandTotal: 0,
  },
  loading: false,
  error: null,
  lastUpdated: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Sync actions for immediate UI updates
    updateCartItem: (state, action) => {
      const { cartItemId, quantity } = action.payload;
      const item = state.items.find(item => item.cartItemId === cartItemId);
      if (item) {
        item.quantity = quantity;
        item.lineTotal = (item.finalPrice * quantity).toFixed(2);
        
        // Recalculate summary
        recalculateSummary(state);
      }
    },
    
    // Remove item locally (optimistic)
    removeItemOptimistic: (state, action) => {
      const cartItemId = action.payload;
      state.items = state.items.filter(item => item.cartItemId !== cartItemId);
      recalculateSummary(state);
    },
    
    // Add item locally (optimistic)
    addItemOptimistic: (state, action) => {
      const newItem = action.payload;
      // Check if item already exists (by productId, color, size)
      const existingIndex = state.items.findIndex(
        item => 
          item.productId === newItem.productId && 
          item.color === newItem.color && 
          item.size === newItem.size
      );
      
      if (existingIndex > -1) {
        // Update quantity
        state.items[existingIndex].quantity += newItem.quantity;
        state.items[existingIndex].lineTotal = 
          (state.items[existingIndex].finalPrice * state.items[existingIndex].quantity).toFixed(2);
      } else {
        // Add new item
        state.items.push(newItem);
      }
      
      recalculateSummary(state);
    },
    
    // Clear cart locally
    clearCartLocal: (state) => {
      state.items = [];
      state.summary = {
        itemCount: 0,
        subtotal: 0,
        discount: 0,
        total: 0,
        grandTotal: 0,
      };
      state.error = null;
    },
    
    // Reset error
    resetError: (state) => {
      state.error = null;
    },
    
    // Force update cart data
    setCartData: (state, action) => {
      state.items = action.payload.items || [];
      state.summary = action.payload.summary || initialState.summary;
      state.lastUpdated = new Date().toISOString();
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Helper function for pending state
    const handlePending = (state) => {
      state.loading = true;
      state.error = null;
    };
    
    // Helper function for fulfilled state
    const handleFulfilled = (state, action) => {
      state.loading = false;
      state.items = action.payload.items || [];
      state.summary = action.payload.summary || initialState.summary;
      state.lastUpdated = new Date().toISOString();
      state.error = null;
    };
    
    // Helper function for rejected state
    const handleRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload || "Something went wrong";
    };

    builder
      // ========== FETCH CART ==========
      .addCase(fetchCart.pending, handlePending)
      .addCase(fetchCart.fulfilled, handleFulfilled)
      .addCase(fetchCart.rejected, handleRejected)
      
      // ========== ADD TO CART ==========
      .addCase(addToCart.pending, handlePending)
      .addCase(addToCart.fulfilled, handleFulfilled)
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add to cart";
        // Keep optimistic update on error? No, it will be reverted in hook
      })
      
      // ========== REMOVE FROM CART ==========
      .addCase(removeFromCart.pending, handlePending)
      .addCase(removeFromCart.fulfilled, handleFulfilled)
      .addCase(removeFromCart.rejected, handleRejected)
      
      // ========== INCREASE QUANTITY ==========
      .addCase(increaseQuantity.pending, handlePending)
      .addCase(increaseQuantity.fulfilled, handleFulfilled)
      .addCase(increaseQuantity.rejected, handleRejected)
      
      // ========== DECREASE QUANTITY ==========
      .addCase(decreaseQuantity.pending, handlePending)
      .addCase(decreaseQuantity.fulfilled, handleFulfilled)
      .addCase(decreaseQuantity.rejected, handleRejected)
      
      // ========== CLEAR CART ==========
      .addCase(clearCart.pending, handlePending)
      .addCase(clearCart.fulfilled, handleFulfilled)
      .addCase(clearCart.rejected, handleRejected);
  },
});

// Helper function to recalculate cart summary
const recalculateSummary = (state) => {
  let subtotal = 0;
  let discount = 0;
  let itemCount = 0;
  
  state.items.forEach(item => {
    if (!item.outOfStock && !item.cartItemId?.startsWith('temp-')) {
      const price = parseFloat(item.price) || 0;
      const finalPrice = parseFloat(item.finalPrice) || 0;
      const quantity = parseInt(item.quantity) || 0;
      
      subtotal += price * quantity;
      discount += (price - finalPrice) * quantity;
      itemCount += quantity;
    }
  });
  
  const total = Math.max(subtotal - discount, 0);
  
  state.summary = {
    itemCount,
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    grandTotal: parseFloat(total.toFixed(2)),
  };
};

// Export actions
export const { 
  updateCartItem, 
  removeItemOptimistic, 
  addItemOptimistic, 
  clearCartLocal, 
  resetError,
  setCartData 
} = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;