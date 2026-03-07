// store/slices/wishlistSlice.js
import axiosInstance from '@/api/axiosInterceptor';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ✅ No need for API variable - axiosInstance already has baseURL

// Async thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      // ✅ Just use relative path
      const response = await axiosInstance.get('/wishlist');
      return response.data.data || [];
    } catch (error) {
      // ✅ Check for 401 specifically
      if (error.response?.status === 401) {
        return rejectWithValue('Please login to view wishlist');
      }
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch wishlist'
      );
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async (productId, { rejectWithValue, dispatch }) => {
    try {
      // ✅ First do optimistic update
      dispatch(optimisticToggle(productId));
      
      // ✅ Then make API call
      const response = await axiosInstance.post('/toggle', { productId });
      
      return {
        productId,
        action: response.data.action,
        isInWishlist: response.data.isInWishlist,
        product: response.data.product // If backend sends product data
      };
    } catch (error) {
      // ✅ Revert optimistic update on error
      dispatch(revertOptimisticToggle(productId));
      
      // ✅ Handle specific errors
      if (error.response?.status === 401) {
        return rejectWithValue('Please login to modify wishlist');
      }
      
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
  items: [],
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
    clearWishlist: (state) => {
      state.items = [];
      state.wishlistStatus = {};
      state.error = null;
    },
    
    // ✅ Fixed optimistic toggle
    optimisticToggle: (state, action) => {
      const productId = action.payload;
      state.wishlistStatus[productId] = !state.wishlistStatus[productId];
    },
    
    // ✅ Fixed revert toggle
    revertOptimisticToggle: (state, action) => {
      const productId = action.payload;
      state.wishlistStatus[productId] = !state.wishlistStatus[productId];
    },
    
    setWishlistStatus: (state, action) => {
      const { productId, status } = action.payload;
      state.wishlistStatus[productId] = status;
    },
    
    // ✅ New: Batch update status
    setBatchWishlistStatus: (state, action) => {
      const statusMap = action.payload;
      state.wishlistStatus = { ...state.wishlistStatus, ...statusMap };
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
        state.error = null; // ✅ Clear error on success
        
        // Reset and update status
        state.wishlistStatus = {};
        action.payload.forEach(product => {
          if (product?._id) {
            state.wishlistStatus[product._id] = true;
          }
        });
        
        state.lastUpdated = Date.now();
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        
        // ✅ Don't clear items on error - keep old data
        // state.items = []; // ❌ Don't do this
      })
      
      // 🔄 Toggle wishlist
      .addCase(toggleWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null; // ✅ Clear error on success
        
        const { productId, isInWishlist, product } = action.payload;
        
        // Update status
        state.wishlistStatus[productId] = isInWishlist;
        
        // Update items array
        if (isInWishlist) {
          // Product added - if product data provided
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
        
        // ✅ Note: optimistic toggle already reverted in thunk
      });
  }
});

export const { 
  clearWishlist, 
  optimisticToggle, 
  revertOptimisticToggle,
  setWishlistStatus,
  setBatchWishlistStatus // ✅ Export new action
} = wishlistSlice.actions;

export default wishlistSlice.reducer;