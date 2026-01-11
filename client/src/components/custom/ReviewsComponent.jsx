import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { Dialog, DialogContent } from "../ui/dialog";
import { X } from "lucide-react";
import { useReviewOperations } from "@/hooks/useReviewOperations";
import WriteReviewForm from "../Review/WriteReviewForm";
import ProductPageReviews from "../Review/ProductPageReviews";

const ReviewsComponent = ({ productId }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);

  const {
    reviews: reviewList,
    loading,
    fetchReviews,
  } = useReviewOperations(productId);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleReviewToggle = () => {
    setShowReviewForm((prev) => !prev);
  };

  const handleReviewSuccess = () => {
    fetchReviews();
    setShowReviewForm(false);
    toast({
      title: "Success!",
      description: "Your review has been submitted.",
    });
  };

  return (
    <div className="my-10 sm:my-20 max-w-4xl mx-auto px-4">
      {/* Write Review Section */}
      <div>
        <button
          onClick={handleReviewToggle}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{showReviewForm ? "Cancel" : "Write Review"}</span>
        </button>

        {showReviewForm && (
          <>
            <div className="text-center mb-10">
              <h3 className="font-bold text-3xl md:text-4xl text-gray-900 dark:text-white mb-3">
                Customer Reviews
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Share your experience with this product
              </p>
            </div>
            <WriteReviewForm
              productId={productId}
              loading={loading.create}
              onCancel={handleReviewToggle}
              onSuccess={handleReviewSuccess}
            />
          </>
        )}
      </div>

      {/* Reviews Preview */}
      <ProductPageReviews productId={productId} />

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