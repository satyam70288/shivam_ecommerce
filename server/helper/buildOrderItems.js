const Cart = require("../models/Cart");
const Product = require("../models/Product");

async function buildOrderItems({ userId, checkoutType, productId, quantity }) {
  let items = [];
  let subtotal = 0;

  if (checkoutType === "CART") {
    const cart = await Cart.findOne({ user: userId }).populate("products.product");
    if (!cart || cart.products.length === 0) {
      throw new Error("Cart is empty");
    }

    for (const cartItem of cart.products) {
      const product = cartItem.product;

      if (!product || product.stock < cartItem.quantity) {
        throw new Error(`${product?.name || "Product"} out of stock`);
      }

      const finalPrice = product.getDiscountedPrice();

      items.push({
        productId: product._id,
        name: product.name,
        sku: product.sku,
        image: product.images?.[0]?.url,
        price: product.price,
        discount: product.discount || 0,
        finalPrice,
        quantity: cartItem.quantity,
        color: cartItem.color,
        size: cartItem.size,
        weight: product.weight || 0,
      });

      subtotal += finalPrice * cartItem.quantity;
    }
  }

  if (checkoutType === "BUY_NOW") {
    const product = await Product.findById(productId);
    if (!product || product.stock < quantity) {
      throw new Error("Product unavailable");
    }

    const finalPrice = product.getDiscountedPrice();

    items.push({
      productId: product._id,
      name: product.name,
      sku: product.sku,
      image: product.images?.[0]?.url,
      price: product.price,
      discount: product.discount || 0,
      finalPrice,
      quantity,
      weight: product.weight || 0,
    });

    subtotal = finalPrice * quantity;
  }

  return { items, subtotal };
}

module.exports = buildOrderItems;
