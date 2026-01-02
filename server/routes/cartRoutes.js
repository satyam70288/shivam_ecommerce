var express = require("express");
var router = express.Router();

var cartController = require("../controllers/cartController");
const verifyToken = require("../middlewares/verifyToken");

// Add product to cart
// router.use(verifyToken);
router.post("/add", cartController.addToCart);

// Get user's cart
router.get("/cart/:userId", cartController.getCart);

router.post("/cart/remove", cartController.removeFromCart);

router.post("/cart/decrease", cartController.decreaseQuantity);

router.post("/cart/increase", cartController.increaseQuantity);

// // Clear all items from user's cart
// router.delete("/:userId/clear", cartController.clearCart);

module.exports = router;
