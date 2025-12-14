const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");

const {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} = require("../controllers/addressController");

// 🔒 All routes protected
// router.use(verifyToken);

// ➕ Add address
router.post("/addresses",verifyToken, createAddress);

// 📥 Get all addresses
router.get("/addresses",verifyToken, getAddresses);

// ✏️ Update address
router.put("/:addressId",verifyToken, updateAddress);

// ❌ Delete address
router.delete("/:addressId",verifyToken, deleteAddress);

module.exports = router;
