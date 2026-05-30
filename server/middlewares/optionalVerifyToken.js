const jwt = require("jsonwebtoken");

/** Sets req.role when a valid token is present; does not block guests */
const optionalVerifyToken = (req, res, next) => {
  const token =
    req.cookies?.token || req.header("Authorization")?.split(" ")[1];

  if (!token) return next();

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      req.id = decoded._id || decoded.id;
      req.role = decoded.role;
    }
    next();
  });
};

module.exports = optionalVerifyToken;
