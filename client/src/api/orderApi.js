import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const orderApi = {
  trackOrder: async (orderId, token) => {
    const response = await axios.get(
      `${API_BASE_URL}/orders/${orderId}/track`,
      { headers: authHeaders(token) }
    );
    const shipment = response.data?.shipment;
    return {
      ...shipment,
      history: shipment?.history || [],
    };
  },

  getShiprocketLabel: async (orderId, token) => {
    const response = await axios.get(
      `${API_BASE_URL}/orders/${orderId}/shiprocket/label`,
      { headers: authHeaders(token) }
    );
    return response.data?.url;
  },

  getShiprocketInvoice: async (orderId, token) => {
    const response = await axios.get(
      `${API_BASE_URL}/orders/${orderId}/shiprocket/invoice`,
      { headers: authHeaders(token) }
    );
    return response.data?.url;
  },

  cancelOrder: async (orderId, token) => {
    const response = await axios.post(
      `${API_BASE_URL}/cancel-order`,
      { orderId },
      { headers: authHeaders(token) }
    );
    return response.data;
  },

  getUserOrders: async (token) => {
    const response = await axios.get(
      `${API_BASE_URL}/get-orders-by-user-id`,
      { headers: authHeaders(token) }
    );
    return response.data.data || [];
  },
};

export default orderApi;
