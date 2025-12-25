import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { starsGenerator } from "@/constants/helper";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { Delete, Edit2, Upload, X, MessageCircle, User, Calendar, Star } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "../ui/dialog";
import StarRating from "../StarRating";
import { useReviewOperations } from "@/hooks/useReviewOperations";

// Default avatar images array
const DEFAULT_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Casey",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Riley",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Skyler",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Blake",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Quinn"
];

// Get random avatar from array
const getRandomAvatar = (userId) => {
  if (!userId) return DEFAULT_AVATARS[0];
  const index = userId.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % DEFAULT_AVATARS.length;
  return DEFAULT_AVATARS[index];
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const ReviewsComponent = ({ productId }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const MAX_IMAGES = 15;
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [editing, setEditing] = useState({
    status: false,
    reviewId: null,
    review: "",
    rating: 0,
  });
  const [newReview, setNewReview] = useState({
    review: "",
    rating: 0,
  });
  const [newReply, setNewReply] = useState({ review: "" });
  const [replyingTo, setReplyingTo] = useState(null);

  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  
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
    fetchReviews();
  }, [productId]);

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => ({
        preview: URL.createObjectURL(file),
        file,
      }));
      const combined = [...images, ...newImages].slice(0, MAX_IMAGES);
      setImages(combined);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddReview = async () => {
    if (!newReview.review.trim()) {
      return toast({
        title: "Review required",
        description: "Please write your review",
        variant: "destructive",
      });
    }

    if (!newReview.rating) {
      return toast({
        title: "Rating required",
        description: "Please select a rating",
        variant: "destructive",
      });
    }

    const result = await createReview({
      review: newReview.review,
      rating: newReview.rating,
      productId,
      images,
    });

    if (result.success) {
      setNewReview({ review: "", rating: 0 });
      setImages([]);
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
      rating: editing.rating
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
      return toast({
        title: "Reply required",
        description: "Please write your reply",
        variant: "destructive",
      });
    }

    await addReply(reviewId, { review: newReply.review });
    setNewReply({ review: "" });
    setReplyingTo(null);
  };

  return (
    <div className="my-10 sm:my-20 max-w-4xl mx-auto px-4">
      <div className="text-center mb-10">
        <h3 className="font-bold text-3xl md:text-4xl text-gray-900 dark:text-white mb-3">
          Customer Reviews
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Share your experience with this product
        </p>
      </div>

      {/* WRITE REVIEW SECTION */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-800 mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-bold text-xl text-gray-900 dark:text-white">
              Write Your Review
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Your feedback helps others make better decisions
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Rating */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              How would you rate this product?
            </Label>
            <div className="flex items-center gap-2">
              <StarRating
                rating={newReview.rating}
                onRate={(value) => setNewReview({ ...newReview, rating: value })}
                size="lg"
              />
              {newReview.rating > 0 && (
                <span className="ml-3 text-lg font-semibold text-amber-600 dark:text-amber-500">
                  {newReview.rating}.0
                </span>
              )}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Your Review
            </Label>
            <Textarea
              placeholder="What did you like or dislike? What should others know about this product?"
              className="min-h-[120px] resize-none"
              value={newReview.review}
              onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
            />
          </div>

          {/* Image Upload */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Add Photos (Optional)
            </Label>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {images.map((image, index) => (
                  <div className="relative group" key={index}>
                    <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-700 group-hover:border-blue-500 transition-all">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {images.length < MAX_IMAGES && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex flex-col items-center justify-center"
                  >
                    <Upload className="h-6 w-6 text-gray-500 dark:text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Add</span>
                  </button>
                )}
              </div>
              
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                ref={fileInputRef}
              />
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upload up to {MAX_IMAGES} images. Max 5MB per image.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleAddReview}
            disabled={loading.create || !newReview.review.trim() || !newReview.rating}
            className="w-full md:w-auto px-8 py-3 text-base bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            {loading.create ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </span>
            ) : (
              "Submit Review"
            )}
          </Button>
        </div>
      </div>

      {/* REVIEWS LIST */}
      {loading.fetch ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : reviewList.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <MessageCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No reviews yet
          </h4>
          <p className="text-gray-500 dark:text-gray-400">
            Be the first to share your thoughts about this product
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
              Customer Reviews ({reviewList.length})
            </h4>
          </div>

          {reviewList.map((review) => {
            const isOwner = user?.id == review?.userId?._id;
            const isEditing = editing.status && editing.reviewId === review?._id;
            const avatar = getRandomAvatar(review?.userId?._id);

            return (
              <div
                key={review?._id}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow"
              >
                {/* Reviewer Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-lg">
                        <img
                          src={avatar}
                          alt={review?.userId?.name || "User"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {review?.userId?.name || "Anonymous User"}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {starsGenerator(review?.rating, "0", 18)}
                        </div>
                        <span className="text-sm font-semibold text-amber-600 dark:text-amber-500">
                          {review?.rating}.0
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(review?.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                {isOwner && isEditing ? (
                  <div className="space-y-4 mb-6">
                    <Textarea
                      value={editing.review}
                      onChange={(e) => setEditing(prev => ({ ...prev, review: e.target.value }))}
                      className="min-h-[100px]"
                    />
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Update Rating:</span>
                      <StarRating
                        rating={editing.rating}
                        onRate={(value) => setEditing(prev => ({ ...prev, rating: value }))}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    {review?.review}
                  </p>
                )}

                {/* Review Images */}
                {review?.images?.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-3">
                      {review.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSelectedImage(img.url);
                            setDrawerOpen(true);
                          }}
                          className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-700 hover:border-blue-500 transition-all"
                        >
                          <img
                            src={img.url}
                            alt={`Review image ${i + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Replies Section */}
                {review?.replies?.length > 0 && (
                  <div className="mt-6 pl-6 border-l-2 border-blue-200 dark:border-blue-800">
                    <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Replies ({review.replies.length})
                    </h5>
                    <div className="space-y-4">
                      {review.replies.map((reply) => (
                        <div
                          key={reply._id}
                          className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <img
                              src={getRandomAvatar(reply.userId?._id)}
                              alt={reply.userId?.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <h6 className="font-medium text-gray-900 dark:text-white text-sm">
                                {reply.userId?.name}
                              </h6>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(reply.createdAt)}
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm pl-11">
                            {reply.review}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Input */}
                {replyingTo === review?._id && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Write your reply
                    </Label>
                    <Textarea
                      placeholder="Type your reply here..."
                      value={newReply.review}
                      onChange={(e) => setNewReply({ review: e.target.value })}
                      className="mb-3"
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleAddReply(review._id)}
                        disabled={loading.reply || !newReply.review.trim()}
                        size="sm"
                      >
                        {loading.reply ? "Posting..." : "Post Reply"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setNewReply({ review: "" });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setReplyingTo(replyingTo === review._id ? null : review._id)}
                      className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {replyingTo === review._id ? "Cancel" : "Reply"}
                    </button>
                  </div>

                  {isOwner && (
                    <div className="flex gap-4">
                      {isEditing ? (
                        <button
                          onClick={() => handleEditReview(review._id)}
                          disabled={loading.update}
                          className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 disabled:opacity-50"
                        >
                          {loading.update ? "Saving..." : "Save Changes"}
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditing({
                            status: true,
                            reviewId: review._id,
                            review: review.review,
                            rating: review.rating
                          })}
                          className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        disabled={loading.delete}
                        className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 disabled:opacity-50 transition-colors"
                      >
                        <Delete className="h-4 w-4" />
                        {loading.delete ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Modal */}
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          {selectedImage && (
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={selectedImage}
                alt="Full size review"
                className="max-h-[85vh] w-full object-contain"
              />
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsComponent;