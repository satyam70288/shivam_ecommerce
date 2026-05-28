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
  getSimilarProducts,
} = require("../controllers/productController");
const verifyToken = require("../middlewares/verifyToken");
const upload = require("../middlewares/multer");
console.log("📦 Product routes loaded");

router.get("/get-products", getProducts);

router.get("/get-products-admin", getProductsforadmin);

router.get("/get-product-by-name/:name", getProductByName);

router.post(
  "/create-product",
  verifyToken,
  upload.array("images", 15),
  createProduct
);

router.put(
  "/update-product/:id",
  verifyToken,
  upload.array("images", 15),
  updateProduct
);

router.delete("/delete-product/:id", verifyToken, deleteProduct);

router.put("/blacklist-product/:id", verifyToken, blacklistProduct);

router.put("/remove-from-blacklist/:id", verifyToken, removeFromBlacklist);

router.get("/product/:id", getProductById); // ALWAYS LAST
router.get("/admin/products/:id", getProductById); // ALWAYS LAST
router.get('/similar/:productId', getSimilarProducts);
module.exports = router;
