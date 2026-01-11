import React, { useRef, useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, User } from "lucide-react";
import StarRating from "../StarRating";
import { useToast } from "@/hooks/use-toast";
import { useReviewOperations } from "@/hooks/useReviewOperations";

const WriteReviewForm = ({
  productId,
  onSuccess,
  onCancel,
}) => {
  const [images, setImages] = useState([]);
  const [newReview, setNewReview] = useState({
    review: "",
    rating: 0,
  });
  const fileInputRef = useRef(null);
  const MAX_IMAGES = 15;
  const { toast } = useToast();

  // Hook से createReview function लें
  const { createReview, loading } = useReviewOperations(productId);

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
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
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
        toast({
          title: "Review submitted",
          description: "Thanks for your feedback!",
        });

        // Reset form
        setNewReview({ review: "", rating: 0 });
        setImages([]);

        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
      }
      // Error handling is done inside createReview hook
    } catch (error) {
      // Fallback error handling
      toast({
        title: "Error",
        description:
          error.response.data.message ||
          "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-800">
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
            onChange={(e) =>
              setNewReview({ ...newReview, review: e.target.value })
            }
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
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Add
                  </span>
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

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSubmit}
            disabled={
              loading.create || !newReview.review.trim() || !newReview.rating
            }
            className="flex-1 px-8 py-3 text-base bg-blue-600 hover:bg-blue-700 text-white font-semibold"
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

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 px-8 py-3 text-base"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WriteReviewForm;
