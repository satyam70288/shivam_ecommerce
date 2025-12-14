const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/verifyToken");
const { checkoutInit } = require("../controllers/checkoutController");


/**
 * @route   GET /api/checkout/init
 * @desc    Initialize checkout (Cart OR Single Buy Now)
 * @access  Private
 *
 * Cart checkout:
 *   GET /api/checkout/init
 *
 * Buy Now:
 *   GET /api/checkout/init?productId=PRODUCT_ID&qty=2
 */
router.get("/checkout/init", verifyToken, checkoutInit);

module.exports = router;
