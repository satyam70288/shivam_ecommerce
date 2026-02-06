// redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}`;

// ================ ASYNC THUNKS ================

// Fetch user's cart (सिर्फ़ पहली बार लोड होने पर)
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/cart/${userId}`);
      return response.data.cart || getEmptyCart();
    } catch (error) {
      if (error.response?.status === 404) {
        return getEmptyCart();
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch cart");
    }
  }
);

// Generic cart operation - हर operation के बाद server से fresh data लाता है
export const updateCart = createAsyncThunk(
  "cart/updateCart",
  async ({ userId, operation, data }, { rejectWithValue }) => {
    try {
      let response;
      
      switch (operation) {
        case 'add':
          response = await axios.post(`${API_URL}/add`, { userId, ...data });
          break;
        case 'remove':
          response = await axios.post(`${API_URL}/cart/remove`, { userId, ...data });
          break;
        case 'increase':
          response = await axios.post(`${API_URL}/cart/increase`, { userId, ...data });
          break;
        case 'decrease':
          response = await axios.post(`${API_URL}/cart/decrease`, { userId, ...data });
          break;
        case 'clear':
          response = await axios.delete(`${API_URL}/cart/clear/${userId}`);
          break;
        default:
          throw new Error('Invalid operation');
      }
      
      // ✅ IMPORTANT: Backend से हमेशा complete cart return करवाएं
      // Example response: { success: true, cart: { items: [...], summary: {...} } }
      if (response.data.success) {
        return response.data.cart;
      } else {
        throw new Error(response.data.message || 'Operation failed');
      }
      
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Operation failed"
      );
    }
  }
);

// Helper for empty cart
const getEmptyCart = () => ({
  items: [],
  summary: {
    itemCount: 0,
    subtotal: 0,
    discount: 0,
    total: 0,
  },
});

// ================ SLICE ================

const initialState = {
  items: [],
  summary: {
    itemCount: 0,
    subtotal: 0,
    discount: 0,
    total: 0,
  },
  loading: false,
  error: null,
  lastUpdated: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // ✅ केवल sync actions जो API call नहीं करते
    
    // Reset error
    resetError: (state) => {
      state.error = null;
    },
    
    // ✅ Optional: Optimistic update for better UX
    optimisticAdd: (state, action) => {
      const { tempId, productData } = action.payload;
      state.items.unshift({
        cartItemId: `temp-${tempId}`,
        ...productData,
        loading: true,
      });
    },
    
    optimisticRemove: (state, action) => {
      const cartItemId = action.payload;
      state.items = state.items.filter(item => item.cartItemId !== cartItemId);
    },
    
    optimisticUpdate: (state, action) => {
      const { cartItemId, quantity } = action.payload;
      const item = state.items.find(item => item.cartItemId === cartItemId);
      if (item) {
        item.quantity = quantity;
        item.loading = true;
      }
    },
    
    // Clear temporary/loading states when real data arrives
    clearOptimisticStates: (state) => {
      // Remove temporary items
      state.items = state.items.filter(item => !item.cartItemId?.startsWith('temp-'));
      // Clear loading flags
      state.items.forEach(item => delete item.loading);
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
      
      // ✅ DIRECT SERVER DATA - No recalculation needed
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
      
      // ========== UPDATE CART (ALL OPERATIONS) ==========
      .addCase(updateCart.pending, handlePending)
      .addCase(updateCart.fulfilled, handleFulfilled)
      .addCase(updateCart.rejected, handleRejected);
  },
});

// ❌ NO recalculateSummary function needed anymore!

// Export actions
export const { 
  resetError,
  optimisticAdd,
  optimisticRemove,
  optimisticUpdate,
  clearOptimisticStates
} = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;