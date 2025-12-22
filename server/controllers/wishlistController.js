// controllers/wishlistController.js
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Add to wishlist
// backend/controllers/wishlistController.js

// ✅ Single toggle endpoint
exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({
      user: userId,
      product: productId
    });

    let action, isInWishlist;

    if (existingItem) {
      // Remove from wishlist
      await Wishlist.findByIdAndDelete(existingItem._id);
      action = 'removed';
      isInWishlist = false;
      
      return res.status(200).json({
        success: true,
        message: "Removed from wishlist",
        action,
        isInWishlist
      });
    } else {
      // Add to wishlist
      await Wishlist.create({
        user: userId,
        product: productId
      });
      action = 'added';
      isInWishlist = true;
      
      return res.status(200).json({
        success: true,
        message: "Added to wishlist",
        action,
        isInWishlist,
        product: { // Optional: product data भेजें
          _id: product._id,
          name: product.name,
          price: product.price,
          images: product.images,
          // ... other fields
        }
      });
    }
  } catch (error) {
    console.error("Toggle wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};




// Get user's wishlist
// controllers/wishlist.controller.js

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.id;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    // 1️⃣ Fetch wishlist + populate product
    const [wishlistItems, totalItems] = await Promise.all([
      Wishlist.find({ user: userId })
        .populate({
          path: "product",
          select:
            "name price rating discount offerValidTill images variants stock",
        })
        .sort({ addedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // ✅ important (performance + easy transform)
      Wishlist.countDocuments({ user: userId }),
    ]);

    // 2️⃣ Filter deleted products
    const validItems = wishlistItems.filter(
      (item) => item.product
    );

    // 3️⃣ Normalize response (ONLY ONE IMAGE)
    const data = validItems.map((item) => {
      const product = item.product;

      const image =
        product.images?.[0] ||
        product.variants?.[0]?.images?.[0] ||
        null;

      return {
        _id: product._id,
        name: product.name,
        price: product.price,
        rating: product.rating,
        discount: product.discount || 0,
        offerValidTill: product.offerValidTill || null,
        stock: product.stock,
        image: image
          ? {
              url: image.url || null,
              id: image.id || null,
            }
          : null,
      };
    });

    const totalPages = Math.ceil(totalItems / limit);

    // 4️⃣ Send response
    return res.status(200).json({
      success: true,
      message: "Wishlist fetched",
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching wishlist",
    });
  }
};


// Check if product is in wishlist
exports.checkWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const exists = await Wishlist.findOne({
      user: userId,
      product: productId
    });

    res.status(200).json({
      success: true,
      isInWishlist: !!exists
    });
  } catch (error) {
    console.error("Check wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};