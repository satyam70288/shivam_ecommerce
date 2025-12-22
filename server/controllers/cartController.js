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
            product: product._id,     // ✅ ObjectId only
            quantity,
            color,
            size,
            price: product.price,     // snapshot
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
      select: "name price images stock blacklisted", // ✅ only what cart needs
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: { products: [] },
      });
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Remove product from cart

exports.removeFromCart = async function (req, res) {
  try {
    const { userId, cartItemId } = req.body; // cartItemId is the _id of the cart item
    console.log(req.body, "Remove cart item payload");

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    // Remove the exact cart item
    const initialLength = cart.products.length;
    cart.products = cart.products.filter(p => p._id.toString() !== cartItemId);

    if (cart.products.length === initialLength) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
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
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // Find the cart item by subdocument ID
    const item = cart.products.id(cartItemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
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
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // Find the cart item by subdocument ID
    const item = cart.products.id(cartItemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    // Optional: check stock
    if (item.quantity >= item.product.stock) {
      return res.status(400).json({ success: false, message: "Maximum stock reached" });
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
