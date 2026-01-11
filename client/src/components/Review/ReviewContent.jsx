// components/Review/ReviewContent.js
import React from 'react';
import { Textarea } from '../ui/textarea';
import StarRating from '../StarRating';

const ReviewContent = ({ 
  review, 
  isEditing, 
  editing, 
  setEditing, 
  isOwner, 
  loading 
}) => {
  if (isOwner && isEditing) {
    return (
      <div className="space-y-3 md:space-y-4 mt-2 md:mt-3">
        <Textarea
          value={editing.review}
          onChange={(e) =>
            setEditing((prev) => ({
              ...prev,
              review: e.target.value,
            }))
          }
          className="min-h-[80px] md:min-h-[100px] text-sm md:text-base"
        />
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Update Rating:
          </span>
          <StarRating
            rating={editing.rating}
            onRate={(value) =>
              setEditing((prev) => ({ ...prev, rating: value }))
            }
            size="sm"
          />
        </div>
      </div>
    );
  }

  return (
    <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base mt-2 md:mt-3 leading-relaxed">
      {review?.review}
    </p>
  );
};

export default ReviewContent;