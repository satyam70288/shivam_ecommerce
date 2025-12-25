const { ROLES } = require("../utils/constants");
const Review = require("../models/Review");
const Product = require("../models/Product");
const cloudinary = require("../utils/cloudinary");

// ⭐ COMMON RATING ADJUST FUNCTION
async function adjustProductRating({
  productId,
  type, // "CREATE" | "UPDATE" | "DELETE"
  newRating = 0, // CREATE / UPDATE
  oldRating = 0, // UPDATE / DELETE
}) {
  const product = await Product.findById(productId);
  if (!product) return;


  const count = product.reviewCount || 0;
  const avg = product.rating || 0;

  if (type === "CREATE") {
    product.rating = (avg * count + newRating) / (count + 1);
    product.reviewCount = count + 1;
  }

  if (type === "UPDATE") {
    product.rating = (avg * count - oldRating + newRating) / count;
  }

  if (type === "DELETE") {
    if (count > 1) {
      product.rating = (avg * count - oldRating) / (count - 1);
      product.reviewCount = count - 1;
    } else {
      product.rating = 0;
      product.reviewCount = 0;
    }
  }

  product.rating = Number(product.rating.toFixed(1));
  await product.save();
}

const createReview = async (req, res) => {
  if (req.role !== ROLES.user) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  const userId = req.id;

  try {
    const { productId, review, rating } = req.body;

    // 1️⃣ validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // 2️⃣ check product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 3️⃣ prevent duplicate review
    const alreadyReviewed = await Review.findOne({ productId, userId });
    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // 4️⃣ upload images
    const uploadedImages = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "review",
        });
        uploadedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    // 5️⃣ create review
    const newReview = await Review.create({
      productId,
      review,
      userId,
      rating,
      images: uploadedImages,
    });

    // 6️⃣ link review
    product.reviews.push(newReview._id);
    await product.save();

    // 7️⃣ adjust rating
    await adjustProductRating({
      productId,
      type: "CREATE",
      newRating: rating,
    });

    return res.status(201).json({
      success: true,
      message: "Thanks for the Review",
      data: newReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};


const updateReview = async (req, res) => {
  if (req.role !== ROLES.user) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const { id } = req.params;
    const { updatedReview, rating } = req.body; // ⬅️ Get rating too

    const reviewDoc = await Review.findById(id);
    if (!reviewDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }
    const oldRating = reviewDoc.rating;

    reviewDoc.review = updatedReview;
    reviewDoc.rating = rating;
    await reviewDoc.save();

    // ⭐ adjust rating
    await adjustProductRating({
      productId: reviewDoc.productId,
      type: "UPDATE",
      oldRating,
      newRating: rating,
    });

    return res
      .status(200)
      .json({ success: true, data: review, message: "Review updated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const replyReview = async (req, res) => {
  if (req.role !== ROLES.user) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  const userId = req.id;
  const { id } = req.params;

  try {
    const { review } = req.body;

    let foundReview = await Review.findByIdAndUpdate(
      { _id: id },
      { $push: { replies: { userId, review } } },
      { new: true }
    )
      .populate("replies.userId", "name")
      .populate("userId", "name");

    if (!foundReview) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    return res.status(200).json({
      success: true,
      data: foundReview,
      message: "Reply added successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  if (req.role !== ROLES.user) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const { id } = req.params;

    let review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    let product = await Product.findByIdAndUpdate(review.productId, {
      $pull: { reviews: review._id },
    });

    await product.calculateRating();

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    return res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching reviews for product ID:", id);

    let reviews = await Review.find({ productId: id })
      .populate({
        path: "userId",
        select: "name",
      })
      .populate({
        path: "replies.userId",
        select: "name",
      });

    if (!reviews || reviews.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Reviews not found" });
    }

    return res
      .status(200)
      .json({ success: true, data: reviews, message: "Reviews found" });
  } catch (error) {
    console.error("Error in getReviews:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReview,
  updateReview,
  replyReview,
  deleteReview,
  getReviews,
};
