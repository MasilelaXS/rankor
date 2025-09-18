import { useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  TrendingUp,
  Crown,
  AlertTriangle,
  Medal
} from 'lucide-react';
import { useTechnicianStore } from '../../../stores/technicianStore';
import type { LeaderboardEntry, CurrentUserPosition, TopPerformer } from '../../../types/api';

// Leaderboard Entry Component
const LeaderboardCard = ({ 
  entry, 
  rank 
}: { 
  entry: LeaderboardEntry; 
  rank: number;
}) => {
  const isCurrentUser = entry.is_current_user === 1;
  
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-orange-500" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{position}</span>;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-500';
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-500';
    }
  };

  return (
    <div className={`rounded-xl shadow-sm border p-4 mb-3 ${
      isCurrentUser 
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 ring-2 ring-red-300 dark:ring-red-700' 
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Rank Badge */}
          <div className={`w-12 h-12 rounded-full ${getRankColor(rank)} flex items-center justify-center`}>
            {getRankIcon(rank)}
          </div>
          
          {/* Technician Info */}
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className={`font-semibold ${
                isCurrentUser 
                  ? 'text-red-900 dark:text-red-100' 
                  : 'text-gray-900 dark:text-gray-100'
              }`}>
                {entry.name}
              </h3>
              {isCurrentUser && (
                <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                  You
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center">
                <Star className="h-3 w-3 text-yellow-400 mr-1" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {entry.total_points} pts
                </span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {entry.month_percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Month Stats */}
        <div className="text-right">
          <p className={`text-lg font-bold ${
            isCurrentUser 
              ? 'text-red-700 dark:text-red-300' 
              : 'text-gray-900 dark:text-gray-100'
          }`}>
            +{entry.month_points}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {entry.month_ratings} ratings
          </p>
        </div>
      </div>
    </div>
  );
};

// Current Position Card
const CurrentPositionCard = ({ position }: { position: CurrentUserPosition }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">Your Current Position</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              <span className="text-2xl font-bold">#{position.rank}</span>
            </div>
            <div className="text-blue-100">
              of {position.total_technicians} technicians
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-blue-100 text-sm">Points to #1</p>
          <p className="text-2xl font-bold">{position.points_to_first}</p>
        </div>
      </div>
    </div>
  );
};

// Top Performer Card
const TopPerformerCard = ({ performer }: { performer: TopPerformer }) => {
  return (
    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-4 text-yellow-900 mb-6">
      <div className="flex items-center">
        <div className="p-2 bg-white/20 rounded-lg mr-3">
          <Crown className="h-6 w-6" />
        </div>
        <div>
          <p className="font-semibold">Top Performer</p>
          <p className="text-lg font-bold">{performer.name}</p>
          <p className="text-sm opacity-80">{performer.total_points} points</p>
        </div>
      </div>
    </div>
  );
};

export default function LeaderboardTab() {
  const { 
    leaderboardData, 
    fetchLeaderboardData, 
    isLeaderboardLoading, 
    error 
  } = useTechnicianStore();

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  if (isLeaderboardLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          
          {/* Position card skeleton */}
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6"></div>
          
          {/* Top performer skeleton */}
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6"></div>
          
          {/* Leaderboard skeleton */}
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
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
              Error loading leaderboard: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!leaderboardData) {
    return (
      <div className="p-4">
        <p className="text-gray-600 dark:text-gray-400">No leaderboard data available.</p>
      </div>
    );
  }

  const { 
    leaderboard, 
    current_user_position, 
    top_performer, 
    month_context 
  } = leaderboardData;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          Leaderboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {month_context.month_name} Rankings
        </p>
      </div>

      {/* Current Position */}
      <CurrentPositionCard position={current_user_position} />

      {/* Top Performer */}
      <TopPerformerCard performer={top_performer} />

      {/* Leaderboard List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Rankings
        </h3>
        
        {leaderboard.length > 0 ? (
          <div>
            {leaderboard.map((entry, index) => (
              <LeaderboardCard 
                key={entry.id} 
                entry={entry} 
                rank={index + 1}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No rankings available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Rankings will appear here once data is available.
            </p>
          </div>
        )}
      </div>

      {/* Refresh Note */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-xl">
        <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
          💡 Rankings are updated in real-time based on current month performance
        </p>
      </div>
    </div>
  );
}