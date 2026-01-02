var Cart = require("../models/Cart");
var Product = require("../models/Product");

// Add product to cart
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, color, size } = req.body;
    // 1️⃣ Validate product
    const product = await Product.findById(productId);
    if (!product || product.blacklisted) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 2️⃣ Find cart
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        products: [
          {
            product: product._id, // ✅ ObjectId only
            quantity,
            color,
            size,
            price: product.price, // snapshot
          },
        ],
      });

      await cart.save();

      return res.status(200).json({
        success: true,
        message: "Product added to cart",
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
      cart.products[index].quantity += quantity;
    } else {
      cart.products.push({
        product: product._id,
        quantity,
        color,
        size,
        price: product.price,
      });
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
    });
  } catch (error) {
    console.error("addToCart error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user's cart
exports.getCart = async function (req, res) {
  try {
    const userId = req.params.userId;

    const cart = await Cart.findOne({ user: userId }).populate({
      path: "products.product",
      select: "name price discount images stock",
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: { products: [] },
      });
    }

    // Initialize variables
    let subtotal = 0;
    let discount = 0;
    const items = [];

    // Helper function to round to 2 decimal places
    const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

    const processItem = (cartItem, product, qty, extra = {}) => {
      const price = roundToTwo(product.price);
      const finalPrice = product.discount
        ? roundToTwo(price * (1 - product.discount / 100))
        : price;

      const discountAmountPerUnit = roundToTwo(price - finalPrice);
      const discountPercent = product.discount || 0;

      const lineSubtotal = roundToTwo(price * qty);
      const lineDiscount = roundToTwo(discountAmountPerUnit * qty);

      subtotal = roundToTwo(subtotal + lineSubtotal);
      discount = roundToTwo(discount + lineDiscount);

      items.push({
        cartItemId: cartItem._id, // ✅ CORRECT
        productId: product._id,
        name: product.name,
        image: product.images?.[0]?.url,
        price: price.toFixed(2),
        discountPercent,
        finalPrice: finalPrice.toFixed(2),
        quantity: qty,
        lineTotal: roundToTwo(finalPrice * qty).toFixed(2),
        stock: product.stock,
        color: cartItem.color,
        size: cartItem.size,
        ...extra,
      });
    };

    // Process cart items
    for (const cartItem of cart.products) {
      const product = cartItem.product;

      if (!product) {
        continue;
      }

      const requestedQuantity = cartItem.quantity;
      const availableStock = product.stock;

      // If product is out of stock or insufficient stock
      if (availableStock === 0) {
        items.push({
          productId: product._id,
          name: product.name,
          image: product.images?.[0]?.url,
          price: roundToTwo(product.price).toFixed(2),
          finalPrice: roundToTwo(product.price).toFixed(2),
          quantity: requestedQuantity,
          stock: 0,
          availableStock: 0,
          outOfStock: true,
          message: "Out of stock",
          // Don't add to totals
        });
        continue;
      }

      // If requested quantity is more than available stock
      if (requestedQuantity > availableStock) {
        // Add item with limited quantity (only available stock)
        const limitedQuantity = availableStock;
        processItem(cartItem, product, limitedQuantity, {
          requestedQuantity,
          limited: true,
          message: `Only ${availableStock} available, reduced from ${requestedQuantity}`,
          stock: availableStock,
        });

        // Also add an out of stock entry for the excess quantity?
        // Or you can just show a warning in the item itself
      } else {
        // Normal case: sufficient stock
        processItem(cartItem, product, requestedQuantity, {
          stock: availableStock,
        });
      }
    }

    // Calculate totals - only from items that are in stock
    const total = roundToTwo(subtotal - discount);
    const grandTotal = roundToTwo(total);

    const transformedCart = {
      items,
      summary: {
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        total: total.toFixed(2),
        grandTotal: grandTotal.toFixed(2),
        itemCount: items.reduce((sum, item) => {
          // Only count items that are in stock and not out of stock
          if (item.outOfStock) return sum;
          return sum + (item.quantity || 0);
        }, 0),
      },
    };

    res.status(200).json({
      success: true,
      cart: transformedCart,
    });
  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching cart",
    });
  }
};

// Remove product from cart

exports.removeFromCart = async function (req, res) {
  console.log("inside")
  try {
    const { userId, cartItemId } = req.body; // cartItemId is the _id of the cart item
    console.log(req.body, "Remove cart item payload");

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

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
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.decreaseQuantity = async function (req, res) {
  try {
    const { userId, cartItemId } = req.body; // cartItemId = product inside cart
    console.log(req.body, "Decrease cart item payload");

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

    // ✅ Populate product details (optional but useful for frontend)
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

exports.increaseQuantity = async function (req, res) {
  try {
    const { userId, cartItemId } = req.body; // cartItemId = product inside cart
    console.log(req.body, "Increase cart item payload");

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

    // Optional: check stock
    if (item.quantity >= item.product.stock) {
      return res
        .status(400)
        .json({ success: false, message: "Maximum stock reached" });
    }

    // Increase quantity
    item.quantity += 1;

    await cart.save();

    // ✅ Populate product details (optional)
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
