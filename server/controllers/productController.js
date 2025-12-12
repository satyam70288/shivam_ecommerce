const { ROLES } = require("../utils/constants");
const Product = require("../models/Product");
const cloudinary = require("../utils/cloudinary");
const Category = require("../models/Category");
const { default: mongoose } = require("mongoose");

const createProduct = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const {
      name,
      description,
      category,
      productType,
      price,
      stock,
      discount,
      offerTitle,
      offerDescription,
      offerValidFrom,
      offerValidTill,
      colors,
      sizes,
      variants,
    } = req.body;

    if (!name || !description || !category || !productType) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // ------------------------------
    // PRODUCT TYPE: SIMPLE
    // ------------------------------
    if (productType === "simple") {
      if (!price || !stock) {
        return res.status(400).json({
          success: false,
          message: "Price and stock are required for simple products",
        });
      }
      console.log(req.files, "filll");
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one product image required",
        });
      }

      // Upload simple images
      const uploadedImages = [];

      for (const file of req.files) {
        const result = await cloudinaryUploadBuffer(file.buffer);
        uploadedImages.push({ url: result.secure_url, id: result.public_id });
      }

      const product = new Product({
        productType,
        name,
        description,
        category,
        price,
        stock,
        images: uploadedImages,
        discount: discount || 0,
        offerTitle,
        offerDescription,
        offerValidFrom: offerValidFrom ? new Date(offerValidFrom) : null,
        offerValidTill: offerValidTill ? new Date(offerValidTill) : null,
      });

      await product.save();

      return res.status(201).json({
        success: true,
        message: "Simple product created",
        data: product,
      });
    }

    return res
      .status(400)
      .json({ success: false, message: "Invalid product type" });
  } catch (error) {
    console.error("PRODUCT ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProductsforadmin = async (req, res) => {
  console.log("inside");

  try {
    let { page, limit, category, price, search, sort } = req.query;
    console.log("pppp", page, limit, category, price, search, sort);

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const query = {};

    // CATEGORY FILTER (Slug + ID)
    if (category && category.toLowerCase() !== "all") {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = new mongoose.Types.ObjectId(category);
      } else {
        const catDoc = await Category.findOne({
          slug: category.trim().toLowerCase(),
        });

        if (!catDoc) {
          return res.status(404).json({
            success: false,
            message: "Category not found ",
          });
        }

        query.category = catDoc._id;
      }
    }

    // SEARCH FILTER
    if (search && search.trim() !== "") {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    // PRICE FILTER
    if (price && !isNaN(price)) {
      query.price = { $lte: Number(price) };
    }

    // SORTING
    let sortBy = { createdAt: -1 };
    if (sort === "priceLowToHigh") sortBy = { price: 1 };
    if (sort === "priceHighToLow") sortBy = { price: -1 };

    // AGGREGATION PIPELINE
    const pipeline = [
      { $match: query },
      {
        $facet: {
          products: [
            { $sort: sortBy },
            { $skip: (page - 1) * limit },
            { $limit: limit },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await Product.aggregate(pipeline);

    const products = result[0].products;
    const totalProducts = result[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Get Products Admin Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Utility function
async function cloudinaryUploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

const updateProduct = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (data.sizes && typeof data.sizes === "string") {
      try {
        data.sizes = JSON.parse(data.sizes);
      } catch {
        // keep as is if parsing fails
      }
    }

    if (data.discount) data.discount = Number(data.discount);

    if (data.offerValidFrom)
      data.offerValidFrom = new Date(data.offerValidFrom); // Add this
    if (data.offerValidTill)
      data.offerValidTill = new Date(data.offerValidTill);

    const product = await Product.findByIdAndUpdate(id, data, { new: true });

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
const deleteProduct = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    let { page, limit, category, price, search, sort } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 9;

    // Base query
    const query = { blacklisted: false };

    // Filters
    if (category && category.toLowerCase() !== "all")
      query.category = category.trim();
    if (search && search.trim() !== "")
      query.name = { $regex: search.trim(), $options: "i" };
    if (price && !isNaN(price)) query.price = { $lte: Number(price) };

    // Sorting
    let sortBy = { createdAt: -1 }; // default
    if (sort === "priceLowToHigh") sortBy = { price: 1 };
    if (sort === "priceHighToLow") sortBy = { price: -1 };

    const now = new Date();

    // Aggregation pipeline
    const pipeline = [
      { $match: query },
      {
        $facet: {
          products: [
            { $sort: sortBy },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                name: 1,
                price: 1,
                rating: 1,
                description: 1,
                sizes: 1,
                discount: 1,
                offerValidTill: 1,
                variants: 1,
                discountedPrice: {
                  $round: [
                    {
                      $cond: [
                        {
                          $and: [
                            { $gt: ["$discount", 0] },
                            { $gt: ["$offerValidTill", now] },
                          ],
                        },
                        {
                          $multiply: [
                            "$price",
                            { $subtract: [1, { $divide: ["$discount", 100] }] },
                          ],
                        },
                        "$price",
                      ],
                    },
                    1,
                  ],
                },
                image: { $arrayElemAt: ["$images", 0] },
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await Product.aggregate(pipeline);
    const products = result[0].products;
    const totalProducts = result[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
      message: "Products fetched",
      data: products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProductByName = async (req, res) => {
  const { name } = req.params;

  try {
    const product = await Product.findOne({
      name: { $regex: new RegExp(name, "i") },
    }).populate("reviews");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Call the method on the product instance
    const discountedPrice = product.getDiscountedPrice();

    // Convert product to plain object to add discountedPrice
    const productObj = product.toObject();
    productObj.discountedPrice = discountedPrice;
    console.log(productObj, "ygyfgh");
    return res.status(200).json({
      success: true,
      message: "Product found",
      data: productObj,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const blacklistProduct = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  const { id } = req.params;

  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { blacklisted: true },
      { new: true }
    );

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    return res.status(200).json({
      success: true,
      message: `The product ${product.name} has been blacklisted`,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const removeFromBlacklist = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  const { id } = req.params;

  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { blacklisted: false },
      { new: true }
    );

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    return res.status(200).json({
      success: true,
      message: `The product ${product.name} has been removed from blacklisted`,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const discountedPrice = product.getDiscountedPrice();

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: {
        product,
        discountedPrice,
        isOfferActive: product.isOfferActive(),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const categoryParam = req.params.category?.trim().toLowerCase();

    if (!categoryParam) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    let categoryDoc;

    // Case 1: Category is ObjectId
    if (mongoose.Types.ObjectId.isValid(categoryParam)) {
      categoryDoc = await Category.findById(categoryParam);
    } else {
      // Case 2: Category is slug
      categoryDoc = await Category.findOne({ slug: categoryParam });
    }

    if (!categoryDoc) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const products = await Product.aggregate([
      { $match: { category: categoryDoc._id } },
      {
        $addFields: {
          image: { $arrayElemAt: ["$images", 0] },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      category: categoryDoc.name,
      total: products.length,
      data: products,
    });
  } catch (error) {
    console.error("GetProductsByCategory Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
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
};
