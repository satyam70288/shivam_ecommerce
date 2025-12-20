// utils/shiprocketAuth.js
const axios = require("axios");

let shiprocketToken = null;
let tokenExpiry = null;

const getShiprocketToken = async () => {
  if (shiprocketToken && tokenExpiry && new Date() < tokenExpiry) {
    return shiprocketToken;
  }

  try {
    const res = await axios.post("https://apiv2.shiprocket.in/v1/external/auth/login", {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    });

    shiprocketToken = res.data.token;
    tokenExpiry = new Date(new Date().getTime() + 50 * 60 * 1000); // 50 min expiry
    return shiprocketToken;
  } catch (err) {
    console.error("Shiprocket Auth Error:", err.response?.data || err.message);
    throw new Error("Failed to authenticate with Shiprocket");
  }
};

module.exports = getShiprocketToken;
