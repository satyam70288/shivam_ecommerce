// services/product.service.js
const mongoose = require("mongoose");
const Product = require("../models/Product");
const ProductCapabilities = require("../models/ProductCapabilities");
const PromiseMaster = require("../models/PromiseMaster");

const isMongoId = (value) =>
  mongoose.Types.ObjectId.isValid(value) &&
  /^[a-fA-F0-9]{24}$/.test(String(value));

async function findProductByIdOrSlug(idOrSlug) {
  if (!idOrSlug) return null;

  if (isMongoId(idOrSlug)) {
    const byId = await Product.findById(idOrSlug);
    if (byId) return byId;
  }

  return Product.findOne({ slug: idOrSlug });
}

exports.findProductByIdOrSlug = findProductByIdOrSlug;

exports.getProductByIdService = async (productIdOrSlug) => {
  const product = await findProductByIdOrSlug(productIdOrSlug);

  if (!product) return null;

  // 2. Discount calculation
  let discountedPrice = null;
  if (product.productType === "simple") {
    discountedPrice = product.getDiscountedPrice();
  }

  // 3. Capabilities fetch
  const cap = await ProductCapabilities.findOne({
    productId: product._id,
  });

  // 4. Capability → Promise codes
  const codes = [];
  if (cap?.canDispatchFast) codes.push("READY_TO_SHIP");
  if (cap?.returnEligible) codes.push("EASY_RETURNS");
  if (cap?.codAvailable) codes.push("SECURE_PAYMENTS");
  if (cap?.qualityVerified) codes.push("QUALITY_CHECKED");

  // 5. Promise master fetch
  const promises =
    codes.length > 0
      ? await PromiseMaster.find({
          code: { $in: codes },
          isActive: true,
        }).select("code title description iconId")
      : [];

  // 6. Product serialization
  const productObj = product.toObject();
  productObj.specifications = product.specifications
    ? Object.fromEntries(product.specifications)
    : {};
  productObj.discountedPrice = discountedPrice;
  productObj.canDispatchFast = Boolean(cap?.canDispatchFast);
  productObj.returnEligible = Boolean(cap?.returnEligible);
  productObj.codAvailable = Boolean(cap?.codAvailable);
  productObj.qualityVerified = Boolean(cap?.qualityVerified);

  return {
    product: productObj,
    promises,
  };
};
