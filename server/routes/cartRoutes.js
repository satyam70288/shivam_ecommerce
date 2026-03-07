var express = require("express");
var router = express.Router();

var cartController = require("../controllers/cartController");
const verifyToken = require("../middlewares/verifyToken");

// Add product to cart
// router.use(verifyToken);
router.post("/add", verifyToken, cartController.addToCart);

// Get user's cart
router.get("/cart",verifyToken, cartController.getCart);

router.post("/cart/remove",verifyToken, cartController.removeFromCart);

router.post("/cart/decrease",verifyToken, cartController.decreaseQuantity);

router.post("/cart/increase",verifyToken, cartController.increaseQuantity);

// // Clear all items from user's cart
// router.delete("/:userId/clear", cartController.clearCart);

module.exports = router;
