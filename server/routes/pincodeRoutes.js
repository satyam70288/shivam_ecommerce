const { addPincodes, getPincode } = require("../controllers/pincodeController");
const { getProductsByCategory } = require("../controllers/productController");
const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");

router.post("/add-pincodes", verifyToken, addPincodes);

router.get("/get-pincode/:pincode", getPincode);

router.get("/products/by-category/:category", getProductsByCategory);
module.exports = router;
