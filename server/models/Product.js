const mongoose = require("mongoose");
const Review = require("./Review");

const variantSchema = new mongoose.Schema({
  color: { type: String },
  size: { type: String },
  stock: { type: Number, default: 0 },
  price: { type: Number },
  images: [{ url: String, id: String }]
}, { _id: true });

const productSchema = new mongoose.Schema(
  {
    // SIMPLE or VARIANT PRODUCT
    productType: {
      type: String,
      enum: ["simple", "variant"],
      default: "simple"
    },

    name: { type: String, required: true },

    // SIMPLE PRODUCT FIELDS
    price: Number,
    stock: Number,

    // VARIANT PRODUCT FIELDS (clothes only)
    variants: [variantSchema],

    description: { type: String, required: true },

    // SIMPLE PRODUCT IMAGES
    images: [{ url: String, id: String }],

    colors: { type: [String], default: [] },

    sizes: {
      type: [String],
      enum: ["XS", "S", "M", "L", "XL", "XXL"],
      required: false
    },

    rating: { type: Number, default: 5 },

    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],

    blacklisted: { type: Boolean, default: false },

    // YOUR CATEGORY SYSTEM
  category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    offerTitle: String,
    offerDescription: String,
    offerValidFrom: Date,
    offerValidTill: Date
  },
  { timestamps: true }
);

// Rating Calculation
productSchema.methods.calculateRating = async function () {
  const reviews = await Review.find({ productId: this._id });
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating = totalRating / reviews.length;
  } else {
    this.rating = 5;
  }
  await this.save();
};

// Offer Active Check
productSchema.methods.isOfferActive = function () {
  if (!this.offerValidFrom || !this.offerValidTill) return false;
  const now = new Date();
  return now >= this.offerValidFrom && now <= this.offerValidTill;
};

// Discount Price
productSchema.methods.getDiscountedPrice = function () {
  const originalPrice = this.price;
  if (this.discount > 0 && this.isOfferActive()) {
    return Math.round(originalPrice * (1 - this.discount / 100));
  }
  return originalPrice;
};

module.exports = mongoose.model("Product", productSchema);
