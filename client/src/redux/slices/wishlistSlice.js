// store/slices/wishlistSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

// Helper function for auth headers
const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ✅ Async thunks - सिर्फ दो ही (Toggle + Fetch)
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API}/wishlist`, {
        headers: getAuthHeader(),
      });
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch wishlist'
      );
    }
  }
);

// ✅ सिर्फ एक toggle function - Backend में /wishlist/toggle endpoint होना चाहिए
// store/slices/wishlistSlice.js
export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API}/toggle`,
        { productId },
        { headers: getAuthHeader() }
      );
      
      return {
        productId,
        action: response.data.action,
        isInWishlist: response.data.isInWishlist
      };
    } catch (error) {
      // ✅ Error को string में convert करें
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to toggle wishlist'
      );
    }
  }
);

// Initial state
const initialState = {
  items: [], // पूरे product objects
  wishlistStatus: {}, // { productId: true/false }
  loading: false,
  error: null,
  lastUpdated: null
};

// Create slice
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // ✅ Clear wishlist (logout पर use करें)
    clearWishlist: (state) => {
      state.items = [];
      state.wishlistStatus = {};
      state.error = null;
    },
    
    // ✅ Optimistic toggle - instant UI update के लिए
    optimisticToggle: (state, action) => {
      const productId = action.payload;
      const currentStatus = state.wishlistStatus[productId] || false;
      state.wishlistStatus[productId] = !currentStatus;
    },
    
    // ✅ Revert optimistic toggle - अगर API fail हो
    revertOptimisticToggle: (state, action) => {
      const productId = action.payload;
      const currentStatus = state.wishlistStatus[productId] || false;
      state.wishlistStatus[productId] = !currentStatus;
    },
    
    // ✅ Set status manually (product page से आने पर)
    setWishlistStatus: (state, action) => {
      const { productId, status } = action.payload;
      state.wishlistStatus[productId] = status;
    }
  },
  extraReducers: (builder) => {
    builder
      // 🔄 Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        
        // Reset and update status
        state.wishlistStatus = {};
        action.payload.forEach(product => {
          if (product && product._id) {
            state.wishlistStatus[product._id] = true;
          }
        });
        
        state.lastUpdated = Date.now();
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // 🔄 Toggle wishlist
      .addCase(toggleWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, isInWishlist, product } = action.payload;
        
        // Update status
        state.wishlistStatus[productId] = isInWishlist;
        
        // Update items array
        if (isInWishlist) {
          // Product added - अगर backend product data भेजे तो add करें
          if (product && !state.items.some(item => item._id === productId)) {
            state.items.push(product);
          }
        } else {
          // Product removed
          state.items = state.items.filter(item => item._id !== productId);
        }
        
        state.lastUpdated = Date.now();
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearWishlist, 
  optimisticToggle, 
  revertOptimisticToggle,
  setWishlistStatus 
} = wishlistSlice.actions;

export default wishlistSlice.reducer;