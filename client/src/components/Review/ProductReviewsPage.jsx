import React from "react";
import { useParams, Link } from "react-router-dom";
import ReviewsComponent from "../components/ReviewsComponent";
import { ArrowLeft, Home } from "lucide-react";

const ProductReviewsPage = () => {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to={`/product/${slug}`}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Product
              </Link>
              
              <Link 
                to="/"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Home className="h-5 w-5" />
                Home
              </Link>
            </div>
            
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Product Reviews
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Customer Reviews
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Read what customers are saying about this product
          </p>
        </div>

        {/* Reviews Component */}
        {/* <ReviewsComponent productId=product ID /> */}
      </div>
    </div>
  );
};

export default ProductReviewsPage;