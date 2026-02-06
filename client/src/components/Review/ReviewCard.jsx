// components/Review/ReviewCard.jsx
import React, { useState } from "react";
import { 
  Star, 
  Edit2, 
  Trash2, 
  MessageCircle, 
  Send, 
  X,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "../ui/button";
import ReviewImage from "./ReviewImage";

const ReviewCard = ({
  review,
  user,
  isEditing,
  editing,
  setEditing,
  replyingTo,
  setReplyingTo,
  newReply,
  setNewReply,
  loading,
  handleAddReply,
  handleEditReview,
  handleDeleteReview,
  formatDate,
  getRandomAvatar
}) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Review images
  const reviewImages = review.images || [];
  const hasImages = reviewImages.length > 0;

  // Handle image navigation
  const nextImage = () => {
    if (reviewImages.length > 1) {
      setImageIndex((prev) => (prev + 1) % reviewImages.length);
    }
  };

  const prevImage = () => {
    if (reviewImages.length > 1) {
      setImageIndex((prev) => (prev - 1 + reviewImages.length) % reviewImages.length);
    }
  };

  // Open image in modal
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-lg md:rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6">
        {/* Review Header */}
        <div className="flex justify-between items-start mb-3 md:mb-4">
          <div className="flex items-start gap-3">
            {/* User Avatar */}
            <div className="flex-shrink-0">
              {review.userId?.avatar ? (
                <img
                  src={review.userId.avatar}
                  alt={review.userId?.name || "User"}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm md:text-base">
                  {review.userId?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            {/* User Info */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                {review.userId?.name || "Anonymous User"}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {/* Rating Stars */}
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 md:h-4 md:w-4 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-300 text-gray-300 dark:text-gray-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Edit/Delete Actions (for own reviews) */}
          {user && user.id === review.userId?._id && (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing({
                  status: true,
                  reviewId: review._id,
                  review: review.review,
                  rating: review.rating
                })}
                className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteReview(review._id)}
                className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Review Text */}
        {isEditing ? (
          <div className="mb-4">
            <textarea
              value={editing.review}
              onChange={(e) => setEditing({...editing, review: e.target.value})}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              rows="3"
              placeholder="Update your review..."
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing({
                  status: false,
                  reviewId: null,
                  review: "",
                  rating: 0
                })}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleEditReview(review._id)}
                disabled={loading.update}
              >
                {loading.update ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300 mb-3 md:mb-4 text-sm md:text-base leading-relaxed">
            {review.review}
          </p>
        )}

        {/* Review Images */}
        {hasImages && (
          <ReviewImage reviewImages={reviewImages}/>
        )}

        {/* Reply Section */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 md:pt-4">
          {replyingTo === review._id ? (
            <div className="space-y-2">
              <textarea
                value={newReply.review}
                onChange={(e) => setNewReply({...newReply, review: e.target.value})}
                placeholder="Write your reply..."
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                rows="2"
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReplyingTo(null);
                    setNewReply({ review: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAddReply(review._id)}
                  disabled={loading.reply}
                >
                  {loading.reply ? "Posting..." : "Post Reply"}
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setReplyingTo(review._id)}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              Reply
            </button>
          )}

          {/* Existing Replies */}
          {review.replies && review.replies.length > 0 && (
            <div className="mt-3 md:mt-4 space-y-3">
              {review.replies.map((reply, index) => (
                <div key={index} className="pl-3 md:pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                      {reply.userId?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span className="font-medium text-sm text-gray-900 dark:text-white">
                      {reply.userId?.name || "User"}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {reply.review}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-10 right-0 md:-right-12 text-white p-2 hover:bg-white/10 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={selectedImage}
              alt="Review Image"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewCard;