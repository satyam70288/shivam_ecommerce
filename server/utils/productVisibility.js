/** Products visible on the storefront */
const PUBLIC_PRODUCT_FILTER = {
  blacklisted: false,
  isActive: { $ne: false },
};

const isProductVisibleToPublic = (product) =>
  Boolean(product) && !product.blacklisted && product.isActive !== false;

module.exports = {
  PUBLIC_PRODUCT_FILTER,
  isProductVisibleToPublic,
};
