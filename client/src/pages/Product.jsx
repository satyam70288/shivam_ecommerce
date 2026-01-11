import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useBuyNow from "@/hooks/useBuyNow";
import useAddToCart from "@/hooks/useAddToCart";
import useProductDetails from "@/hooks/useProductDetails";

import Breadcrumb from "@/components/Product/Breadcrumb";
import ProductImages from "@/components/Product/ProductImages";
import ProductInfo from "@/components/Product/ProductInfo";
import ProductServices from "@/components/Product/ProductServices";
import ProductVariants from "@/components/Product/ProductVariants";
import ProductActions from "@/components/Product/ProductActions";
import ProductTabs from "@/components/Product/ProductTabs";

import MobileStickyCTA from "@/components/Product/MobileStickyCTA";
import ReviewsComponent from "@/components/custom/ReviewsComponent";
import SimilarProducts from "@/components/Product/SimilarProducts";
// import RelatedProductsCarousel from "./RelatedProductsCarousel";

const Product = () => {
  const { id } = useParams();

  const {
    product,
    quantity,
    setQuantity,
    selectedImage,
    setSelectedImage,
    color,
    setColor,
    size,
    setSize,
    images,
    displayPrice,
    isOfferActive,
    promise,
  } = useProductDetails(id);

  const { buyNow } = useBuyNow();
  const { handleAddToCart } = useAddToCart();
  const navigate = useNavigate();
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleAddToCartClick = () => {
    handleAddToCart({
      productId: product._id,
      quantity,
      price: product.price,
      color,
      size,
    });
  };

  const handleBuyNowClick = () => {
 
  buyNow({
    productId: product._id,
    quantity,
  });
};


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <Breadcrumb
        category={product.category}
        subcategory={product.subcategory}
        productName={product.name}
      />

      {/* Main Product Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Images */}
            <ProductImages
              images={images}
              selectedImage={selectedImage}
              onSelect={setSelectedImage}
              productName={product.name}
              id={id}
            />

            {/* Right Column - Product Info */}
            <div className="space-y-6">
              {/* Basic Info */}
              <ProductInfo
                name={product.name}
                rating={product.rating}
                reviewCount={product.reviewCount}
                soldCount={product.soldCount}
                brand={product.brand}
                price={product.price}
                displayPrice={displayPrice}
                discount={product.discount}
                isOfferActive={isOfferActive}
              />
<ProductVariants
                colors={product.colors}
                selectedColor={color}
                onColorChange={setColor}
                sizes={product.sizes}
                selectedSize={size}
                onSizeChange={setSize}
                sizeGuide={product.sizeGuide}
                stock={product.stock}
                quantity={quantity}
                onQuantityChange={setQuantity}
              />
              {/* Services */}
              <ProductServices
                freeDelivery={product.freeDelivery}
                deliveryCharge={product.deliveryCharge}
                warranty={product.warranty}
                warrantyType={product.warrantyType}
                returnPolicy={product.returnPolicy}
                returnable={product.returnable}
                stock={product.stock}
                promises={promise}
              />

              {/* Variants */}
              

              {/* CTA Buttons */}
              <div className="hidden lg:block">
                <ProductActions
                  stock={product.stock}
                  onAddToCart={handleAddToCartClick}
                  onBuyNow={handleBuyNowClick}
                  paymentOptions={product.paymentOptions}
                  highlights={product.highlights}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <ProductTabs product={product} />

        {/* Reviews Section */}
        <ReviewsComponent productId={product._id} product={product} />
      </main>



      {/* Mobile Sticky CTA */}
      <MobileStickyCTA
        product={product}
        displayPrice={displayPrice}
        isOfferActive={isOfferActive}
        onAddToCart={handleAddToCartClick}
        onBuyNow={handleBuyNowClick}
      />

      <SimilarProducts productId={id} />
    </div>
  );
};

export default Product;
