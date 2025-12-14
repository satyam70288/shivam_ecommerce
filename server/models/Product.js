const mongoose = require("mongoose");
const Review = require("./Review");

const variantSchema = new mongoose.Schema(
  {
    color: String,
    size: String,
    stock: { type: Number, default: 0 },
    price: Number,
    images: [{ url: String, id: String }]
  },
  { _id: true }
);

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

    // VARIANTS (bags, stationery, cosmetics, toys that have colors/sizes)
    variants: [variantSchema],

    description: { type: String, required: true },

    // SIMPLE PRODUCT IMAGES
    images: [{ url: String, id: String }],

    // FILTER FIELDS
    colors: { type: [String], default: [] },

    sizes: {
      type: [String],
      enum: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"]
    },

    material: {
      type: String,
      enum: ["Plastic", "Wood", "Metal", "Cotton", "Synthetic", "Alloy", "Paper", "Other"],
      default: "Other"
    },

    ageGroup: {
      type: [String],
      enum: ["0-3", "3-6", "6-9", "9-12", "12+"],
      default: []
    },

    brand: { type: String, default: "Generic" },

    // RATINGS
    rating: { type: Number, default: 5 },

    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],

    blacklisted: { type: Boolean, default: false },

    // CATEGORY
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    // DISCOUNT / OFFERS
    discount: { type: Number, default: 0, min: 0, max: 100 },

    offerTitle: String,
    offerDescription: String,
    offerValidFrom: Date,
    offerValidTill: Date,

    // INVENTORY FLAGS
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },

    // SEARCH ENGINE FIELDS
    slug: { type: String, unique: true },
    tags: { type: [String], default: [] },
    keywords: { type: [String], default: [] }
  },
  { timestamps: true }
);

// ⭐ Auto Rating Calculation
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

// ⭐ Returns if offer is active
productSchema.methods.isOfferActive = function () {
  if (!this.offerValidFrom || !this.offerValidTill) return false;

  const now = new Date();
  return now >= this.offerValidFrom && now <= this.offerValidTill;
};

// ⭐ Discounted Price
productSchema.methods.getDiscountedPrice = function () {
  if (this.discount > 0 && this.isOfferActive()) {
    return Math.round(this.price * (1 - this.discount / 100));
  }
  return this.price;
};

module.exports = mongoose.model("Product", productSchema);
