const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token =
    req.cookies?.token || req.header("Authorization")?.split(" ")[1];

  console.log("TOKEN:", token);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized request (no token)",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("JWT VERIFY ERROR:", err.message);
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    console.log("DECODED TOKEN:", decoded);

    // 🔥 THIS IS THE FIX
    req.id = decoded._id || decoded.id;
    req.role = decoded.role;

    if (!req.id) {
      console.log("❌ USER ID MISSING IN TOKEN");
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    console.log("✅ AUTH USER ID:", req.id);
    next();
  });
};

module.exports = verifyToken;
