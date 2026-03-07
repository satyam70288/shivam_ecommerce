// components/Review/ProductPageReviews.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useReviewOperations } from "@/hooks/useReviewOperations";
import { useSelector } from "react-redux";
import { MessageCircle, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import divided components
import ReviewCard from "./ReviewCard";
import {
  getRandomAvatar,
  formatDate,
  calculateAverageRating,
} from "./reviewUtils";

const ProductPageReviews = ({ productId, productSlug }) => {
  const [newReply, setNewReply] = useState({ review: "" });
  const [replyingTo, setReplyingTo] = useState(null);
  const [editing, setEditing] = useState({
    status: false,
    reviewId: null,
    review: "",
    rating: 0,
  });

  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);

  const {
    reviews: reviewList,
    loading,
    fetchReviews,
    updateReview,
    deleteReview,
    addReply,
  } = useReviewOperations(productId);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    await deleteReview(reviewId);
  };

  const handleEditReview = async (reviewId) => {
    if (!confirm("Are you sure you want to save changes?")) return;

    const result = await updateReview(reviewId, {
      updatedReview: editing.review,
      rating: editing.rating,
    });

    if (result.success) {
      setEditing({
        status: false,
        reviewId: null,
        review: "",
        rating: 0,
      });
    }
  };

  const handleAddReply = async (reviewId) => {
    if (!newReply.review.trim()) {
      toast({
        title: "Reply required",
        description: "Please write your reply",
        variant: "destructive",
      });
      return;
    }

    const result = await addReply(reviewId, { review: newReply.review });

    if (result?.success) {
      toast({
        title: "Reply posted",
        description: "Your reply has been added successfully",
      });
      setNewReply({ review: "" });
      setReplyingTo(null);
      fetchReviews();
    }
  };

  if (loading.fetch) {
    return (
      <div className="mt-8 md:mt-12">
        <div className="flex items-center justify-between mb-4 md:mb-6 px-4 md:px-0">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Customer Reviews
          </h3>
        </div>
        <div className="space-y-3 md:space-y-4 px-4 md:px-0">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 dark:bg-gray-800 h-24 md:h-32 rounded-lg md:rounded-xl"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // सिर्फ 3 reviews ही show करें
  const displayedReviews = reviewList.slice(0, 2);

  return (
    <div className="mt-8 md:mt-12 md:px-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Customer Reviews
          </h3>
          {reviewList.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                {reviewList.length} reviews •{" "}
                {calculateAverageRating(reviewList)}/5 average
              </p>
            </div>
          )}
        </div>

        {/* Write Review Button */}
        {productSlug && (
          <Link to={`/product/${productId}/reviews`}>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Write Review3
            </Button>
          </Link>
        )}
      </div>

      {/* Reviews List */}
      {reviewList.length === 0 ? (
        <div className="text-center py-8 md:py-12 bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-800">
          <MessageCircle className="h-10 w-10 md:h-12 md:w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3 md:mb-4" />
          <h4 className="text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No reviews yet
          </h4>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base px-4 mb-6">
            Be the first to share your thoughts
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 md:space-y-6">
            {displayedReviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review} // ✅ यहाँ review object में images array है
                user={user}
                isEditing={editing.status && editing.reviewId === review._id}
                editing={editing}
                setEditing={setEditing}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                newReply={newReply}
                setNewReply={setNewReply}
                loading={loading}
                handleAddReply={handleAddReply}
                handleEditReview={handleEditReview}
                handleDeleteReview={handleDeleteReview}
                formatDate={formatDate}
                getRandomAvatar={getRandomAvatar}
              />
            ))}
          </div>

          {/* View All Reviews Button - All Reviews Page पर ले जाएगा */}
          {reviewList.length > 2 && (
            <div className="mt-6 md:mt-8 flex flex-col items-center">
              <Link
                to={`/product/${productId}/reviews`}
                className="w-full md:w-auto"
              >
                <Button
                  variant="outline"
                  className="w-full text-sm border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  <span>View All Reviews</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="text-xs text-gray-500 mt-2">
                Click to see all reviews, ratings, and write your own review
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductPageReviews;
