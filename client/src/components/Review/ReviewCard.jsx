// components/Review/ReviewCard.js
import React, { memo } from 'react';
import ReviewHeader from './ReviewHeader';
import ReviewContent from './ReviewContent';
import ReviewActions from './ReviewActions';
import ReplySection from './ReplySection';

const ReviewCard = memo(({ 
  review, 
  user, 
  isEditing, 
  editing, 
  setEditing,
  replyingTo,
  setReplyingTo,
  newReply,
  setNewReply,
  loading,
  handleAddReply,
  handleEditReview,
  handleDeleteReview,
  formatDate,
  getRandomAvatar 
}) => {
  const isOwner = user?.id === review?.userId?._id;
  const hasReplies = review?.replies?.length > 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800 hover:shadow-sm md:hover:shadow-md transition-all">
      {/* Header */}
      <ReviewHeader 
        review={review}
        user={user}
        formatDate={formatDate}
        getRandomAvatar={getRandomAvatar}
      />
      
      {/* Content */}
      <ReviewContent 
        review={review}
        isEditing={isEditing}
        editing={editing}
        setEditing={setEditing}
        isOwner={isOwner}
        loading={loading}
      />
      
      {/* Replies */}
      {hasReplies && (
        <ReplySection 
          review={review}
          getRandomAvatar={getRandomAvatar}
          formatDate={formatDate}
        />
      )}
      
      {/* Actions */}
      <ReviewActions 
        review={review}
        isOwner={isOwner}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        newReply={newReply}
        setNewReply={setNewReply}
        loading={loading}
        handleAddReply={handleAddReply}
        handleEditReview={handleEditReview}
        handleDeleteReview={handleDeleteReview}
        isEditing={isEditing}
        setEditing={setEditing}
      />
    </div>
  );
});

ReviewCard.displayName = 'ReviewCard';
export default ReviewCard;