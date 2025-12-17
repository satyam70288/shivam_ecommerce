// components/Product/RatingBadge.jsx
import { Star } from 'lucide-react';

const RatingBadge = ({ rating, reviewCount }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-md">
        <span className="font-bold">{rating || 0}</span>
        <Star size={14} fill="currentColor" />
      </div>
      <span className="text-gray-600 dark:text-gray-400">
        ({reviewCount || 0} {reviewCount === 1 ? 'Review' : 'Reviews'})
      </span>
    </div>
  );
};

export default RatingBadge;