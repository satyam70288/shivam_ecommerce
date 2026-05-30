// redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInterceptor"; // ✅ ONLY THIS LINE CHANGED

// Base URL
const API_URL = `${import.meta.env.VITE_API_URL}`;

const emptyCart = {
  items: [],
  summary: {
    itemCount: 0,
    subtotal: 0,
    discount: 0,
    total: 0,
    grandTotal: 0,
  },
};

const refetchCartFromApi = async () => {
  const cartResponse = await axiosInstance.get(`${API_URL}/cart`);
  return cartResponse.data.cart || emptyCart;
};

// ================ ASYNC THUNKS ================

// Fetch user's cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_arg, { rejectWithValue }) => {
    try {
      return await refetchCartFromApi();
    } catch (error) {
      // If cart doesn't exist, return empty cart
      if (error.response?.status === 404) {
        return emptyCart;
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
    { productId, quantity = 1, color, size, variantId = null },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/add`, {
        productId,
        quantity,
        ...(color != null && { color }),
        ...(size != null && { size }),
        variantId,
      });

      if (response.data.success) {
        return await refetchCartFromApi();
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
  async ({ cartItemId }, { rejectWithValue }) => {
    try {
      if (!cartItemId) {
        return rejectWithValue("Missing cart item id");
      }

      const response = await axiosInstance.post(`${API_URL}/cart/remove`, {
        cartItemId: String(cartItemId),
      });

      if (response.data.success) {
        return await refetchCartFromApi();
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
  async ({ cartItemId }, { rejectWithValue }) => {
    try {
      if (!cartItemId) {
        return rejectWithValue("Missing cart item id");
      }

      const response = await axiosInstance.post(`${API_URL}/cart/increase`, {
        cartItemId: String(cartItemId),
      });

      if (response.data.success) {
        return await refetchCartFromApi();
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
  async ({ cartItemId }, { rejectWithValue }) => {
    try {
      if (!cartItemId) {
        return rejectWithValue("Missing cart item id");
      }

      const response = await axiosInstance.post(`${API_URL}/cart/decrease`, {
        cartItemId: String(cartItemId),
      });

      if (response.data.success) {
        return await refetchCartFromApi();
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
  async (_arg, { rejectWithValue }) => {
    try {
      const current = await refetchCartFromApi();
      for (const item of current.items || []) {
        if (item.cartItemId) {
          await axiosInstance.post(`${API_URL}/cart/remove`, {
            cartItemId: String(item.cartItemId),
          });
        }
      }
      return emptyCart;
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
        const unit =
          parseFloat(item.discountedPrice ?? item.finalPrice ?? item.sellingPrice) ||
          parseFloat(item.originalPrice ?? item.price) ||
          0;
        item.lineTotal = parseFloat((unit * quantity).toFixed(2));
        
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
        const existing = state.items[existingIndex];
        const unit =
          parseFloat(existing.discountedPrice ?? existing.finalPrice ?? existing.sellingPrice) ||
          parseFloat(existing.originalPrice ?? existing.price) ||
          0;
        existing.lineTotal = parseFloat((unit * existing.quantity).toFixed(2));
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
  
  state.items.forEach((item) => {
    if (!item.outOfStock && !item.cartItemId?.startsWith("temp-")) {
      const mrp = parseFloat(item.originalPrice ?? item.price) || 0;
      const selling =
        parseFloat(item.discountedPrice ?? item.finalPrice ?? item.sellingPrice) ||
        mrp;
      const quantity = parseInt(item.quantity, 10) || 0;

      subtotal += mrp * quantity;
      discount += (mrp - selling) * quantity;
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