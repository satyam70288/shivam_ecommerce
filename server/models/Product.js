const mongoose = require("mongoose");
const Review = require("./Review");

const variantSchema = new mongoose.Schema(
  {
    color: String,
    size: String,
    stock: { type: Number, default: 0 },
    price: Number,
    images: [{ url: String, id: String }],
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    // SIMPLE or VARIANT PRODUCT
    productType: {
      type: String,
      enum: ["simple", "variant"],
      default: "simple",
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
      enum: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"],
    },

    features: {
      type: [String],
      default: [],
    },

    specifications: {
      type: Map,
      of: String,
      default: {},
    },

    materials: {
      type: [String],
      enum: [
        "Plastic",
        "Wood",
        "Metal",
        "Cotton",
        "Synthetic",
        "Alloy",
        "Paper",
        "Other",
      ],
      default: [],
    },

    dimensions: {
      length: { type: Number, required: true }, // cm
      width: { type: Number, required: true }, // cm
      height: { type: Number, required: true }, // cm
      weight: { type: Number, required: true }, // kg
    },

    ageGroup: {
      type: [String],
      enum: ["0-3", "3-6", "6-9", "9-12", "12+"],
      default: [],
    },

    brand: { type: String, default: "Generic" },

    // RATINGS
    rating: { type: Number, default: 5 },
    reviewCount: {
      type: Number,
      default: 0,
      required: false, // Add this
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],

    blacklisted: { type: Boolean, default: false },

    // CATEGORY
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
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

    freeShipping: {
      type: Boolean,
      default: false,
    },

    handlingTime: {
      type: Number, // days you take before handing to courier
      default: 1,
    },

    // SEARCH ENGINE FIELDS
    slug: { type: String, unique: true },
    tags: { type: [String], default: [] },
    keywords: { type: [String], default: [] },
  },
  { timestamps: true }
);

// ⭐ Auto Rating Calculation
productSchema.methods.calculateRating = async function () {
  const reviews = await Review.find({ productId: this._id });

  if (reviews.length === 0) {
    this.rating = 0;
    this.reviewCount = 0;
  } else {
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating = Number((total / reviews.length).toFixed(1));
    this.reviewCount = reviews.length;
  }

  await this.save();
};
productSchema.methods.getTotalStock = function () {
  // Variant-based product
  if (Array.isArray(this.variants) && this.variants.length > 0) {
    return this.variants.reduce(
      (sum, variant) => sum + (Number(variant.stock) || 0),
      0
    );
  }

  // Simple product
  return Number(this.stock) || 0;
};
// ⭐ Returns if offer is active
// ⭐ Returns if offer is active - FIXED VERSION
productSchema.methods.isOfferActive = function () {
  if (!this.offerValidFrom || !this.offerValidTill) return false;
 
  const now = new Date();
  const validFrom = new Date(this.offerValidFrom);
  const validTill = new Date(this.offerValidTill);
  
  // Timezone issues से बचने के लिए setHours(23,59,59,999)
  validTill.setHours(23, 59, 59, 999);
  
  return now >= validFrom && now <= validTill;
};


// ⭐ Discounted Price - FIXED VERSION
productSchema.methods.getDiscountedPrice = function () {
  if (typeof this.price !== "number" || this.price <= 0) return this.price || 0;

  if (this.discount > 0 && this.isOfferActive()) {
    const discounted = this.price - (this.price * this.discount) / 100;
    return Math.round(discounted * 100) / 100; // Round to 2 decimal places
  }

  return this.price;
};
productSchema.methods.getMainImage = function () {
  if (this.images && this.images.length > 0) {
    return this.images[0];
  }

  if (this.variants && this.variants.length > 0) {
    const firstVariant = this.variants[0];
    if (firstVariant.images && firstVariant.images.length > 0) {
      return firstVariant.images[0];
    }
  }

  return null;
};
// ⭐ Get product card data - FIXED VERSION
productSchema.methods.getProductCardData = function () {
  const isOfferActive = this.isOfferActive();

const discountedPrice = isOfferActive
  ? this.getDiscountedPrice()
  : this.price;


  return {
    _id: this._id,
    name: this.name,
    price: this.price,
    rating: this.rating || 0,
    reviewCount: this.reviewCount || 0,
    image: this.getMainImage(),
    discountedPrice: discountedPrice,
    discount: this.discount || 0,
    offerValidTill: this.offerValidTill,
    isOfferActive: isOfferActive, // Add this field
    variants: this.variants || [],
    stock: this.getTotalStock(),
    colors: this.colors || [],
    brand: this.brand || "",
    description: this.description || "",
  };
};
module.exports = mongoose.model("Product", productSchema);
