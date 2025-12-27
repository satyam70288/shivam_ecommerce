// services/orderService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const orderService = {
  getAllOrders: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}/get-all-orders`, {
        params: { page, limit },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateOrderStatus: async (orderId, data) => {
    try {
      const response = await axios.put(
        `${API_URL}/update-order-status/${orderId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default orderService;