const { ROLES } = require("../utils/constants");
const Product = require("../models/Product");
const cloudinary = require("../utils/cloudinary");
const Category = require("../models/Category");
const { default: mongoose } = require("mongoose");
const ProductCapabilities = require("../models/ProductCapabilities");
const PromiseMaster = require("../models/PromiseMaster");
const { getProductByIdService } = require("../service/productDService");

const createProduct = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  const toBool = (v) => v === "true" || v === true;

  try {
    const {
      name,
      description,
      category,
      price,
      stock,
      sku,

      discount,
      offerTitle,
      offerDescription,
      offerValidFrom,
      offerValidTill,

      materials,
      features,
      specifications,
      dimensions,
      brand,
      handlingTime,
      freeShipping,

      ageGroup,
      tags,
      keywords,

      isFeatured,
      isNewArrival,
      isBestSeller,

      canDispatchFast,
      returnEligible,
      codAvailable,
      qualityVerified,
    } = req.body;

    /* ================= BASIC VALIDATION ================= */
    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and category are required",
      });
    }

    if (!price || !stock || !sku) {
      return res.status(400).json({
        success: false,
        message: "Price, stock, and SKU are required",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    /* ================= SAFE PARSING ================= */
    const parseJSON = (v, fallback) => {
      try {
        return v ? JSON.parse(v) : fallback;
      } catch {
        return fallback;
      }
    };

    const parsedFeatures = parseJSON(features, []);
    if (parsedFeatures.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one feature is required",
      });
    }

    /* ================= SLUG ================= */
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    /* ================= IMAGE UPLOAD ================= */
    const images = [];
    for (const file of req.files) {
      const uploadRes = await cloudinaryUploadBuffer(file.buffer);
      images.push({
        url: uploadRes.secure_url,
        id: uploadRes.public_id,
      });
    }

    /* ================= CREATE PRODUCT ================= */
    const product = new Product({
      productType: "simple",
      name,
      description,
      category,
      slug,

      price: Number(price),
      stock: Number(stock),
      sku,
      images,

      materials: parseJSON(materials, []),
      features: parsedFeatures,
      specifications: parseJSON(specifications, {}),
      dimensions: parseJSON(dimensions, null),

      brand: brand || "Generic",
      handlingTime: handlingTime ? Number(handlingTime) : 1,
      freeShipping: toBool(freeShipping),

      ageGroup: parseJSON(ageGroup, []),
      tags: parseJSON(tags, []),
      keywords: parseJSON(keywords, []),

      isFeatured: toBool(isFeatured),
      isNewArrival: toBool(isNewArrival),
      isBestSeller: toBool(isBestSeller),

      discount: Number(discount) || 0,
      offerTitle: offerTitle || null,
      offerDescription: offerDescription || null,
      offerValidFrom: offerValidFrom ? new Date(offerValidFrom) : null,
      offerValidTill: offerValidTill ? new Date(offerValidTill) : null,
    });

    await product.save();

    await ProductCapabilities.create({
      productId: product._id,
      canDispatchFast: toBool(canDispatchFast),
      returnEligible: toBool(returnEligible),
      codAvailable: toBool(codAvailable),
      qualityVerified: toBool(qualityVerified),
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("PRODUCT CREATE ERROR:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "SKU already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating product",
    });
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

      // 🔥 POPULATE CATEGORY
      {
        $lookup: {
          from: "categories", // collection name
          localField: "category", // Product.category
          foreignField: "_id", // Category._id
          as: "category",
        },
      },

      // category array → object
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },

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
 console.log(req.body)
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
    let { page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 12;

    const query = { blacklisted: false };
    const totalProducts = await Product.countDocuments(query);
    const skip = (page - 1) * limit;

    // Get products
    const products = await Product.find(query)
      .select("_id name price rating discount offerValidFrom offerValidTill variants images colors brand stock reviewCount description")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
 console.log("products",products)
    // Use the method to get product card data
    const processedProducts = products.map((product) => {
      const productData = product.getProductCardData();
      
      // Add extra calculations
      const savings = productData.price - productData.discountedPrice;
      const discountPercentage = productData.discount || Math.round((savings / productData.price) * 100);
      
      return {
        ...productData,
        savings: savings > 0 ? savings : 0,
        discountPercentage: discountPercentage
      };
    });

    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
      message: "Products fetched",
      data: processedProducts,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching products",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await getProductByIdService(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product found",
      data: result.product,
      promises: result.promises,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
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

// const getProductById = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id).populate(
//       "category",
//       "name slug"
//     );

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     const finalPrice = product.getDiscountedPrice();

//     return res.status(200).json({
//       success: true,
//       message: "Product fetched successfully",
//       data: {
//         ...product.toObject(), // 👈 flatten
//         finalPrice, // 👈 normalized
//         isOfferActive: product.isOfferActive(),
//       },
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

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

    // Check: ID or slug
    if (mongoose.Types.ObjectId.isValid(categoryParam)) {
      categoryDoc = await Category.findById(categoryParam);
    } else {
      categoryDoc = await Category.findOne({ slug: categoryParam });
    }

    if (!categoryDoc) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    /* ------------------------------
       STEP 1: Prepare Filters
    ------------------------------ */
    const query = { category: categoryDoc._id };

    // PRICE RANGE FILTER
    if (req.query.priceRange) {
      const ranges = req.query.priceRange.split(",");

      const priceConditions = ranges.map((r) => {
        const [min, max] = r.split("-").map(Number);
        return max
          ? { price: { $gte: min, $lte: max } }
          : { price: { $gte: min } }; // 2000+ case
      });

      query.$or = priceConditions;
    }

    // DISCOUNT FILTER
    if (req.query.discount) {
      query.discount = { $gte: Number(req.query.discount) };
    }

    // RATINGS FILTER
    if (req.query.rating) {
      query.rating = { $gte: Number(req.query.rating) };
    }

    // COLOR FILTER
    if (req.query.color) {
      query.colors = { $in: req.query.color.split(",") };
    }

    // AGE GROUP FILTER
    if (req.query.ageGroup) {
      query.ageGroup = { $in: req.query.ageGroup.split(",") };
    }

    // MATERIAL FILTER
    if (req.query.material) {
      query.material = { $in: req.query.material.split(",") };
    }

    // AVAILABILITY FILTER
    if (req.query.availability) {
      if (req.query.availability === "In Stock") {
        query.stock = { $gt: 0 };
      } else {
        query.stock = 0;
      }
    }

    /* ------------------------------
       STEP 2: Run Query
    ------------------------------ */
    const products = await Product.aggregate([
      { $match: query },
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
  // getProductById
};
