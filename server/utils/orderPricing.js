/**
 * Single source of truth for cart + checkout line pricing.
 * Matches Product schema methods: isOfferActive() + getDiscountedPrice().
 */

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

function isProductOfferActive(product) {
  if (!product || !product.discount || Number(product.discount) <= 0) {
    return false;
  }

  if (typeof product.isOfferActive === "function") {
    return product.isOfferActive();
  }

  if (!product.offerValidFrom || !product.offerValidTill) return false;

  const now = new Date();
  const validFrom = new Date(product.offerValidFrom);
  const validTill = new Date(product.offerValidTill);
  validTill.setHours(23, 59, 59, 999);

  return now >= validFrom && now <= validTill;
}

function getSellingPrice(product) {
  if (typeof product?.getDiscountedPrice === "function") {
    return round2(product.getDiscountedPrice());
  }

  const price = Number(product?.price) || 0;
  if (!isProductOfferActive(product)) return price;

  const discount = Number(product.discount) || 0;
  return round2(price - (price * discount) / 100);
}

function buildLineItem(product, quantity, extra = {}) {
  const qty = Math.max(1, Number(quantity) || 1);
  const originalPrice = Number(product?.price) || 0;
  const sellingPrice = getSellingPrice(product);
  const discountPerUnit = Math.max(0, round2(originalPrice - sellingPrice));
  const offerActive = isProductOfferActive(product);

  const line = {
    productId: product._id,
    name: product.name,
    image: product.images?.[0]?.url || null,
    originalPrice,
    price: originalPrice,
    discountedPrice: sellingPrice,
    finalPrice: sellingPrice,
    sellingPrice,
    discountPercent: offerActive ? Math.round(Number(product.discount) || 0) : 0,
    discountAmount: discountPerUnit,
    isOfferActive: offerActive,
    quantity: qty,
    lineTotal: round2(sellingPrice * qty),
    lineDiscount: round2(discountPerUnit * qty),
    stock:
      typeof product.getTotalStock === "function"
        ? product.getTotalStock()
        : Number(product.stock) || 0,
    weight: product.dimensions?.weight || 0,
    length: product.dimensions?.length || 0,
    width: product.dimensions?.width || 0,
    height: product.dimensions?.height || 0,
    ...extra,
  };

  return line;
}

function buildAmountSummary(items) {
  let subtotal = 0;
  let discount = 0;
  let totalQuantity = 0;

  for (const item of items) {
    const qty = item.quantity || 0;
    const mrp = item.originalPrice ?? item.price ?? 0;
    subtotal += mrp * qty;
    discount +=
      item.lineDiscount ??
      (Number(item.discountAmount) || 0) * qty;
    totalQuantity += qty;
  }

  const total = round2(Math.max(subtotal - discount, 0));

  return {
    subtotal: round2(subtotal),
    discount: round2(discount),
    total,
    payable: total,
    grandTotal: total,
    itemCount: items.length,
    totalQuantity,
  };
}

module.exports = {
  round2,
  isProductOfferActive,
  getSellingPrice,
  buildLineItem,
  buildAmountSummary,
};
