// services/product.service.js
const Product = require("../models/Product");
const ProductCapabilities = require("../models/ProductCapabilities");
const PromiseMaster = require("../models/PromiseMaster");

exports.getProductByIdService = async (productId) => {
  // 1. Product fetch
  const product = await Product.findById(productId);

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

  return {
    product: productObj,
    promises,
  };
};
