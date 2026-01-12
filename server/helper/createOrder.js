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
// ✅ Helper function file में (calculationHelpers.js)
const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

// ✅ Main orderCalculator.js
// exports.calculateOrder = async (userId, { productId, quantity }) => {
//   console.log(productId, "productId");
//   let items = [];
//   let subtotal = 0;
//   let discount = 0;
//   let totalTax = 0;

//   const TAX_RATE = 0.18; // 18% GST

//   const processItem = (product, qty, extra = {}) => {
//     const price = product.price;
//     const finalPrice = product.getDiscountedPrice();
//     const quantity = Number(qty);

//     const discountAmountPerUnit = price - finalPrice;
//     const discountPercent = product.discount || 0;
    
//     // Calculations with rounding
//     const itemSubtotal = roundToTwo(price * quantity);
//     const itemDiscount = roundToTwo(discountAmountPerUnit * quantity);
//     const itemTotal = roundToTwo(finalPrice * quantity);
//     const itemTax = roundToTwo(itemTotal * TAX_RATE);

//     subtotal = roundToTwo(subtotal + itemSubtotal);
//     discount = roundToTwo(discount + itemDiscount);
//     totalTax = roundToTwo(totalTax + itemTax);

//     items.push({
//       productId: product._id,
//       name: product.name,
//       image: product.images?.[0]?.url,
//       price: roundToTwo(price),
//       discountPercent,
//       discountAmount: roundToTwo(discountAmountPerUnit),
//       finalPrice: roundToTwo(finalPrice),
//       quantity,
//       lineTotal: itemTotal,
//       taxAmount: itemTax,
//       taxRate: TAX_RATE,
//       weight: product.dimensions?.weight || 0,
//       length: product.dimensions?.length || 0,
//       width: product.dimensions?.width || 0,
//       height: product.dimensions?.height || 0,
//       ...extra,
//     });
//   };

//   if (productId) {
//     const product = await Product.findById(productId);
//     if (!product || product.blacklisted) {
//       throw new Error("Product not available");
//     }

//     const qty = Number(quantity) || 1;
//     if (product.stock < qty) {
//       throw new Error(`${product.name} out of stock`);
//     }

//     processItem(product, qty);
//   } else {
//     const cart = await Cart.findOne({ user: userId }).populate(
//       "products.product"
//     );
//     if (!cart || cart.products.length === 0) {
//       throw new Error("Cart empty");
//     }

//     for (const cartItem of cart.products) {
//       const product = cartItem.product;

//       if (product.stock < cartItem.quantity) {
//         throw new Error(`${product.name} out of stock`);
//       }

//       processItem(product, cartItem.quantity, {
//         color: cartItem.color,
//         size: cartItem.size,
//       });
//     }
//   }

//   const payable = roundToTwo(subtotal - discount);
//   const shipping = payable === 0 ? 0 : payable > 500 ? 0 : 50;
  
//   const total = roundToTwo(payable + shipping + totalTax);

//   return {
//     items,
//      summary: {
//     subtotal: roundToTwo(subtotal),
//     discount: roundToTwo(discount),
//     shipping,
//     tax: roundToTwo(totalTax),
//     taxRate: TAX_RATE * 100, // Percentage format (18)
//     taxableAmount: roundToTwo(subtotal - discount), // Tax लगने वाली amount
//     total,
//     itemsCount: items.length,
//     totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0)
//   },
//     checkoutType: productId ? "BUY_NOW" : "CART",
//   };
// };
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
