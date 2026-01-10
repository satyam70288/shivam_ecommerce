import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const fetchStates = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/location/states`);

    // safety check
    if (!res.data?.success) {
      throw new Error("Failed to fetch states");
    }
    return res.data.data; // states array
  } catch (error) {
    console.error("Fetch states error:", error);

    throw (
      error.response?.data?.message ||
      error.message ||
      "Something went wrong while fetching states"
    );
  }
};
