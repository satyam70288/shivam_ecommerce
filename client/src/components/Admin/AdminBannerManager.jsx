import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Tag,
  Link as LinkIcon,
  AlertCircle,
} from "lucide-react";
import {
  fetchBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  clearError,
  clearSuccess,
} from "../../redux/slices/bannerSlice";

const AdminBannerManager = () => {
  const dispatch = useDispatch();
  const { banners, loading, error, success } = useSelector(
    (state) => state.banner
  );

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    tag: "FEATURED",
    link: "/",
    priority: 5,
    isActive: true,
  });

  const [editingId, setEditingId] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available tags with colors
  const tagOptions = [
    { value: "BEST SELLER", color: "bg-red-100 text-red-800" },
    { value: "POPULAR", color: "bg-blue-100 text-blue-800" },
    { value: "SALE", color: "bg-green-100 text-green-800" },
    { value: "NEW", color: "bg-purple-100 text-purple-800" },
    { value: "TRENDING", color: "bg-orange-100 text-orange-800" },
    { value: "FEATURED", color: "bg-indigo-100 text-indigo-800" },
    { value: "HOT", color: "bg-pink-100 text-pink-800" },
  ];

  // Load banners on mount
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

  // Reset form after successful operation
  useEffect(() => {
    if (success && isSubmitting) {
      resetForm();
      setIsSubmitting(false);
    }
  }, [success, isSubmitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        await dispatch(updateBanner({ id: editingId, bannerData: formData }));
      } else {
        await dispatch(createBanner(formData));
      }
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (banner) => {
    setFormData({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      image: banner.image || "",
      tag: banner.tag || "FEATURED",
      link: banner.link || "/",
      priority: banner.priority || 5,
      isActive: banner.isActive !== undefined ? banner.isActive : true,
    });
    setEditingId(banner._id);
    setPreviewImage(banner.image || "");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      await dispatch(deleteBanner(id));
      if (editingId === id) {
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      image: "",
      tag: "FEATURED",
      link: "/",
      priority: 5,
      isActive: true,
    });
    setEditingId(null);
    setPreviewImage("");
    setIsSubmitting(false);
  };

  const handleImageChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, image: value });
    setPreviewImage(value);
  };

  const updatePriority = (id, newPriority) => {
    const banner = banners.find((b) => b._id === id);
    if (banner) {
      dispatch(updateBanner({ id, bannerData: { ...banner, priority: newPriority } }));
    }
  };

  const toggleActive = (id, currentStatus) => {
    const banner = banners.find((b) => b._id === id);
    if (banner) {
      dispatch(updateBanner({ id, bannerData: { ...banner, isActive: !currentStatus } }));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
        <p className="text-gray-600 mt-2">
          Create and manage homepage banners for your store
        </p>
      </div>

      {/* Messages */}
      <div className="space-y-3 mb-6">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 font-medium">{error}</span>
            <button
              onClick={() => dispatch(clearError())}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">
              {editingId ? "Banner updated successfully!" : "Banner created successfully!"}
            </span>
            <button
              onClick={() => dispatch(clearSuccess())}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingId ? "Edit Banner" : "Create New Banner"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {editingId
                ? "Update your existing banner details"
                : "Add a new banner to display on homepage"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Form Grid */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter banner title"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max 100 characters
                </p>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter banner subtitle"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional, max 200 characters
                </p>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL *
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="url"
                      required
                      value={formData.image}
                      onChange={handleImageChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewImage(formData.image)
                    }
                    className="px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  >
                    <ImageIcon size={20} className="text-gray-600" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use high-quality image (1200x500 recommended)
                </p>
              </div>

              {/* Image Preview */}
              {previewImage && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-3 bg-gray-50 border-b">
                    <span className="text-sm font-medium text-gray-700">
                      Image Preview
                    </span>
                  </div>
                  <div className="p-4">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={() => setPreviewImage("")}
                    />
                  </div>
                </div>
              )}

              {/* Tag and Link */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tag
                  </label>
                  <select
                    value={formData.tag}
                    onChange={(e) =>
                      setFormData({ ...formData, tag: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    {tagOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: parseInt(e.target.value) || 5,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">1 (Low) - 10 (High)</p>
                </div>
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Redirect Link
                </label>
                <div className="flex items-center gap-2">
                  <LinkIcon size={18} className="text-gray-400" />
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="/category/toys or https://..."
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Where users will be redirected on click
                </p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">Status</span>
                  <p className="text-sm text-gray-500">
                    {formData.isActive
                      ? "Banner will be visible on homepage"
                      : "Banner will be hidden from homepage"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, isActive: !formData.isActive })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isActive ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : editingId ? (
                    <>
                      <Edit size={18} />
                      Update Banner
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Create Banner
                    </>
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Right Column - Banners List */}
        <div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="text-2xl font-bold text-gray-900">
                {banners.length}
              </div>
              <div className="text-sm text-gray-500">Total Banners</div>
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {banners.filter((b) => b.isActive).length}
              </div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {banners.filter((b) => b.priority >= 8).length}
              </div>
              <div className="text-sm text-gray-500">High Priority</div>
            </div>
          </div>

          {/* Banners List */}
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                All Banners ({banners.length})
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Drag to reorder (priority), click to edit
              </p>
            </div>

            <div className="divide-y">
              {loading && banners.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-gray-500">Loading banners...</p>
                </div>
              ) : banners.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No banners yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Create your first banner to display on homepage
                  </p>
                </div>
              ) : (
                banners
                  .sort((a, b) => b.priority - a.priority)
                  .map((banner, index) => (
                    <div
                      key={banner._id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-24 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/96x64?text=No+Image";
                            }}
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900 truncate">
                                {banner.title}
                              </h4>
                              {banner.subtitle && (
                                <p className="text-sm text-gray-600 truncate mt-1">
                                  {banner.subtitle}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  tagOptions.find((t) => t.value === banner.tag)
                                    ?.color || "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {banner.tag}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  banner.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {banner.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>Priority: {banner.priority}</span>
                            <span>•</span>
                            <span className="truncate">
                              Link: {banner.link}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleActive(banner._id, banner.isActive)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                              banner.isActive
                                ? "bg-red-50 text-red-700 hover:bg-red-100"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            {banner.isActive ? (
                              <>
                                <EyeOff size={14} />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye size={14} />
                                Activate
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleEdit(banner)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Priority Controls */}
                          {index > 0 && (
                            <button
                              onClick={() => updatePriority(banner._id, banner.priority + 1)}
                              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                              title="Increase priority"
                            >
                              <ArrowUp size={16} />
                            </button>
                          )}
                          {index < banners.length - 1 && (
                            <button
                              onClick={() => updatePriority(banner._id, banner.priority - 1)}
                              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                              title="Decrease priority"
                            >
                              <ArrowDown size={16} />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(banner._id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Banner Best Practices
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
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
      </div>
    </div>
  );
};

export default AdminBannerManager;