import { useEffect } from 'react';
import { 
  BarChart3, 
  Star, 
  TrendingUp, 
  Trophy,
  AlertTriangle
} from 'lucide-react';
import { useTechnicianStore } from '../../../stores/technicianStore';

// Performance Card Component
const PerformanceCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'blue' 
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          {change && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{change}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

// Quick Action Button
const QuickActionButton = ({ 
  icon: Icon, 
  label, 
  onClick 
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 active:scale-95 active:bg-gray-100 dark:active:bg-gray-600"
    >
      <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <Icon className="h-5 w-5 text-red-600 dark:text-red-400" />
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center leading-tight">{label}</span>
    </button>
  );
};

export default function DashboardTab({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { 
    dashboardData, 
    fetchDashboardData, 
    isDashboardLoading, 
    error 
  } = useTechnicianStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isDashboardLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse">
          {/* Welcome skeleton */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-6"></div>
          
          {/* Cards skeleton */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          
          {/* Quick actions skeleton */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
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
              Error loading dashboard: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-4">
        <p className="text-gray-600 dark:text-gray-400">No dashboard data available.</p>
      </div>
    );
  }

  const { technician, summary, this_month, activity } = dashboardData;

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          Welcome back, {technician.name}!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Here's your performance overview
        </p>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <PerformanceCard
          title="Total Points"
          value={summary.total_points}
          change="Lifetime earned"
          icon={Star}
          color="yellow"
        />
        <PerformanceCard
          title="Current Rank"
          value={`#${summary.current_rank}`}
          change={`of ${summary.total_technicians}`}
          icon={Trophy}
          color="blue"
        />
        <PerformanceCard
          title="Performance"
          value={`${summary.average_percentage.toFixed(1)}%`}
          change={`${summary.total_ratings} total ratings`}
          icon={BarChart3}
          color="green"
        />
        <PerformanceCard
          title="This Month"
          value={`${this_month.performance_percentage}%`}
          change={`${this_month.ratings_count} ratings`}
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* This Month Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          This Month's Performance
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {this_month.good_ratings}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Good Ratings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {this_month.bad_ratings}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Poor Ratings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              +{this_month.points_earned}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Points Earned</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <QuickActionButton
            icon={Star}
            label="View Ratings"
            onClick={() => onNavigate?.('ratings')}
          />
          <QuickActionButton
            icon={TrendingUp}
            label="Points History"
            onClick={() => onNavigate?.('points')}
          />
          <QuickActionButton
            icon={Trophy}
            label="Leaderboard"
            onClick={() => onNavigate?.('leaderboard')}
          />
        </div>
      </div>

      {/* Recent Activity */}
      {activity.recent_ratings_7_days > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-xl p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg mr-3">
              <Star className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Recent Activity
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {activity.recent_ratings_7_days} new ratings in the last 7 days
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}