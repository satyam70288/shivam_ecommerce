const { ROLES } = require("../utils/constants");
const Review = require("../models/Review");
const Product = require("../models/Product");
const cloudinary = require("../utils/cloudinary");

/* ======================================================
   CREATE REVIEW
====================================================== */
const createReview = async (req, res) => {
  if (req.role !== ROLES.user) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  console.log(req.body, "body");
  console.log(req.files, "files");

  try {
    const userId = req.id;
    const { productId, review, rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const alreadyReviewed = await Review.findOne({ productId, userId });
    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const uploadedImages = [];
    
    // FIX: Check if files exist and handle buffer
    if (req.files && req.files.length > 0) {
      console.log("Processing files:", req.files.length);
      
      for (const file of req.files) {
        try {
          // For memory storage, use buffer instead of path
          const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "review" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            
            // Write buffer to stream
            stream.end(file.buffer);
          });
          
          uploadedImages.push({
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
          });
          
          console.log("Image uploaded successfully:", uploadResult.secure_url);
        } catch (uploadError) {
          console.error("Error uploading image to cloudinary:", uploadError);
          // Continue with other images even if one fails
        }
      }
    } else {
      console.log("No files received in req.files");
    }

    const newReview = await Review.create({
      productId,
      userId,
      review,
      rating,
      images: uploadedImages,
    });

    product.reviews.push(newReview._id);
    await product.save();

    // Calculate average rating
    await product.calculateRating();

    return res.status(201).json({
      success: true,
      message: "Thanks for the review",
      data: newReview,
    });
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/* ======================================================
   UPDATE REVIEW
====================================================== */
const updateReview = async (req, res) => {
  if (req.role !== ROLES.user) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const { id } = req.params;
    const { updatedReview, rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const reviewDoc = await Review.findById(id);
    if (!reviewDoc) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    reviewDoc.review = updatedReview;
    reviewDoc.rating = rating;
    await reviewDoc.save();

    const product = await Product.findById(reviewDoc.productId);
    if (product) {
      await product.calculateRating();
    }

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: reviewDoc,
    });
  } catch (error) {
    console.error("Update review error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   DELETE REVIEW
====================================================== */
const deleteReview = async (req, res) => {
  if (req.role !== ROLES.user) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.images?.length) {
      for (const img of review.images) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }

    const productId = review.productId;

    await Review.findByIdAndDelete(id);
    await Product.findByIdAndUpdate(productId, {
      $pull: { reviews: review._id },
    });

    const product = await Product.findById(productId);
    if (product) {
      await product.calculateRating();
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   REPLY TO REVIEW
====================================================== */
const replyReview = async (req, res) => {
  if (req.role !== ROLES.user) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const userId = req.id;
    const { id } = req.params;
    const { review } = req.body;

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { $push: { replies: { userId, review } } },
      { new: true }
    )
      .populate("userId", "name")
      .populate("replies.userId", "name");

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reply added successfully",
      data: updatedReview,
    });
  } catch (error) {
    console.error("Reply review error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   GET REVIEWS BY PRODUCT
====================================================== */
const getReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await Review.find({ productId: id })
      .populate("userId", "name")
      .populate("replies.userId", "name");

    if (!reviews.length) {
      return res.status(404).json({
        success: false,
        message: "No reviews found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reviews fetched",
      data: reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  replyReview,
  getReviews,
};
