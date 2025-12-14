import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* =====================================================
   ASYNC THUNKS
===================================================== */

/* 1️⃣ INIT CHECKOUT (cart or buy-now UI only) */
export const initCheckout = createAsyncThunk(
  "checkout/init",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API}/checkout/init`, {
        headers: authHeader(),
      });
      return res.data; // { items, summary }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Checkout init failed"
      );
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
      return res.data.data; // ✅ FIXED (backend sends { data })
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      return rejectWithValue("Failed to delete address");
    }
  }
);

/* 6️⃣ APPLY COUPON */
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
    } catch (err) {
      return rejectWithValue("Invalid coupon");
    }
  }
);

/* 7️⃣ PLACE ORDER (COD / ONLINE) */
export const placeOrder = createAsyncThunk(
  "checkout/placeOrder",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { addressId, coupon, paymentMethod } = getState().checkout;

      if (!addressId) {
        return rejectWithValue("Please select delivery address");
      }

      const res = await axios.post(
        `${API}/orders/create`,
        {
          addressId,
          couponCode: coupon?.code || null,
          paymentMode:paymentMethod, // "COD" | "ONLINE"
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
    items: [],

    addresses: [],
    addressId: null,

    coupon: null, // { code }
    paymentMethod: "COD",

    summary: {
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
    },

    loading: false,
    error: null,
    order: null,
  },

  reducers: {
    setAddress(state, action) {
      state.addressId = action.payload;
    },

    setPaymentMethod(state, action) {
      state.paymentMethod = action.payload;
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
        state.order = action.payload;
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
