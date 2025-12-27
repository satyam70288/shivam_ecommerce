// src/api/orderApi.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const orderApi = {
  // Fetch tracking data for an order
  trackOrder: async (orderId, token) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/orders/track/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.tracking || [];
    } catch (error) {
      console.error("Error fetching tracking data:", error);
      throw new Error("Failed to fetch tracking data");
    }
  },

  // Cancel an order
  cancelOrder: async (orderId, token) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/cancel-order`,
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw new Error("Failed to cancel order");
    }
  },

  // Fetch user orders
  getUserOrders: async (token) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-orders-by-user-id`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw new Error("Failed to fetch orders");
    }
  }
};

export default orderApi;