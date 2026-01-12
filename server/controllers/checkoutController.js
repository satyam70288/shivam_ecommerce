const {calculateOrder } = require("../helper/createOrder");
const Address = require("../models/address");
const mongoose = require("mongoose");

exports.checkoutInit = async (req, res) => {
  try {
    console.log("=== CHECKOUT INIT ===");
    console.log("Query params:", req.query);
    
    // Get user ID properly
    const userId = req.user?.id || req.user?._id || req.id;
    console.log("User ID from auth:", userId);
    
    const { productId, qty, addressId } = req.query;

    // Validate
    if (!addressId) {
      return res.status(400).json({ 
        success: false, 
        message: "Address is required" 
      });
    }

    // ✅ CORRECTED: Use 'userId' field (not 'user')
    const userAddress = await Address.findOne({
      _id: addressId,
      userId: userId  // ❌ Was 'user', should be 'userId'
    });

    console.log("Query result:", userAddress ? "Found" : "Not found");
    
    if (!userAddress) {
      console.log("Address not found. Checking database...");
      
      // Debug: Find address without user filter
      const anyAddress = await Address.findById(addressId);
      console.log("Address exists?", !!anyAddress);
      if (anyAddress) {
        console.log("Address userId field:", anyAddress.userId);
        console.log("Requested userId:", userId);
        console.log("Match?", anyAddress.userId.toString() === userId);
      }
      
      return res.status(403).json({ 
        success: false, 
        message: "Address not found or doesn't belong to you"
      });
    }

    console.log("✅ Address verified:", {
      pincode: userAddress.pincode,
      city: userAddress.city,
      state: userAddress.state
    });

    // Calculate order
    const order = await calculateOrder(
      userId,
      { productId, quantity: qty },
      userAddress
    );

    return res.status(200).json({
      success: true,
      ...order
    });

  } catch (error) {
    console.error("Checkout init error:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || "Checkout failed"
    });
  }
};