import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { createBanner, updateBanner } from "../../../redux/slices/bannerSlice";
import { Plus, Edit, ImageIcon, Tag, LinkIcon, Upload, X, Eye } from "lucide-react";

const BannerForm = ({
  initialData,
  onCancel,
  isEditing,
}) => {
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    tag: "FEATURED",
    link: "/",
    priority: 5,
    isActive: true,
  });

  const [previewImage, setPreviewImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  const tagOptions = [
    { value: "BEST SELLER", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
    { value: "POPULAR", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
    { value: "SALE", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
    { value: "NEW", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
    { value: "FEATURED", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
  ];

  // BannerForm.jsx - Add logging
useEffect(() => {

  if (initialData) {
    
    setFormData({
      title: initialData.title || "",
      subtitle: initialData.subtitle || "",
      image: initialData.image || "",
      tag: initialData.tag || "FEATURED",
      link: initialData.link || "/",
      priority: initialData.priority || 5,
      isActive: initialData.isActive !== undefined ? initialData.isActive : true,
    });
    setPreviewImage(initialData.image || "");
  } else {

  }
}, [initialData]);

// Also add to handleEdit in BannerManager
const handleEdit = (banner) => {
 
  setEditingBanner(banner);
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  
  // Validate required fields
  if (!formData.title || (!formData.image && !selectedFile && !initialData?.image)) {
    alert("Title and Image are required");
    return;
  }

  setLoading(true);

  try {
    // Create FormData object
    const submitFormData = new FormData();
    
    // 🔴 CRITICAL FIX: IMAGE HANDLING LOGIC
    // ============================================
    
    // CASE 1: User selected NEW file (create or edit)
    if (selectedFile) {
    
      submitFormData.append("image", selectedFile);
    }
    
    // CASE 2: Editing existing banner, NO new file selected
    else if (isEditing && initialData?.image) {
      // User is editing but didn't change the image
      
      
      // Check if formData.image is different from original
      if (formData.image !== initialData.image && formData.image.startsWith('http')) {
        // User entered a new URL manually
        submitFormData.append("image", formData.image);
     
      } else {
        // User didn't change image, keep the original
        submitFormData.append("image", initialData.image);
      }
    }
    
    // CASE 3: Creating new banner with URL (not file)
    else if (formData.image && formData.image.startsWith('http')) {
     
      submitFormData.append("image", formData.image);
    }
    
    // CASE 4: Blob URL error (user selected file but we have blob in formData)
    else if (formData.image && formData.image.startsWith('blob:')) {
    
      alert("Please complete the file upload by clicking 'Create Banner'");
      setLoading(false);
      return;
    }
    
    // CASE 5: No image at all
    else {
  
      alert("Please select an image or provide an image URL");
      setLoading(false);
      return;
    }
    
    // ============================================
    
    // Add all form fields as text
    submitFormData.append("title", formData.title);
    submitFormData.append("subtitle", formData.subtitle);
    submitFormData.append("tag", formData.tag);
    submitFormData.append("link", formData.link);
    submitFormData.append("priority", formData.priority.toString());
    submitFormData.append("isActive", formData.isActive.toString());

    // Debug what we're sending
  
    for (let [key, value] of submitFormData.entries()) {
      if (value instanceof File) {
   
      } else {
  
      }
    }

    if (isEditing && initialData?._id) {
   
      // Update banner
      await dispatch(updateBanner({
        id: initialData._id,
        formData: submitFormData
      })).unwrap();
      
      alert("Banner updated successfully!");
      handleReset();
    } else {
  
      // Create banner
      await dispatch(createBanner(submitFormData)).unwrap();
      alert("Banner created successfully!");
      handleReset();
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
    alert(error || "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const handleReset = () => {
    setFormData({
      title: "",
      subtitle: "",
      image: "",
      tag: "FEATURED",
      link: "/",
      priority: 5,
      isActive: true,
    });
    setPreviewImage("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (isEditing && onCancel) {
      onCancel();
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // Process selected file
  const processSelectedFile = (file) => {
    // File validation
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, WebP, GIF)');
      return;
    }

    if (file.size > maxSize) {
      alert('File size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const imageUrl = URL.createObjectURL(file);
    setFormData({ ...formData, image: imageUrl }); // Set blob URL temporarily
    setPreviewImage(imageUrl);
  };

  // Handle image URL input
  const handleImageUrlChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, image: value });
    setPreviewImage(value);
    setSelectedFile(null); // Clear file when URL is entered
  };

  // Clear selected image
  const handleClearImage = () => {
    setFormData({ ...formData, image: "" });
    setPreviewImage("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm transition-colors duration-200">
      <div className="p-6 border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isEditing ? "Edit Banner" : "Create New Banner"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {isEditing
            ? "Update your existing banner details"
            : "Add a new banner to display on homepage"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            placeholder="Enter banner title"
            maxLength={100}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Max 100 characters
          </p>
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subtitle
          </label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            placeholder="Enter banner subtitle"
            maxLength={200}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Optional, max 200 characters
          </p>
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Banner Image *
          </label>

          {/* Upload Area */}
          <div
            ref={dropRef}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
          >
            {selectedFile ? (
              // File Selected View
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="ml-auto p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    Change File
                  </button>
                  <button
                    type="button"
                    onClick={() => previewImage && setPreviewImage(previewImage)}
                    className="flex-1 py-2 px-4 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                </div>
              </div>
            ) : (
              // Upload Prompt View
              <div className="space-y-3">
                <div className="flex justify-center">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <Upload className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    Drag & drop your image here
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    or
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium transition-colors"
                >
                  Browse Files
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  JPG, PNG, WebP, GIF up to 5MB
                </p>
              </div>
            )}

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Manual URL Input (Alternative) */}
          <div className="mt-4">
            <div className="flex items-center mb-2">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              <span className="px-3 text-sm text-gray-500 dark:text-gray-400">Or enter URL</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="url"
                  value={formData.image}
                  onChange={handleImageUrlChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <button
                type="button"
                onClick={() => formData.image && setPreviewImage(formData.image)}
                disabled={!formData.image}
                className={`px-4 rounded-lg transition-colors flex items-center gap-2 ${
                  formData.image
                    ? "bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
              >
                <Eye size={18} />
                Preview
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Recommended size: 1200×500 pixels for optimal display
          </p>
        </div>

        {/* Image Preview */}
        {previewImage && (
          <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Image Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage("")}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
                onError={() => {
                  setPreviewImage("");
                  alert('Failed to load image. Please check the URL or upload a valid image.');
                }}
              />
            </div>
          </div>
        )}

        {/* Tag and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tag
            </label>
            <select
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            >
              {tagOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 5 })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              1 (Low) - 10 (High)
            </p>
          </div>
        </div>

        {/* Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Redirect Link
          </label>
          <div className="flex items-center gap-2">
            <LinkIcon size={18} className="text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              placeholder="/category/toys or https://..."
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Where users will be redirected on click
          </p>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <span className="font-medium text-gray-900 dark:text-white">Status</span>
            <p className="text-sm text-gray-500 dark:text-gray-400">
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
              formData.isActive 
                ? "bg-blue-600 dark:bg-blue-500" 
                : "bg-gray-300 dark:bg-gray-600"
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
        <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : isEditing ? (
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

          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {isEditing ? "Cancel" : "Reset"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BannerForm;