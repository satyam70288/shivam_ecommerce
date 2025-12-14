const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.checkoutInit = async (req, res) => {
  try {
    // ✅ FIX 1
    const userId = req.id;
    const { productId, qty } = req.query;

    let items = [];
    let originalSubtotal = 0;
    let discountedSubtotal = 0;
    let totalDiscount = 0;

    /* =====================================================
       CASE 1️⃣ : SINGLE BUY NOW
    ===================================================== */
    if (productId) {
      const product = await Product.findById(productId);

      if (!product || product.blacklisted) {
        return res.status(404).json({ message: "Product not found" });
      }

      const quantity = Number(qty) || 1;

      const originalPrice = product.price;
      const discountedPrice = product.getDiscountedPrice();
      const discountAmount = originalPrice - discountedPrice;

      originalSubtotal = originalPrice * quantity;
      discountedSubtotal = discountedPrice * quantity;
      totalDiscount = discountAmount * quantity;

      items.push({
        productId: product._id,
        name: product.name,

        image: product.images?.[0]?.url || "/placeholder.png",

        originalPrice,
        discountedPrice,
        discountPercent: product.discount || 0,
        discountAmount,

        qty: quantity,
      });
    }

    /* =====================================================
       CASE 2️⃣ : CART CHECKOUT
    ===================================================== */
    else {
      const cart = await Cart.findOne({ user: userId });

      if (!cart || !cart.products || cart.products.length === 0) {
        return res.status(200).json({
          items: [],
          summary: {
            subtotal: 0,
            discount: 0,
            shipping: 0,
            total: 0,
          },
        });
      }

      const productIds = cart.products.map(p => p.product);

      const products = await Product.find({
        _id: { $in: productIds },
        blacklisted: false,
      });

      items = cart.products.map(cartItem => {
        const product = products.find(
          p => p._id.toString() === cartItem.product.toString()
        );

        if (!product) return null;

        const originalPrice = product.price;
        const discountedPrice = product.getDiscountedPrice();
        const discountAmount = originalPrice - discountedPrice;

        originalSubtotal += originalPrice * cartItem.quantity;
        discountedSubtotal += discountedPrice * cartItem.quantity;
        totalDiscount += discountAmount * cartItem.quantity;

        return {
          productId: product._id,
          name: product.name,

          image: product.images?.[0]?.url || "/placeholder.png",

          originalPrice,
          discountedPrice,
          discountPercent: product.discount || 0,
          discountAmount,

          qty: cartItem.quantity,
          color: cartItem.color,
          size: cartItem.size,
        };
      }).filter(Boolean);
    }

    /* =====================================================
       SHIPPING + TOTAL
    ===================================================== */
    const shipping = discountedSubtotal > 500 ? 0 : 50;
    const total = discountedSubtotal + shipping;

    return res.status(200).json({
      items,
      summary: {
        subtotal: originalSubtotal,
        discount: totalDiscount,
        shipping,
        total,
      },
    });

  } catch (error) {
    console.error("checkoutInit error:", error);
    return res.status(500).json({
      message: "Failed to initialize checkout",
    });
  }
};
