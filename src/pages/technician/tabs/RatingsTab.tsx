import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Calendar, 
  Filter,
  AlertTriangle,
  Search
} from 'lucide-react';
import { useTechnicianStore } from '../../../stores/technicianStore';
import type { Rating } from '../../../types/api';

// Rating Card Component
const RatingCard = ({ 
  rating, 
  onClick 
}: { 
  rating: Rating; 
  onClick: (ratingLinkId: number) => void;
}) => {
  const percentage = parseFloat(rating.percentage);
  const ratingValue = Math.round(percentage / 20); // Convert percentage to 1-5 scale
  
  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    if (percentage >= 75) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4 cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
      onClick={() => onClick(rating.rating_link_id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {rating.client_name}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(rating.submitted_at).toLocaleDateString()}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(percentage)}`}>
          {rating.percentage}%
        </div>
      </div>
      
      {/* Star Rating - Mobile Optimized Layout */}
      <div className="mb-3">
        <div className="flex items-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= ratingValue
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          ))}
          <span className="ml-2 text-base font-medium text-gray-900 dark:text-gray-100">
            {ratingValue}/5 Stars
          </span>
        </div>
        
        {/* Points Section - Below Rating */}
        <div className="flex items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Points Earned:</span>
          {rating.points_awarded_final !== null ? (
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              +{rating.points_awarded_final}
            </span>
          ) : (
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              +{rating.points_awarded_auto}
            </span>
          )}
        </div>
      </div>
      
      {rating.comments && (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            "{rating.comments}"
          </p>
        </div>
      )}
      
      {rating.points_awarded_final !== null && (
        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            ⚠️ Points adjusted by admin
          </p>
        </div>
      )}
    </div>
  );
};

// Filters Component
const RatingsFilters = ({ 
  onFilterChange 
}: { 
  onFilterChange: (filters: { start_date?: string; end_date?: string }) => void 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const applyFilters = () => {
    onFilterChange({
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });
    setShowFilters(false);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    onFilterChange({});
    setShowFilters(false);
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
      </button>
      
      {showFilters && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Clear
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function RatingsTab() {
  const navigate = useNavigate();
  const { 
    ratings, 
    ratingsPagination,
    fetchRatings, 
    isRatingsLoading, 
    error 
  } = useTechnicianStore();

  const [filters, setFilters] = useState<{ start_date?: string; end_date?: string }>({});

  useEffect(() => {
    fetchRatings({ page: 1, limit: 20, ...filters });
  }, [fetchRatings, filters]);

  const handleFilterChange = (newFilters: { start_date?: string; end_date?: string }) => {
    setFilters(newFilters);
  };

  const loadMore = () => {
    if (ratingsPagination && ratingsPagination.page < ratingsPagination.pages) {
      fetchRatings({ 
        page: ratingsPagination.page + 1, 
        limit: 20, 
        ...filters 
      });
    }
  };

  const handleRatingClick = (ratingLinkId: number) => {
    navigate(`/technician/rating/${ratingLinkId}`);
  };

  if (isRatingsLoading && ratings.length === 0) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 dark:text-red-400">
              Error loading ratings: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          My Ratings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {ratingsPagination?.total || 0} total ratings
        </p>
      </div>

      {/* Filters */}
      <RatingsFilters onFilterChange={handleFilterChange} />

      {/* Ratings List */}
      {ratings.length > 0 ? (
        <div>
          {ratings.map((rating) => (
            <RatingCard 
              key={rating.id} 
              rating={rating} 
              onClick={handleRatingClick}
            />
          ))}
          
          {/* Load More Button */}
          {ratingsPagination && ratingsPagination.page < ratingsPagination.pages && (
            <div className="text-center mt-6">
              <button
                onClick={loadMore}
                disabled={isRatingsLoading}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRatingsLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No ratings found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No ratings match your current filters.
          </p>
        </div>
      )}
    </div>
  );
}