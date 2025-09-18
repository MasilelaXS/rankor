import { useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Award,
  AlertTriangle,
  Plus,
  Minus
} from 'lucide-react';
import { useTechnicianStore } from '../../../stores/technicianStore';
import type { PointAdjustment, MonthlyTimeline } from '../../../types/api';

// Points Adjustment Card
const AdjustmentCard = ({ adjustment }: { adjustment: PointAdjustment }) => {
  const isPositive = adjustment.points_change > 0;
  const Icon = isPositive ? Plus : Minus;
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bonus':
        return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'penalty':
        return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <div className={`p-1 rounded-full mr-2 ${
              isPositive 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <Icon className={`h-3 w-3 ${
                isPositive 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`} />
            </div>
            <span className={`text-lg font-bold ${
              isPositive 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {adjustment.points_change > 0 ? '+' : ''}{adjustment.points_change}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            {adjustment.reason}
          </p>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(adjustment.created_at).toLocaleDateString()}
            <span className="mx-2">•</span>
            <span>by {adjustment.admin_name}</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(adjustment.adjustment_category)}`}>
          {adjustment.adjustment_category}
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
        <span>Previous: {adjustment.previous_total}</span>
        <span>New Total: {adjustment.new_total}</span>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'blue' 
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color?: 'blue' | 'green' | 'red' | 'yellow';
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

// Monthly Timeline Component
const MonthlyTimeline = ({ timeline }: { timeline: MonthlyTimeline[] }) => {
  const maxPoints = Math.max(...timeline.map(t => t.points_at_month_end));
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Points Timeline
      </h3>
      <div className="space-y-3">
        {timeline.map((month, index) => {
          const barWidth = maxPoints > 0 ? (month.points_at_month_end / maxPoints) * 100 : 0;
          const netChange = month.net_points;
          
          return (
            <div key={index} className="flex items-center">
              <div className="w-16 text-xs text-gray-600 dark:text-gray-400 mr-3">
                {month.year}-{String(month.month).padStart(2, '0')}
              </div>
              <div className="flex-1 relative">
                <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all duration-300"
                    style={{ width: `${barWidth}%` }}
                  ></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-between px-2">
                  <span className="text-xs font-medium text-white">
                    {month.points_at_month_end} pts
                  </span>
                  {netChange !== 0 && (
                    <span className={`text-xs font-medium ${
                      netChange > 0 
                        ? 'text-green-300' 
                        : 'text-red-300'
                    }`}>
                      {netChange > 0 ? '+' : ''}{netChange}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function PointsTab() {
  const { 
    pointsData, 
    fetchPointsData, 
    isPointsLoading, 
    error 
  } = useTechnicianStore();

  useEffect(() => {
    fetchPointsData();
  }, [fetchPointsData]);

  if (isPointsLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          
          {/* Stats cards skeleton */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          
          {/* Timeline skeleton */}
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
          
          {/* Adjustments skeleton */}
          <div className="space-y-3">
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
              Error loading points data: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!pointsData) {
    return (
      <div className="p-4">
        <p className="text-gray-600 dark:text-gray-400">No points data available.</p>
      </div>
    );
  }

  const { 
    current_points, 
    adjustments_history, 
    monthly_timeline, 
    current_month_adjustments
  } = pointsData;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          Points Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your points history and adjustments
        </p>
      </div>

      {/* Current Points & Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          title="Current Points"
          value={current_points}
          subtitle="Total balance"
          icon={Award}
          color="blue"
        />
        <StatsCard
          title="This Month"
          value={current_month_adjustments.net_adjustment}
          subtitle="Net adjustment"
          icon={current_month_adjustments.net_adjustment.startsWith('-') ? TrendingDown : TrendingUp}
          color={current_month_adjustments.net_adjustment.startsWith('-') ? 'red' : 'green'}
        />
      </div>

      {/* Monthly Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          This Month's Summary
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              +{current_month_adjustments.bonus_points}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Bonus Points</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              {current_month_adjustments.penalty_points}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Penalties</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {current_month_adjustments.total_adjustments}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Adjustments</p>
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      {monthly_timeline.length > 0 && (
        <MonthlyTimeline timeline={monthly_timeline} />
      )}

      {/* Adjustment History */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Adjustments
        </h3>
        {adjustments_history.length > 0 ? (
          <div>
            {adjustments_history.map((adjustment) => (
              <AdjustmentCard key={adjustment.id} adjustment={adjustment} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No adjustments yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Your point adjustments will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}