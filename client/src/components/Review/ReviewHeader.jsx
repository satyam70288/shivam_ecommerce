// components/Review/ReviewHeader.js (most optimized)
import React from 'react';
import { Star } from 'lucide-react';

const ReviewHeader = ({ review, formatDate, getRandomAvatar }) => {
  const avatar = getRandomAvatar(review?.userId?._id);
  const rating = review?.rating || 0;
  const userName = review?.userId?.name || "Anonymous User";
  const shortName = userName.split(' ')[0];
  const date = review?.createdAt;

  // Single function to render stars with dynamic size
  const renderStars = (size) => (
    <div className="flex">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={size}
          className={index < rating 
            ? "fill-amber-400 text-amber-400" 
            : "text-gray-300 dark:text-gray-600"
          }
        />
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={avatar}
            alt={userName}
            className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 object-cover"
          />
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              {shortName}
            </h4>
            <div className="flex items-center gap-1 mt-0.5">
              {renderStars(12)}
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-500 ml-1">
                {rating}.0
              </span>
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-start gap-4 mb-4">
        <img 
          src={avatar}
          alt={userName}
          className="w-12 h-12 rounded-full flex-shrink-0"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {userName}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {renderStars(14)}
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-500">
                  {rating}.0
                </span>
              </div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(date)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewHeader;