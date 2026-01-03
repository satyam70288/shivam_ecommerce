import React from "react";
import { Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";

const BannerCard = ({
  banner,
  index,
  total,
  onEdit,
  onDelete,
  onToggleActive,
  onIncreasePriority,
  onDecreasePriority,
}) => {
  const tagColors = {
    "BEST SELLER": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    "POPULAR": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    "SALE": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    "NEW": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    "TRENDING": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    "FEATURED": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    "HOT": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  };

  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
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
              <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                {banner.title}
              </h4>
              {banner.subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                  {banner.subtitle}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  tagColors[banner.tag] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {banner.tag}
              </span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  banner.isActive
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {banner.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
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
            onClick={onToggleActive}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              banner.isActive
                ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
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
            onClick={onEdit}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Edit size={14} />
            Edit
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Priority Controls */}
          {index > 0 && (
            <button
              onClick={onIncreasePriority}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Increase priority"
            >
              <ArrowUp size={16} />
            </button>
          )}
          {index < total - 1 && (
            <button
              onClick={onDecreasePriority}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Decrease priority"
            >
              <ArrowDown size={16} />
            </button>
          )}

          <button
            onClick={onDelete}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerCard;