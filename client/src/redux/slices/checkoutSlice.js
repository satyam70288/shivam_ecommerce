// redux/slices/checkoutSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* =====================================================
   ASYNC THUNKS
===================================================== */

/* 1️⃣ INIT CHECKOUT (PREVIEW ONLY) */
export const initCheckout = createAsyncThunk(
  "checkout/init",
  async ({ productId, qty } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      if (productId) {
        params.append("productId", productId);
        params.append("qty", qty || 1);
      }

      const res = await axios.get(
        `${API}/checkout/init?${params.toString()}`,
        {
          headers: authHeader(),
        }
      );

      return res.data; // { items, summary }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Checkout init failed");
    }
  }
);

/* 2️⃣ FETCH ADDRESSES */
export const fetchAddresses = createAsyncThunk(
  "checkout/fetchAddresses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API}/addresses`, {
        headers: authHeader(),
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load addresses");
    }
  }
);

/* 3️⃣ CREATE ADDRESS */
export const createAddress = createAsyncThunk(
  "checkout/createAddress",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API}/addresses`, data, {
        headers: authHeader(),
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add address");
    }
  }
);

/* 4️⃣ UPDATE ADDRESS */
export const updateAddress = createAsyncThunk(
  "checkout/updateAddress",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API}/addresses/${id}`, data, {
        headers: authHeader(),
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update address");
    }
  }
);

/* 5️⃣ DELETE ADDRESS */
export const deleteAddress = createAsyncThunk(
  "checkout/deleteAddress",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API}/addresses/${id}`, {
        headers: authHeader(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete address");
    }
  }
);

/* 6️⃣ APPLY COUPON */
export const applyCoupon = createAsyncThunk(
  "checkout/applyCoupon",
  async (code, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const { productId, qty } = state.checkout;
      
      const params = new URLSearchParams();
      if (productId) {
        params.append("productId", productId);
        params.append("qty", qty || 1);
      }
      
      const res = await axios.post(
        `${API}/coupons/apply?${params.toString()}`,
        { code },
        { headers: authHeader() }
      );
      
      return { 
        code, 
        summary: res.data.summary,
        discount: res.data.discount || 0
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Invalid coupon");
    }
  }
);

/* 7️⃣ PLACE COD ORDER */
export const placeCodOrder = createAsyncThunk(
  "checkout/placeCodOrder",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const { addressId, productId, qty } = state.checkout;
      console.log(productId,"productId")
      if (!addressId) {
        return rejectWithValue("Address is required");
      }

      // ✅ FIX: template string
      const endpoint = `${API}/orders/create`;

      // ✅ Payload matches backend logic
      const payload = productId
        ? { addressId, productId, quantity: qty || 1 } // BUY NOW
        : { addressId }; // CART

      const res = await axios.post(endpoint, payload, {
        headers: authHeader(),
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to place COD order"
      );
    }
  }
);


/* 8️⃣ CREATE RAZORPAY ORDER (Payment Initiation) */
export const createRazorpayOrder = createAsyncThunk(
  "checkout/createRazorpayOrder",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const { addressId, productId, qty, summary } = state.checkout;
      
      if (!addressId) {
        throw new Error("Address is required");
      }
      
      // Create Razorpay order for payment initiation
      const res = await axios.post(
        `${API}/generate-payment`,
        {
          addressId,
          productId,
          quantity: qty || 1,
          amount: summary.total // Total amount from checkout summary
        },
        {
          headers: authHeader(),
        }
      );
      
      if (!res.data.success) {
        throw new Error(res.data.message);
      }
      
      return res.data; // { razorpayOrderId, amount, key, success: true }
      
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create payment order"
      );
    }
  }
);

/* 9️⃣ VERIFY RAZORPAY PAYMENT & CREATE FINAL ORDER */
export const verifyRazorpayPayment = createAsyncThunk(
  "checkout/verifyRazorpayPayment",
  async (paymentData, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const { addressId, productId, qty } = state.checkout;
      
      const res = await axios.post(
        `${API}/verify-payment`,
        {
          ...paymentData,
          addressId,
          productId,
          quantity: qty || 1
        },
        {
          headers: authHeader(),
        }
      );
      
      if (!res.data.success) {
        throw new Error(res.data.message);
      }
      
      return res.data; // { orderId, success: true, message }
      
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Payment verification failed"
      );
    }
  }
);

/* =====================================================
   SLICE
===================================================== */

const checkoutSlice = createSlice({
  name: "checkout",

  initialState: {
    /* PREVIEW DATA */
    items: [],
    summary: {
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
    },

    /* CHECKOUT TYPE */
    productId: null,
    qty: 1,

    /* ADDRESS */
    addresses: [],
    addressId: null,

    /* PAYMENT */
    paymentMethod: "COD", // "COD" | "RAZORPAY"

    /* COUPON */
    coupon: null,
    appliedCoupon: null,

    /* PAYMENT DATA */
    razorpayOrder: null, // { id, amount, key }

    /* ORDER RESULT */
    placedOrder: null, // { id, paymentMethod, totalAmount }

    /* UI */
    loading: false,
    error: null,
  },

  reducers: {
    setAddress(state, action) {
      state.addressId = action.payload;
    },

    setPaymentMethod(state, action) {
      state.paymentMethod = action.payload;
    },
    
    setProductId(state, action) {
      state.productId = action.payload;
    },
    
    setQuantity(state, action) {
      state.qty = action.payload;
    },
    
    setRazorpayOrder(state, action) {
      state.razorpayOrder = action.payload;
    },
    
    clearCoupon(state) {
      state.coupon = null;
      state.appliedCoupon = null;
      // Reset summary to original (you might need to recalculate)
    },

    resetCheckout() {
      return checkoutSlice.getInitialState();
    },
    
    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* INIT CHECKOUT */
      .addCase(initCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.summary = action.payload.summary;
      })
      .addCase(initCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* FETCH ADDRESSES */
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state) => {
        state.loading = false;
      })

      /* CREATE ADDRESS */
      .addCase(createAddress.fulfilled, (state, action) => {
        state.addresses.unshift(action.payload);
        // Auto-select new address
        state.addressId = action.payload._id;
      })

      /* UPDATE ADDRESS */
      .addCase(updateAddress.fulfilled, (state, action) => {
        const index = state.addresses.findIndex(addr => addr._id === action.payload._id);
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
      })

      /* DELETE ADDRESS */
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter(
          (addr) => addr._id !== action.payload
        );
        if (state.addressId === action.payload) {
          state.addressId = state.addresses[0]?._id || null;
        }
      })

      /* APPLY COUPON */
      .addCase(applyCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupon = { code: action.payload.code };
        state.appliedCoupon = action.payload.code;
        state.summary = action.payload.summary;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* PLACE COD ORDER */
      .addCase(placeCodOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeCodOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.placedOrder = {
          id: action.payload.orderId,
          paymentMethod: "COD",
          totalAmount: action.payload.totalAmount || state.summary.total,
        };
      })
      .addCase(placeCodOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* CREATE RAZORPAY ORDER */
      .addCase(createRazorpayOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.razorpayOrder = {
          id: action.payload.razorpayOrderId,
          amount: action.payload.amount,
          key: action.payload.key,
        };
      })
      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* VERIFY RAZORPAY PAYMENT */
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.placedOrder = {
          id: action.payload.orderId,
          paymentMethod: "RAZORPAY",
          totalAmount: action.payload.totalAmount || state.summary.total,
        };
        state.razorpayOrder = null; // Clear after successful verification
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.razorpayOrder = null; // Clear on failure
      });
  },
});

export const {
  setAddress,
  setPaymentMethod,
  setProductId,
  setQuantity,
  setRazorpayOrder,
  clearCoupon,
  resetCheckout,
  clearError,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;