const { calculateOrder } = require("../helper/createOrder");

exports.checkoutInit = async (req, res) => {
  try {
    const userId = req.id;
    const { productId, qty } = req.query;

    const order = await calculateOrder(userId, {
      productId,
      quantity: qty,
    });

    return res.status(200).json(order);
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Checkout failed",
    });
  }
};
