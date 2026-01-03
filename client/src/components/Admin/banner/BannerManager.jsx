import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBanners,
  clearError,
  clearSuccess,
  deleteBanner,
} from "../../../redux/slices/bannerSlice";
import BannerForm from "./BannerForm";
import BannerList from "./BannerList";
import BannerStats from "./BannerStats";

const BannerManager = () => {
  const dispatch = useDispatch();
  const { banners, loading, error, success } = useSelector(
    (state) => state.banner
  );

  const [editingBanner, setEditingBanner] = useState(null);

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        if (error) dispatch(clearError());
        if (success) dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success, dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      dispatch(deleteBanner(id));
      if (editingBanner && editingBanner._id === id) {
        setEditingBanner(null);
      }
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
  };

  const handleCancelEdit = () => {
    setEditingBanner(null);
  };

  // Clear messages manually
  const handleClearError = () => dispatch(clearError());
  const handleClearSuccess = () => dispatch(clearSuccess());

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Banner Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Create and manage homepage banners
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={handleClearError}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                {editingBanner ? "Banner updated successfully!" : "Banner created successfully!"}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={handleClearSuccess}
                className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <BannerStats banners={banners} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Left - Form */}
        <div>
          <BannerForm
            initialData={editingBanner}
            onCancel={handleCancelEdit}
            isEditing={!!editingBanner}
          />
          
          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">
                  Banner Best Practices
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                  <li>• Use high-quality images (1200x500px recommended)</li>
                  <li>• Keep titles short and compelling</li>
                  <li>• Set higher priority for important banners</li>
                  <li>• Use appropriate tags for categorization</li>
                  <li>• Test links before activating banners</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right - List */}
        <div>
          <BannerList
            banners={banners}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={(id, status) => {
              // Update banner status directly
              // Note: You need to implement updateBannerStatus in your slice
              // For now, using updateBanner with just isActive field
              dispatch(updateBanner({ 
                id, 
                bannerData: { isActive: !status } 
              }));
            }}
            onUpdatePriority={(id, priority) => {
              // Update banner priority directly
              dispatch(updateBanner({ 
                id, 
                bannerData: { priority } 
              }));
            }}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default BannerManager;