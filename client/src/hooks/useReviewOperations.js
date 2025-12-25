import { useState } from 'react';
import axios from 'axios';

export const useReviewOperations = (productId) => {
  // States for different operations
  const [loading, setLoading] = useState({
    fetch: false,
    create: false,
    update: false,
    delete: false,
    reply: false
  });
  
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);

  // Helper to update loading state
  const setLoadingState = (operation, isLoading) => {
    setLoading(prev => ({ ...prev, [operation]: isLoading }));
  };

  // 1. Fetch Reviews
  const fetchReviews = async () => {
    if (!productId) return;
    
    setLoadingState('fetch', true);
    setError(null);
    
    try {
      const res = await axios.get(
        import.meta.env.VITE_API_URL + `/get-reviews/${productId}`
      );
      const { data } = await res.data;
      setReviews(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reviews');
      throw err;
    } finally {
      setLoadingState('fetch', false);
    }
  };

  // 2. Create Review
  const createReview = async (reviewData) => {
    setLoadingState('create', true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("review", reviewData.review);
      formData.append("rating", reviewData.rating);
      formData.append("productId", reviewData.productId);

      reviewData.images.forEach((img) => {
        formData.append("images", img.file);
      });

      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/create-review",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update local state with new review
      setReviews(prev => [res.data.data, ...prev]);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create review');
      throw err;
    } finally {
      setLoadingState('create', false);
    }
  };

  // 3. Update Review
  const updateReview = async (reviewId, updateData) => {
    setLoadingState('update', true);
    setError(null);
    
    try {
      const res = await axios.put(
        import.meta.env.VITE_API_URL + `/update-review/${reviewId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update review in local state
      setReviews(prev => 
        prev.map(review => 
          review._id === reviewId ? res.data.data : review
        )
      );
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update review');
      throw err;
    } finally {
      setLoadingState('update', false);
    }
  };

  // 4. Delete Review
  const deleteReview = async (reviewId) => {
    setLoadingState('delete', true);
    setError(null);
    
    try {
      const res = await axios.delete(
        import.meta.env.VITE_API_URL + `/delete-review/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Remove review from local state
      setReviews(prev => prev.filter(review => review._id !== reviewId));
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete review');
      throw err;
    } finally {
      setLoadingState('delete', false);
    }
  };

  // 5. Add Reply to Review
  const addReply = async (reviewId, replyData) => {
    setLoadingState('reply', true);
    setError(null);
    
    try {
      const res = await axios.put(
        import.meta.env.VITE_API_URL + `/reply-review/${reviewId}`,
        replyData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update review with reply in local state
      setReviews(prev => 
        prev.map(review => 
          review._id === reviewId ? res.data.data : review
        )
      );
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add reply');
      throw err;
    } finally {
      setLoadingState('reply', false);
    }
  };

  return {
    // Data
    reviews,
    
    // Loading states for each operation
    loading,
    
    // Error state
    error,
    
    // Operations
    fetchReviews,
    createReview,
    updateReview,
    deleteReview,
    addReply,
    
    // Set reviews (for manual updates if needed)
    setReviews
  };
};