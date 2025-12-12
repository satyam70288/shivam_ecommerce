const Category = require("../models/Category");

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort("name");

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching categories",
    });
  }
};

const getSingleCategory = async (req, res) => {
  console.log("inside", req.params);
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug is required",
      });
    }

    const category = await Category.findOne({
      slug: slug.toLowerCase(), // normalize slug
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get single category error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the category",
    });
  }
};

// Export all functions as module.exports
module.exports = {
  getAllCategories,
  getSingleCategory,
};
