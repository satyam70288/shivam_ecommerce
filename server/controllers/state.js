// controllers/locationController.js
const State = require("../models/State");

exports.getStates = async (req, res) => {
  try {
    const states = await State.find({ isActive: true })
      .select("name code")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: states
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch states"
    });
  }
};
