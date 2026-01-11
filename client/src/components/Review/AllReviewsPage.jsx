import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Filter, Star } from "lucide-react";
import { Button } from "../ui/button";
import WriteReviewForm from "../Review/WriteReviewForm";
import { useReviewOperations } from "@/hooks/useReviewOperations";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";

// Import ReviewCard and related components
import ReviewCard from "../Review/ReviewCard";
import { getRandomAvatar, formatDate } from "../Review/reviewUtils";

const AllReviewsPage = () => {
  const { slug, productId: paramProductId } = useParams();
  const navigate = useNavigate();
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [filter, setFilter] = useState("all"); // all, 5-star, 4-star, etc.
  const [sortBy, setSortBy] = useState("newest"); // newest, helpful, highest
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
  const productId = paramProductId || slug;

  const {
    reviews: reviewList,
    loading,
    fetchReviews,
    createReview,
    updateReview,
    deleteReview,
    addReply,
  } = useReviewOperations(productId);
  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);
  const handleAddReview = async (reviewData) => {
    const result = await createReview(reviewData);
    if (result.success) {
      setShowWriteForm(false);
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
        variant: "default",
      });
    }
  };

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

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  // Filter and sort reviews
  const filteredReviews = reviewList
    .filter((review) => {
      if (filter === "all") return true;
      if (filter === "5-star") return review.rating === 5;
      if (filter === "4-star") return review.rating === 4;
      if (filter === "3-star") return review.rating === 3;
      if (filter === "2-star") return review.rating === 2;
      if (filter === "1-star") return review.rating === 1;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return 0;
    });

  // Calculate rating distribution
  const ratingDistribution = {
    5: reviewList.filter((r) => r.rating === 5).length,
    4: reviewList.filter((r) => r.rating === 4).length,
    3: reviewList.filter((r) => r.rating === 3).length,
    2: reviewList.filter((r) => r.rating === 2).length,
    1: reviewList.filter((r) => r.rating === 1).length,
  };

  const averageRating =
    reviewList.length > 0
      ? (
          reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length
        ).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Product
              </Button>

              <Link
                to="/"
                className="hidden md:flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Home className="h-5 w-5" />
                Home
              </Link>
            </div>

            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Customer Reviews
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Rating Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Rating Summary
              </h2>

              {/* Average Rating */}
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  {averageRating}
                </div>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={24}
                      className={
                        i < Math.floor(averageRating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300 dark:text-gray-600"
                      }
                    />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Based on {reviewList.length} reviews
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingDistribution[rating];
                  const percentage =
                    reviewList.length > 0
                      ? Math.round((count / reviewList.length) * 100)
                      : 0;

                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <button
                        onClick={() => setFilter(`${rating}-star`)}
                        className={`flex items-center gap-1 text-sm ${
                          filter === `${rating}-star`
                            ? "text-blue-600 dark:text-blue-400 font-semibold"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        <span>{rating}</span>
                        <Star
                          size={14}
                          className="fill-amber-400 text-amber-400"
                        />
                      </button>
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 w-10 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Filter Reset */}
              {filter !== "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilter("all")}
                  className="w-full mt-6"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </div>

          {/* Main Reviews Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Customer Reviews ({filteredReviews.length})
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Read what customers are saying about this product
              </p>
            </div>

            {/* Write Review Button */}
            {!showWriteForm && (
              <div className="mb-8">
                <Button
                  onClick={() => setShowWriteForm(true)}
                  className="w-full md:w-auto px-8 py-3 text-base bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Write a Review
                </Button>
              </div>
            )}

            {/* Write Review Form */}
            {showWriteForm && (
              <div className="mb-12">
                <WriteReviewForm
                  productId={productId}
                  onSubmit={handleAddReview}
                  loading={loading.create}
                  onCancel={() => setShowWriteForm(false)}
                />
              </div>
            )}

            {/* Sort Options */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sort by:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["newest", "highest", "lowest"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === option
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {option === "newest" && "Most Recent"}
                    {option === "highest" && "Highest Rated"}
                    {option === "lowest" && "Lowest Rated"}
                  </button>
                ))}
              </div>
            </div>

            {/* Reviews List */}
            {loading.fetch ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="text-5xl mb-4">😕</div>
                <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No reviews found
                </h4>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {filter !== "all"
                    ? `No ${filter} reviews available`
                    : "Be the first to share your thoughts about this product"}
                </p>
                {filter !== "all" && (
                  <Button variant="outline" onClick={() => setFilter("all")}>
                    Show All Reviews
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredReviews.map((review) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    user={user}
                    isEditing={
                      editing.status && editing.reviewId === review._id
                    }
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllReviewsPage;
