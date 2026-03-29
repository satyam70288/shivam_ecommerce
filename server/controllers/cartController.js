// controllers/cartController.js - FIXED VERSION
var Cart = require("../models/Cart");
var Product = require("../models/Product");

// Add product to cart
exports.addToCart = async (req, res) => {
  try {
    // ✅ Get userId from token (set by auth middleware) - NOT FROM BODY
    const userId = req.id || req.userId || req.user?.id; 
    const { productId, quantity, color, size } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User ID not found in token",
      });
    }

    const rawQty = Number(quantity);
    const qty =
      Number.isFinite(rawQty) && rawQty >= 1 ? Math.floor(rawQty) : null;
    if (qty === null) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive number",
      });
    }

    // 1️⃣ Validate product
    const product = await Product.findById(productId);
    if (!product || product.blacklisted) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 2️⃣ Find cart by userId (from token)
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      if (qty > product.stock) {
        return res.status(400).json({
          success: false,
          message: "Not enough stock available",
        });
      }

      cart = new Cart({
        user: userId,
        products: [
          {
            product: product._id,
            quantity: qty,
            color,
            size,
            price: product.price,
          },
        ],
      });

      await cart.save();

      return res.status(200).json({
        success: true,
        message: "Product added to cart",
        data: cart
      });
    }

    // 3️⃣ Check existing item
    const index = cart.products.findIndex(
      (p) =>
        p.product.toString() === productId &&
        p.color === color &&
        p.size === size
    );

    if (index > -1) {
      const newQty = cart.products[index].quantity + qty;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: "Not enough stock available",
        });
      }
      cart.products[index].quantity = newQty;
    } else {
      if (qty > product.stock) {
        return res.status(400).json({
          success: false,
          message: "Not enough stock available",
        });
      }
      cart.products.push({
        product: product._id,
        quantity: qty,
        color,
        size,
        price: product.price,
      });
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      data: cart
    });
  } catch (error) {
    console.error("addToCart error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user's cart - ✅ FIXED: Use token, not params
// Get user's cart with discounted prices
exports.getCart = async function (req, res) {
  try {
    const userId = req.id || req.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User ID not found in token",
      });
    }

    const cart = await Cart.findOne({ user: userId }).populate({
      path: "products.product",
      select: "name price discount images stock isOfferActive offerValidTill",
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: { items: [], summary: { subtotal: 0, discount: 0, total: 0 } }
      });
    }

    let subtotal = 0;
    let totalDiscount = 0;
    const items = [];

    for (const item of cart.products) {
      const product = item.product;
      if (!product) continue;

      // ✅ Use schema method to get current discounted price
      const currentPrice = product.price;
      const currentDiscountedPrice = product.getDiscountedPrice();
      
      // Use stored discountedPrice or calculate fresh
      const finalPrice = item.discountedPrice || currentDiscountedPrice;
      const discountPerUnit = currentPrice - finalPrice;
      
      const lineTotal = finalPrice * item.quantity;
      const lineDiscount = discountPerUnit * item.quantity;

      subtotal += currentPrice * item.quantity;
      totalDiscount += lineDiscount;

      items.push({
        cartItemId: item._id,
        productId: product._id,
        name: product.name,
        image: product.images?.[0]?.url,
        originalPrice: currentPrice,
        discountedPrice: finalPrice,
        discountPercent: product.discount || 0,
        discountAmount: discountPerUnit,
        quantity: item.quantity,
        lineTotal,
        lineDiscount,
        color: item.color,
        size: item.size,
        stock: product.stock
      });
    }

    const total = subtotal - totalDiscount;

    res.status(200).json({
      success: true,
      cart: {
        items,
        summary: {
          subtotal: Math.round(subtotal * 100) / 100,
          discount: Math.round(totalDiscount * 100) / 100,
          total: Math.round(total * 100) / 100,
          itemCount: items.length,
          totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0)
        }
      }
    });

  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove product from cart - ✅ FIXED: Use token
exports.removeFromCart = async function (req, res) {
  try {
    // ✅ Get userId from token - NOT FROM BODY
    const userId = req.id || req.userId || req.user?.id;
    const { cartItemId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User ID not found in token",
      });
    }

    console.log("Remove from cart - User:", userId, "Item:", cartItemId);

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Remove the exact cart item
    const initialLength = cart.products.length;
    cart.products = cart.products.filter(
      (p) => p._id.toString() !== cartItemId
    );

    if (cart.products.length === initialLength) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });
    }

    await cart.save();

    res.status(200).json({ success: true, message: "Product removed", cart });
  } catch (error) {
    console.error("removeFromCart error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Decrease quantity - ✅ FIXED: Use token
exports.decreaseQuantity = async function (req, res) {
  try {
    // ✅ Get userId from token - NOT FROM BODY
    const userId = req.id || req.userId || req.user?.id;
    const { cartItemId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User ID not found in token",
      });
    }

    console.log("Decrease quantity - User:", userId, "Item:", cartItemId);

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Find the cart item by subdocument ID
    const item = cart.products.id(cartItemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });
    }

    // Decrease or remove
    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      cart.products = cart.products.filter(
        (p) => p._id.toString() !== cartItemId
      );
    }

    await cart.save();
    await cart.populate("products.product");

    res.status(200).json({
      success: true,
      message: "Quantity updated",
      cart,
    });
  } catch (error) {
    console.error("Decrease quantity error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Increase quantity - ✅ FIXED: Use token
exports.increaseQuantity = async function (req, res) {
  try {
    // ✅ Get userId from token - NOT FROM BODY
    const userId = req.id || req.userId || req.user?.id;
    const { cartItemId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User ID not found in token",
      });
    }

    console.log("Increase quantity - User:", userId, "Item:", cartItemId);

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Find the cart item by subdocument ID
    const item = cart.products.id(cartItemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });
    }

    // Check stock
    const product = await Product.findById(item.product);
    if (item.quantity >= product.stock) {
      return res
        .status(400)
        .json({ success: false, message: "Maximum stock reached" });
    }

    // Increase quantity
    item.quantity += 1;

    await cart.save();
    await cart.populate("products.product");

    res.status(200).json({
      success: true,
      message: "Quantity increased",
      cart,
    });
  } catch (error) {
    console.error("Increase quantity error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear entire cart - ✅ FIXED: Use token
exports.clearCart = async function (req, res) {
  try {
    // ✅ Get userId from token - NOT FROM PARAMS
    const userId = req.id || req.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User ID not found in token",
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    cart.products = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("clearCart error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};