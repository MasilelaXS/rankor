import { useEffect } from 'react';
import { 
  User, 
  Mail, 
  Calendar,
  Award,
  TrendingUp,
  Star,
  Trophy,
  Target,
  AlertTriangle,
  Badge
} from 'lucide-react';
import { useTechnicianStore } from '../../../stores/technicianStore';
import type { PerformanceStatus, RecentPerformance } from '../../../types/api';

// Performance Status Badge
const PerformanceStatusBadge = ({ status }: { status: PerformanceStatus }) => {
  const getStatusConfig = (statusType: string) => {
    switch (statusType) {
      case 'excellent':
        return {
          bg: 'bg-green-100 dark:bg-green-900/30',
          text: 'text-green-800 dark:text-green-300',
          icon: Trophy,
          label: '🌟 Excellent'
        };
      case 'good':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-800 dark:text-blue-300',
          icon: TrendingUp,
          label: '👍 Good'
        };
      case 'average':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          text: 'text-yellow-800 dark:text-yellow-300',
          icon: Target,
          label: '⚖️ Average'
        };
      case 'needs_improvement':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-800 dark:text-red-300',
          icon: AlertTriangle,
          label: '⚠️ Needs Improvement'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-900/30',
          text: 'text-gray-800 dark:text-gray-300',
          icon: User,
          label: '🆕 Building History'
        };
    }
  };

  const config = getStatusConfig(status.status);
  const Icon = config.icon;

  return (
    <div className={`rounded-xl p-6 ${config.bg} border border-opacity-20`}>
      <div className="flex items-center mb-3">
        <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg mr-3">
          <Icon className={`h-6 w-6 ${config.text}`} />
        </div>
        <div>
          <h3 className={`text-lg font-bold ${config.text}`}>
            {config.label}
          </h3>
          <p className={`text-sm ${config.text} opacity-80`}>
            Performance Status
          </p>
        </div>
      </div>
      <p className={`text-sm ${config.text}`}>
        {status.message}
      </p>
    </div>
  );
};

// Statistics Card
const StatCard = ({ 
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
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
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

// Badge Component
const BadgeCard = ({ 
  title, 
  description, 
  earned, 
  icon 
}: {
  title: string;
  description: string;
  earned: boolean;
  icon: string;
}) => {
  return (
    <div className={`rounded-xl p-4 border ${
      earned 
        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' 
        : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center mb-2">
        <span className="text-2xl mr-3">{icon}</span>
        <div className="flex-1">
          <h4 className={`font-semibold ${
            earned 
              ? 'text-yellow-800 dark:text-yellow-300' 
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {title}
          </h4>
          {earned && (
            <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full">
              Earned
            </span>
          )}
        </div>
      </div>
      <p className={`text-sm ${
        earned 
          ? 'text-yellow-700 dark:text-yellow-400' 
          : 'text-gray-500 dark:text-gray-400'
      }`}>
        {description}
      </p>
    </div>
  );
};

// Recent Performance Chart
const PerformanceChart = ({ performance }: { performance: RecentPerformance[] }) => {
  if (performance.length === 0) return null;

  const maxPercentage = 100;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Recent Performance Trend
      </h3>
      <div className="space-y-3">
        {performance.map((month, index) => {
          const percentage = parseFloat(month.month_percentage);
          const barWidth = (percentage / maxPercentage) * 100;
          
          return (
            <div key={index} className="flex items-center">
              <div className="w-20 text-sm text-gray-600 dark:text-gray-400 mr-3">
                {month.year}-{String(month.month).padStart(2, '0')}
              </div>
              <div className="flex-1 relative">
                <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <div 
                    className={`h-full rounded-lg transition-all duration-300 ${
                      percentage >= 90 
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : percentage >= 75
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                        : percentage >= 60
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  ></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-between px-2">
                  <span className="text-xs font-medium text-white">
                    {month.month_percentage}%
                  </span>
                  <span className="text-xs text-white opacity-80">
                    {month.total_ratings} ratings
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function ProfileTab() {
  const { 
    profileData, 
    fetchProfileData, 
    isProfileLoading, 
    error 
  } = useTechnicianStore();

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  if (isProfileLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse">
          {/* Status badge skeleton */}
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6"></div>
          
          {/* Profile info skeleton */}
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6"></div>
          
          {/* Stats grid skeleton */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          
          {/* Badges skeleton */}
          <div className="grid grid-cols-1 gap-3">
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
              Error loading profile: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-4">
        <p className="text-gray-600 dark:text-gray-400">No profile data available.</p>
      </div>
    );
  }

  const { 
    technician, 
    performance_status, 
    statistics, 
    recent_performance, 
    badges 
  } = profileData;

  const badgesList = [
    {
      key: 'top_performer',
      title: 'Top Performer',
      description: '85%+ average with 3+ ratings',
      icon: '🎯',
      earned: badges.top_performer
    },
    {
      key: 'has_excellent_rating',
      title: 'Excellent Rating',
      description: '90%+ average rating',
      icon: '⭐',
      earned: badges.has_excellent_rating
    },
    {
      key: 'consistent_performer',
      title: 'Consistent Performer',
      description: '75%+ over 2+ months',
      icon: '🔄',
      earned: badges.consistent_performer
    },
    {
      key: 'active_technician',
      title: 'Active Technician',
      description: '5+ total ratings',
      icon: '💪',
      earned: badges.active_technician
    }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          My Profile
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Performance status and achievements
        </p>
      </div>

      {/* Performance Status */}
      <PerformanceStatusBadge status={performance_status} />

      {/* Profile Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Profile Information
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{technician.name}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{technician.email}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Badge className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Employee ID</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{technician.employee_id}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {new Date(technician.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Total Points"
          value={statistics.total_points}
          subtitle="Lifetime earned"
          icon={Award}
          color="yellow"
        />
        <StatCard
          title="Total Ratings"
          value={statistics.total_ratings}
          subtitle="All time"
          icon={Star}
          color="blue"
        />
        <StatCard
          title="Average Score"
          value={`${statistics.average_percentage.toFixed(1)}%`}
          subtitle="Overall performance"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Good Ratings"
          value={statistics.good_ratings_count}
          subtitle="High performers"
          icon={Trophy}
          color="green"
        />
      </div>

      {/* Recent Performance Chart */}
      {recent_performance.length > 0 && (
        <PerformanceChart performance={recent_performance} />
      )}

      {/* Achievements & Badges */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Achievements
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {badgesList.map((badge) => (
            <BadgeCard
              key={badge.key}
              title={badge.title}
              description={badge.description}
              earned={badge.earned}
              icon={badge.icon}
            />
          ))}
        </div>
      </div>

      {/* Motivation Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center mb-3">
          <Trophy className="h-6 w-6 mr-3" />
          <h3 className="text-lg font-bold">Keep Going!</h3>
        </div>
        <p className="text-blue-100">
          Your dedication to excellent service makes a difference. Keep up the great work!
        </p>
      </div>
    </div>
  );
}