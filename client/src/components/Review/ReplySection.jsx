// components/Review/ReplySection.js
import React, { useState } from 'react';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

const ReplySection = ({ review, getRandomAvatar, formatDate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="mt-3 md:mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-2"
      >
        <MessageCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
        <span>Replies ({review.replies.length})</span>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3 md:h-3.5 md:w-3.5" />
        ) : (
          <ChevronDown className="h-3 w-3 md:h-3.5 md:w-3.5" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-2 md:mt-3 space-y-2 md:space-y-3 pl-4 md:pl-6 border-l-2 border-blue-100 dark:border-blue-800">
          {review.replies.map((reply) => (
            <div
              key={reply._id}
              className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3 md:p-4"
            >
              <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                <img
                  src={getRandomAvatar(reply.userId?._id)}
                  alt={reply.userId?.name}
                  className="w-6 h-6 md:w-8 md:h-8 rounded-full"
                />
                <div>
                  <h6 className="font-medium text-gray-900 dark:text-white text-xs md:text-sm">
                    {reply.userId?.name}
                  </h6>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(reply.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-xs md:text-sm">
                {reply.review}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReplySection;