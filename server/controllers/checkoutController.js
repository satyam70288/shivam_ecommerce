const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.checkoutInit = async (req, res) => {
  try {
    const userId = req.id;
    const { productId, qty } = req.query;

    console.log("✅ CHECKOUT INIT");
    console.log("USER ID:", userId);
    console.log("BUY NOW PRODUCT ID:", productId);

    let items = [];
    let subtotal = 0;
    let totalDiscount = 0;

    /* ================= BUY NOW ================= */
    if (productId) {
      const product = await Product.findById(productId);

      console.log("BUY NOW PRODUCT:", product);

      if (!product || product.blacklisted) {
        return res.status(404).json({ message: "Product not found" });
      }

      const quantity = Number(qty) || 1;

      if (product.stock < quantity) {
        return res.status(400).json({ message: "Out of stock" });
      }

      const price = product.price;
      const finalPrice = product.getDiscountedPrice();
      const discountAmount = price - finalPrice;

      subtotal += price * quantity;
      totalDiscount += discountAmount * quantity;

      items.push({
        productId: product._id,
        name: product.name,
        image: product.images?.[0]?.url || "/placeholder.png",
        price,
        finalPrice,
        quantity,
      });
    }

    /* ================= CART CHECKOUT ================= */
    else {
      const cart = await Cart.findOne({ user: userId });

      console.log("🛒 CART FOUND:", cart);

      if (!cart || !cart.products || cart.products.length === 0) {
        console.log("⚠️ CART EMPTY");
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

      console.log("CART PRODUCTS:", cart.products);

      const productIds = cart.products.map(p => p.product);
      console.log("PRODUCT IDS FROM CART:", productIds);

      const products = await Product.find({
        _id: { $in: productIds },
        blacklisted: false, // ✅ CORRECT FIELD
      });

      console.log("DB PRODUCTS FOUND:", products);

      items = cart.products
        .map(cartItem => {
          const product = products.find(
            p => p._id.toString() === cartItem.product.toString()
          );

          if (!product) {
            console.log("❌ PRODUCT NOT FOUND / BLACKLISTED:", cartItem.product);
            return null;
          }

          if (product.stock < cartItem.quantity) {
            console.log("❌ OUT OF STOCK:", product.name);
            return null;
          }

          const price = product.price;
          const finalPrice = product.getDiscountedPrice();
          const discountAmount = price - finalPrice;

          subtotal += price * cartItem.quantity;
          totalDiscount += discountAmount * cartItem.quantity;

          return {
            productId: product._id,
            name: product.name,
            image: product.images?.[0]?.url || "/placeholder.png",
            price,
            finalPrice,
            quantity: cartItem.quantity,
            color: cartItem.color,
            size: cartItem.size,
          };
        })
        .filter(Boolean);
    }

    const payable = subtotal - totalDiscount;

    const shipping =
      payable === 0 ? 0 : payable > 500 ? 0 : 50;

    const total = payable + shipping;

    console.log("✅ FINAL ITEMS:", items);
    console.log("✅ SUMMARY:", {
      subtotal,
      discount: totalDiscount,
      shipping,
      total,
    });

    return res.status(200).json({
      items,
      summary: {
        subtotal,
        discount: totalDiscount,
        shipping,
        total,
      },
    });
  } catch (error) {
    console.error("❌ checkoutInit error:", error);
    return res.status(500).json({
      message: "Failed to initialize checkout",
    });
  }
};
