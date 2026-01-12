// helpers/calculationHelpers.js
const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

const validateQuantity = (quantity, stock, productName) => {
  if (quantity <= 0) {
    throw new Error(`Invalid quantity for ${productName}`);
  }
  if (quantity > stock) {
    throw new Error(`${productName} - Only ${stock} units available`);
  }
  return true;
};

const calculateTax = (amount, taxRate = 0.18, priceIncludesTax = false) => {
  if (priceIncludesTax) {
    // Tax inclusive: Extract tax from total
    const taxableValue = amount / (1 + taxRate);
    return roundToTwo(amount - taxableValue);
  }
  // Tax exclusive: Add tax to amount
  return roundToTwo(amount * taxRate);
};

module.exports = {
  roundToTwo,
  validateQuantity,
  calculateTax
};