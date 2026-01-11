// components/Review/ReviewActions.js
import React from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  Edit2, 
  Delete, 
  Reply, 
  MoreVertical,
  Send,
  X,
  CheckCircle,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const ReviewActions = ({
  review,
  isOwner,
  replyingTo,
  setReplyingTo,
  newReply,
  setNewReply,
  loading,
  handleAddReply,
  handleEditReview,
  handleDeleteReview,
  isEditing,
  setEditing
}) => {
  const isReplying = replyingTo === review._id;

  return (
    <div className="mt-4">
      {/* Mobile Action Buttons - Always Visible */}
      <div className="md:hidden">
        {/* Primary Action Bar */}
        <div className="flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20 rounded-lg p-2">
          {/* Reply Button - Everyone can reply */}
          <button
            onClick={() => setReplyingTo(isReplying ? null : review._id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              isReplying 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            {isReplying ? (
              <>
                <X className="h-4 w-4" />
                <span className="text-sm font-medium">Cancel</span>
              </>
            ) : (
              <>
                <Reply className="h-4 w-4" />
                <span className="text-sm font-medium">Reply</span>
              </>
            )}
          </button>

          {/* Owner Actions Dropdown */}
          {isOwner && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => handleEditReview(review._id)}
                    disabled={loading.update}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {loading.update ? "Saving..." : "Save"}
                    </span>
                  </button>
                  <button
                    onClick={() => setEditing({
                      status: false,
                      reviewId: null,
                      review: "",
                      rating: 0,
                    })}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span className="text-sm font-medium">Cancel</span>
                  </button>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors">
                      <MoreVertical className="h-4 w-4" />
                      <span className="text-sm font-medium">More</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-48 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg"
                  >
                    

                    <DropdownMenuItem 
                      onClick={() => setEditing({
                        status: true,
                        reviewId: review._id,
                        review: review.review,
                        rating: review.rating,
                      })}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-700 dark:text-gray-300 mt-1"
                    >
                      <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                        <Edit2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Edit Review</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Update your review content
                        </p>
                      </div>
                    </DropdownMenuItem>

                    <div className="h-px bg-gray-200 dark:bg-gray-800 my-2" />

                    <DropdownMenuItem 
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this review?")) {
                          handleDeleteReview(review._id);
                        }
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer text-red-600 dark:text-red-400 mt-1"
                    >
                      <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
                        <Trash2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Delete Review</p>
                        <p className="text-xs text-red-500 dark:text-red-400/80">
                          Remove this review permanently
                        </p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Actions */}
      <div className="hidden md:flex items-center justify-between mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex gap-3 md:gap-4">
          <button
            onClick={() => setReplyingTo(isReplying ? null : review._id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              isReplying 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600'
            }`}
          >
            <Reply className="h-4 w-4" />
            <span className="text-sm font-medium">
              {isReplying ? 'Cancel Reply' : 'Reply'}
            </span>
          </button>
        </div>

        {isOwner && (
          <div className="flex gap-3 md:gap-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => handleEditReview(review._id)}
                  disabled={loading.update}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {loading.update ? "Saving..." : "Save Changes"}
                  </span>
                </button>
                <button
                  onClick={() => setEditing({
                    status: false,
                    reviewId: null,
                    review: "",
                    rating: 0,
                  })}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                >
                  <X className="h-4 w-4" />
                  <span className="text-sm font-medium">Cancel</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing({
                    status: true,
                    reviewId: review._id,
                    review: review.review,
                    rating: review.rating,
                  })}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteReview(review._id)}
                  disabled={loading.delete}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {loading.delete ? "Deleting..." : "Delete"}
                  </span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Reply Input Form - Enhanced for Mobile */}
      {isReplying && (
        <div className="mt-4 p-4 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-900/10 dark:to-gray-900 rounded-xl border border-blue-100 dark:border-blue-800/30 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Write a Reply
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your reply will be visible to everyone
              </p>
            </div>
            <button
              onClick={() => {
                setReplyingTo(null);
                setNewReply({ review: "" });
              }}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          
          <Textarea
            placeholder="Type your thoughtful reply here..."
            value={newReply.review}
            onChange={(e) => setNewReply({ review: e.target.value })}
            className="mb-3 text-sm min-h-[80px] md:min-h-[100px] rounded-lg border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-900"
            autoFocus
          />
          
          <div className="flex gap-2">
            <Button
              onClick={() => handleAddReply(review._id)}
              disabled={loading.reply || !newReply.review.trim()}
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm"
            >
              {loading.reply ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                  Posting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-3.5 w-3.5" />
                  Post Reply
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setReplyingTo(null);
                setNewReply({ review: "" });
              }}
              className="flex-1 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>
          
          {/* Character counter */}
          <div className="mt-2 text-right">
            <span className={`text-xs ${
              newReply.review.length > 500 
                ? 'text-red-500' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {newReply.review.length}/500 characters
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewActions;