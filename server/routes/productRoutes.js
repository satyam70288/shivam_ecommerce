const router = require("express").Router();
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductByName,
  blacklistProduct,
  removeFromBlacklist,
  getProductById,
  getProductsforadmin,
  getProductsByCategory,
} = require("../controllers/productController");
const verifyToken = require("../middlewares/verifyToken");
const upload = require("../middlewares/multer");
console.log("📦 Product routes loaded");

// Category — MUST BE BEFORE ANYTHING WITH :id
router.get("/products/by-category/:category", (req, res) => {
  console.log("🔥 CATEGORY ROUTE HIT:", req.params.category);
  res.send("Category route working");
});


router.get("/get-products", getProducts);

router.get("/get-products-admin", getProductsforadmin);

router.get("/get-product-by-name/:name", getProductByName);

router.post(
  "/create-product",
  verifyToken,
  upload.array("images", 15),
  createProduct
);

router.put("/update-product/:id", verifyToken, updateProduct);

router.delete("/delete-product/:id", verifyToken, deleteProduct);

router.put("/blacklist-product/:id", verifyToken, blacklistProduct);

router.put("/remove-from-blacklist/:id", verifyToken, removeFromBlacklist);

router.get("/product/:id", getProductById); // ALWAYS LAST
router.get("/admin/products/:id", getProductById); // ALWAYS LAST

module.exports = router;
