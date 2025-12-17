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
      return rejectWithValue("Checkout init failed");
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
    } catch {
      return rejectWithValue("Failed to load addresses");
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
    } catch {
      return rejectWithValue("Failed to add address");
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
    } catch {
      return rejectWithValue("Failed to update address");
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
    } catch {
      return rejectWithValue("Failed to delete address");
    }
  }
);

/* 6️⃣ APPLY COUPON (PREVIEW ONLY) */
export const applyCoupon = createAsyncThunk(
  "checkout/applyCoupon",
  async (code, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API}/coupons/apply`,
        { code },
        { headers: authHeader() }
      );
      return { code, summary: res.data.summary };
    } catch {
      return rejectWithValue("Invalid coupon");
    }
  }
);

/* 7️⃣ PLACE ORDER (COD / RAZORPAY) */
export const placeOrder = createAsyncThunk(
  "checkout/placeOrder",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { addressId, coupon, paymentMethod:paymentMode } =
        getState().checkout;

      if (!addressId) {
        return rejectWithValue("Please select delivery address");
      }

      // ✅ Backend expects: COD | RAZORPAY
      const apiPaymentMethod =
        paymentMode === "COD" ? "COD" : "RAZORPAY";

      const res = await axios.post(
        `${API}/orders/create`,
        {
          addressId,
          couponCode: coupon?.code || null,
          paymentMode: apiPaymentMethod, // ✅ FIXED
        },
        { headers: authHeader() }
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Order failed"
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

    /* ADDRESS */
    addresses: [],
    addressId: null,

    /* PAYMENT */
    paymentMethod: "COD", // "COD" | "RAZORPAY"

    /* COUPON */
    coupon: null,

    /* ORDER RESULT */
    order: null, // { id, paymentMethod, totalAmount, razorpayOrder? }

    /* UI */
    loading: false,
    error: null,
  },

  reducers: {
    setAddress(state, action) {
      state.addressId = action.payload;
    },

    setPaymentMethod(state, action) {
      state.paymentMethod =
        action.payload === "COD" ? "COD" : "RAZORPAY";
    },

    resetCheckout() {
      return checkoutSlice.getInitialState();
    },
  },

  extraReducers: (builder) => {
    builder

      /* INIT CHECKOUT */
      .addCase(initCheckout.pending, (state) => {
        state.loading = true;
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
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.addresses = action.payload;
      })

      /* CREATE ADDRESS */
      .addCase(createAddress.fulfilled, (state, action) => {
        state.addresses.unshift(action.payload);
      })

      /* UPDATE ADDRESS */
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.map((addr) =>
          addr._id === action.payload._id ? action.payload : addr
        );
      })

      /* DELETE ADDRESS */
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter(
          (addr) => addr._id !== action.payload
        );
        if (state.addressId === action.payload) {
          state.addressId = null;
        }
      })

      /* APPLY COUPON */
      .addCase(applyCoupon.pending, (state) => {
        state.loading = true;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupon = { code: action.payload.code };
        state.summary = action.payload.summary;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* PLACE ORDER */
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = {
          id: action.payload.orderId,
          paymentMethod: action.payload.paymentMethod,
          totalAmount: action.payload.totalAmount,
          razorpayOrder: action.payload.razorpayOrder || null,
        };
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setAddress,
  setPaymentMethod,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
