import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useBuyNow from "@/hooks/useBuyNow";
import useCartActions from "@/hooks/useCartActions"; // ✅ Updated hook
import useProductDetails from "@/hooks/useProductDetails";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";

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

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // ✅ Use cart actions hook
  const { addToCart } = useCartActions();

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
    loading: productLoading,
  } = useProductDetails(id);

  const { buyNow } = useBuyNow();
  const [addingToCart, setAddingToCart] = useState(false);

  if (productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
            Product not found
          </h2>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ✅ CORRECT: Add to cart function with proper Redux
  const handleAddToCartClick = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setAddingToCart(true);

    try {
      // Get variant ID if available
      let variantId = null;
      if (color && size && product.variants) {
        const variant = product.variants.find(
          v => v.color === color && v.size === size
        );
        variantId = variant?._id;
      }

      // Prepare product data for optimistic update
      const productData = {
        _id: product._id,
        name: product.name,
        price: product.price,
        sellingPrice: displayPrice,
        images: product.allImages || [],
        variants: product.variants || [],
      };

      // Call addToCart with proper parameters
      await addToCart({
        productId: product._id,
        productData,
        quantity,
        color: color || product.variants?.[0]?.color || "Default",
        size: size || product.variants?.[0]?.size || "M",
        variantId,
      });

      // Success toast
      toast({
        title: "✅ Added to cart!",
        description: `${product.name} added to cart successfully`,
        duration: 3000,
      });

      // Reset quantity
      setQuantity(1);

      // Trigger cart drawer to open (optional)
      // window.dispatchEvent(new CustomEvent("openCartDrawer"));

    } catch (error) {
      console.error("Add to cart error:", error);
      toast({
        title: "❌ Failed to add to cart",
        description: error.message || "Please try again",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setAddingToCart(false);
    }
  };

  // ✅ CORRECT: Buy Now function
  const handleBuyNowClick = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      // First add to cart
      await handleAddToCartClick();
      
      // Then navigate to checkout
      buyNow({
        productId: product._id,
        quantity,
        color,
        size,
      });
    } catch (error) {
      toast({
        title: "❌ Cannot proceed to checkout",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

              {/* Services */}
              <ProductServices
                freeDelivery={product.freeShipping}
                deliveryCharge={product.deliveryCharge}
                warranty={product.warranty}
                warrantyType={product.warrantyType}
                returnPolicy={product.returnPolicy}
                returnable={product.returnWindow > 0}
                stock={product.totalStock || product.stock}
                promises={promise}
              />

              {/* Variants */}
              <ProductVariants
                colors={product.colors}
                selectedColor={color}
                onColorChange={setColor}
                sizes={product.sizes}
                selectedSize={size}
                onSizeChange={setSize}
                sizeGuide={product.sizeGuide}
                stock={product.totalStock || product.stock}
                quantity={quantity}
                onQuantityChange={setQuantity}
              />

              {/* CTA Buttons */}
              <div className="hidden lg:block">
                <ProductActions
                  stock={product.totalStock || product.stock}
                  onAddToCart={handleAddToCartClick}
                  onBuyNow={handleBuyNowClick}
                  loading={addingToCart}
                  paymentOptions="EMI available | Credit/Debit Cards | UPI | Net Banking"
                  highlights={product.keyFeatures || []}
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
        loading={addingToCart}
      />

      <SimilarProducts productId={id} />
    </div>
  );
};

export default Product;