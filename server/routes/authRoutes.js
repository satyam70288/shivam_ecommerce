const {
  signup,
  login,
  adminSignup,
  adminLogin,
  resetPasword,
  forgotPassword,
} = require("../controllers/authController");
const router = require("express").Router();
const rateLimit = require("express-rate-limit");

// 🔹 Login-specific limiter (extra strict)
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { message: "Too many login attempts, try again later." },
});

// 🔹 Signup / Forgot password limiter (optional)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { message: "Too many requests, try again later." },
});

// Routes with limiter
router.post("/signup", authLimiter, signup);
router.post("/login", loginLimiter, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPasword);

router.post("/admin-signup", authLimiter, adminSignup);
router.post("/admin-login", loginLimiter, adminLogin);

module.exports = router;
