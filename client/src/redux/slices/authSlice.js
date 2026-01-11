import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for signup
export const signupUser = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/signup`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Registration failed. Please try again."
      );
    }
  }
);

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please try again."
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Clear localStorage
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("persist:root"); // Redux persist storage

      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// Async thunk for change password
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/auth/change-password`,
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Password change failed. Please try again."
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",

  initialState: {
    role: localStorage.getItem("role") || "",
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || "",
    isAuthenticated: !!localStorage.getItem("token"),
    changePasswordLoading: false,
    changePasswordError: null,
    changePasswordSuccess: false,

    // For async operations
    loading: false,
    error: null,
    message: "",

    // Separate states for signup/login
    signupLoading: false,
    signupError: null,
    signupSuccess: false,

    loginLoading: false,
    loginError: null,
  },

  reducers: {
    setUserLogin: (state, action) => {
      state.role = action.payload.user?.role || "";
      state.user = action.payload.user || null;
      state.token = action.payload.token || "";
      state.isAuthenticated = true;

      // Store in localStorage
      if (action.payload.user?.role) {
        localStorage.setItem("role", action.payload.user.role);
      }
      if (action.payload.user) {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
      if (action.payload.token) {
        localStorage.setItem("token", action.payload.token);
      }
    },

    setUserLogout: (state) => {
      state.role = "";
      state.user = null;
      state.token = "";
      state.isAuthenticated = false;

      // Clear localStorage
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },

    clearAuthError: (state) => {
      state.error = null;
      state.signupError = null;
      state.loginError = null;
      state.message = "";
    },

    clearSignupState: (state) => {
      state.signupLoading = false;
      state.signupError = null;
      state.signupSuccess = false;
    },

    clearLoginState: (state) => {
      state.loginLoading = false;
      state.loginError = null;
    },
  },

  extraReducers: (builder) => {
    // Signup cases
    builder
      .addCase(signupUser.pending, (state) => {
        state.signupLoading = true;
        state.signupError = null;
        state.signupSuccess = false;
        state.loading = true;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.signupLoading = false;
        state.signupSuccess = true;
        state.loading = false;
        state.message = action.payload.message || "Registration successful!";

        // Auto-login after signup if token is provided
        if (action.payload.token) {
          state.role = action.payload.user?.role || "";
          state.user = action.payload.user || null;
          state.token = action.payload.token;
          state.isAuthenticated = true;

          localStorage.setItem("role", state.role);
          localStorage.setItem("user", JSON.stringify(state.user));
          localStorage.setItem("token", state.token);
        }
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.signupLoading = false;
        state.signupError = action.payload;
        state.loading = false;
        state.error = action.payload;
      })

      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.loginError = null;
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.loading = false;
        state.message = action.payload.message || "Login successful!";

        // Set user data
        state.role = action.payload.user?.role || "";
        state.user = action.payload.user || null;
        state.token = action.payload.token || "";
        state.isAuthenticated = true;

        // Store in localStorage
        localStorage.setItem("role", state.role);
        localStorage.setItem("user", JSON.stringify(state.user));
        localStorage.setItem("token", state.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;
        state.loginError = action.payload;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.role = "";
        state.user = null;
        state.token = "";
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.signupSuccess = false;
        state.loginError = null;
        state.signupError = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(changePassword.pending, (state) => {
        state.changePasswordLoading = true;
        state.changePasswordError = null;
        state.changePasswordSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.changePasswordLoading = false;
        state.changePasswordSuccess = true;
        state.message =
          action.payload.message || "Password updated successfully";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changePasswordLoading = false;
        state.changePasswordError = action.payload;
        state.error = action.payload;
      });
  },
});

export const {
  setUserLogin,
  setUserLogout,
  clearAuthError,
  clearSignupState,
  clearLoginState,
} = authSlice.actions;

export default authSlice.reducer;

// slices/authSlice.js - Add these actions if not exist
