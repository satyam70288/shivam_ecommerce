// helpers/orderCalculator.js
const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.calculateOrder = async (userId, { productId, quantity }) => {
  console.log(productId,"productId")
  let items = [];
  let subtotal = 0;
  let discount = 0;

  const processItem = (product, qty, extra = {}) => {
    const price = product.price;
    const finalPrice = product.getDiscountedPrice();

    const discountAmountPerUnit = price - finalPrice;
    const discountPercent = product.discount || 0;

    subtotal += price * qty;
    discount += discountAmountPerUnit * qty;

    items.push({
      productId: product._id,
      name: product.name,
      image: product.images?.[0]?.url,

      price,
      discountPercent,
      discountAmount: discountAmountPerUnit,
      finalPrice,

      quantity: qty,
      lineTotal: finalPrice * qty,
      weight: product.dimensions.weight,
      length: product.dimensions.length,
      width: product.dimensions.width,
      height: product.dimensions.height,
      ...extra,
    });
  };

  if (productId) {
    const product = await Product.findById(productId);
    if (!product || product.blacklisted) {
      throw new Error("Product not available");
    }

    const qty = Number(quantity) || 1;
    if (product.stock < qty) {
      throw new Error(`${product.name} out of stock`);
    }

    processItem(product, qty);
  } else {
    const cart = await Cart.findOne({ user: userId }).populate(
      "products.product"
    );
    if (!cart || cart.products.length === 0) {
      throw new Error("Cart empty");
    }

    for (const cartItem of cart.products) {
      const product = cartItem.product;

      if (product.stock < cartItem.quantity) {
        throw new Error(`${product.name} out of stock`);
      }

      processItem(product, cartItem.quantity, {
        color: cartItem.color,
        size: cartItem.size,
      });
    }
  }

  const payable = subtotal - discount;
  const shipping = payable === 0 ? 0 : payable > 500 ? 0 : 50;
  const total = payable + shipping;

  return {
    items,
    summary: {
      subtotal,
      discount,
      shipping,
      total,
    },
    checkoutType: productId ? "BUY_NOW" : "CART",
  };
};

// Helper for verifying payment and creating order
exports.processPaymentAndCreateOrder = async (
  userId,
  orderData,
  paymentDetails
) => {
  const { items, total } = orderData;
  const { addressId } = paymentDetails;

  // Verify and reduce stock
  for (const item of items) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.productId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );

    if (!updated) {
      throw new Error(`Insufficient stock for ${item.name}`);
    }
  }

  return { items, total };
};
