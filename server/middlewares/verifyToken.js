const jwt = require("jsonwebtoken");

const isDev = process.env.NODE_ENV !== "production";

const verifyToken = (req, res, next) => {
  const token =
    req.cookies?.token || req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized request (no token)",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (isDev) {
        console.warn("JWT verify failed:", err.message);
      }
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.id = decoded._id || decoded.id;
    req.role = decoded.role;

    if (!req.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    next();
  });
};

module.exports = verifyToken;
