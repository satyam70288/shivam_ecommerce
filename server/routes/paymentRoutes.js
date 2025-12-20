const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/paymentController");
const verifyToken = require("../middlewares/verifyToken");

// 🔹 Payment-specific rate limiter
const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 20,
  message: { message: "Too many payment requests, try again later." },
});

// Routes with limiter applied
router.post("/generate-payment", verifyToken, paymentLimiter, createRazorpayOrder);
router.post("/verify-payment", verifyToken, paymentLimiter, verifyRazorpayPayment);

module.exports = router;
