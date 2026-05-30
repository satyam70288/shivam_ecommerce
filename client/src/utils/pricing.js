/** Mirror server orderPricing fields for display (cart + checkout). */

export function normalizeLineItem(item = {}) {
  const originalPrice = Number(item.originalPrice ?? item.price ?? 0);
  const sellingPrice = Number(
    item.discountedPrice ?? item.finalPrice ?? item.sellingPrice ?? originalPrice
  );
  const quantity = Number(item.quantity) || 1;
  const discountAmount = Number(
    item.discountAmount ?? Math.max(0, originalPrice - sellingPrice)
  );
  const isOfferActive =
    item.isOfferActive ??
    (discountAmount > 0 && originalPrice > sellingPrice);

  return {
    ...item,
    originalPrice,
    sellingPrice,
    discountedPrice: sellingPrice,
    finalPrice: sellingPrice,
    quantity,
    discountAmount,
    isOfferActive,
    lineTotal: Number(item.lineTotal ?? sellingPrice * quantity),
    lineDiscount: Number(item.lineDiscount ?? discountAmount * quantity),
  };
}

export function hasActiveDiscount(item) {
  const line = normalizeLineItem(item);
  return (
    line.isOfferActive &&
    line.discountAmount > 0 &&
    line.originalPrice > line.sellingPrice
  );
}

export function formatINR(amount) {
  const n = Number(amount) || 0;
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
