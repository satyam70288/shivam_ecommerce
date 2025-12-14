const Address = require("../models/address");

/* ============================
   ➕ ADD NEW ADDRESS
============================ */
exports.createAddress = async (req, res) => {
  try {
    const userId = req.id;

    const {
      name,
      phone,
      email,
      address_line1,
      address_line2,
      city,
      state,
      country,
      pincode,
      landmark,
      address_type,
      isDefault,
    } = req.body;

    // 🔒 basic validation
    if (!name || !phone || !address_line1 || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Required address fields missing",
      });
    }

    // 🔁 if setting as default, unset previous default
    if (isDefault) {
      await Address.updateMany(
        { userId },
        { $set: { isDefault: false } }
      );
    }

    const address = await Address.create({
      userId,
      name,
      phone,
      email,
      address_line1,
      address_line2,
      city,
      state,
      country,
      pincode,
      landmark,
      address_type,
      isDefault,
    });

    res.status(201).json({
      success: true,
      data: address,
    });
  } catch (error) {
    console.error("Create Address Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add address",
    });
  }
};

/* ============================
   📥 GET ALL USER ADDRESSES
============================ */
exports.getAddresses = async (req, res) => {
  try {
    const userId = req.id;

    const addresses = await Address.find({ userId }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error("Get Addresses Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
    });
  }
};

/* ============================
   ✏️ UPDATE ADDRESS
============================ */
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.id;
    const { addressId } = req.params;

    if (!addressId) {
      return res.status(400).json({ message: "Address ID required" });
    }

    // if setting default → unset old default
    if (req.body.isDefault) {
      await Address.updateMany(
        { userId },
        { $set: { isDefault: false } }
      );
    }

    const updated = await Address.findOneAndUpdate(
      { _id: addressId, userId },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Update Address Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
};

/* ============================
   ❌ DELETE ADDRESS
============================ */
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.id;
    const { addressId } = req.params;

    const deleted = await Address.findOneAndDelete({
      _id: addressId,
      userId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted",
    });
  } catch (error) {
    console.error("Delete Address Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
};
