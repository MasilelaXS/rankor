import { useState, useEffect } from 'react';
import {
  Trophy,
  TrendingUp,
  Star,
  Award,
  Users,
  RefreshCw,
  Calendar,
  Timer,
  Activity,
  Zap
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import type { LeaderboardData } from '../../types/api';

const PublicLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchLeaderboard = async () => {
    try {
      setError(null);
      const data = await apiService.getPublicLeaderboard();
      setLeaderboardData(data);
    } catch (err) {
      console.error('Failed to fetch public leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchLeaderboard();
    
    const refreshInterval = setInterval(fetchLeaderboard, 30000);
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    
    return () => {
      clearInterval(refreshInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const getPerformanceIcon = (level: string) => {
    switch (level) {
      case 'excellent':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'good':
        return <Star className="h-6 w-6 text-blue-500" />;
      case 'average':
        return <Activity className="h-6 w-6 text-yellow-600" />;
      case 'needs_improvement':
        return <TrendingUp className="h-6 w-6 text-red-500" />;
      default:
        return <Award className="h-6 w-6 text-gray-500" />;
    }
  };

  const getPerformanceGradient = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'from-yellow-400 to-yellow-600';
      case 'good':
        return 'from-blue-400 to-blue-600';
      case 'average':
        return 'from-yellow-500 to-orange-500';
      case 'needs_improvement':
        return 'from-red-400 to-red-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getRankDisplay = (position: number) => {
    if (position === 1) {
      return (
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-lg">
          <Trophy className="h-8 w-8 text-white" />
        </div>
      );
    }
    if (position === 2) {
      return (
        <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full shadow-lg">
          <Award className="h-7 w-7 text-white" />
        </div>
      );
    }
    if (position === 3) {
      return (
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full shadow-lg">
          <Award className="h-6 w-6 text-white" />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow">
        <span className="text-white font-bold text-lg">#{position}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white">Loading Leaderboard...</h2>
        </div>
      </div>
    );
  }

  if (error || !leaderboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-red-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Unable to Load Leaderboard</h2>
          <p className="text-red-200 mb-6">{error || 'No data available'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-red-800 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const topThree = leaderboardData.leaderboard.slice(0, 3);
  const remainingTechnicians = leaderboardData.leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
                <Trophy className="h-8 w-8 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Technician Leaderboard
                </h1>
                <p className="text-xl text-blue-200">
                  {leaderboardData.period.month_name} {leaderboardData.period.year}
                  {leaderboardData.period.is_current_month && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                      <Zap className="h-3 w-3 mr-1" />
                      Live
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-6 text-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-300" />
                  <span>{leaderboardData.summary.total_active_technicians} Technicians</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-300" />
                  <span>{leaderboardData.summary.total_ratings_this_month} Ratings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Timer className="h-5 w-5 text-green-300" />
                  <span>{currentTime.toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="mt-2 text-blue-200">
                <div className="flex items-center justify-end space-x-2">
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-sm">Auto-refresh every 30s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-center space-x-8 mb-12">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="text-center transform -translate-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
                    <div className="flex justify-center mb-4">
                      {getRankDisplay(2)}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{topThree[1].name}</h3>
                    <div className="space-y-2">
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-2xl font-bold text-yellow-400">{topThree[1].points_this_month}</div>
                        <div className="text-sm text-gray-300">Points</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-lg font-semibold">{topThree[1].avg_percentage_this_month}%</div>
                        <div className="text-sm text-gray-300">Average</div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-center">
                      {getPerformanceIcon(topThree[1].performance_level)}
                    </div>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 backdrop-blur-sm rounded-2xl p-8 border border-yellow-400/30 shadow-2xl transform scale-110">
                  <div className="flex justify-center mb-6">
                    {getRankDisplay(1)}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{topThree[0].name}</h3>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-lg p-4">
                      <div className="text-3xl font-bold text-yellow-400">{topThree[0].points_this_month}</div>
                      <div className="text-sm text-yellow-200">Points This Month</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-xl font-semibold">{topThree[0].avg_percentage_this_month}%</div>
                      <div className="text-sm text-gray-300">Average Rating</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-lg font-semibold">{topThree[0].ratings_this_month}</div>
                      <div className="text-sm text-gray-300">Ratings Received</div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-center">
                    <Trophy className="h-8 w-8 text-yellow-400" />
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="text-center transform -translate-y-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
                    <div className="flex justify-center mb-4">
                      {getRankDisplay(3)}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{topThree[2].name}</h3>
                    <div className="space-y-2">
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-2xl font-bold text-orange-400">{topThree[2].points_this_month}</div>
                        <div className="text-sm text-gray-300">Points</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-lg font-semibold">{topThree[2].avg_percentage_this_month}%</div>
                        <div className="text-sm text-gray-300">Average</div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-center">
                      {getPerformanceIcon(topThree[2].performance_level)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remaining Rankings */}
      {remainingTechnicians.length > 0 && (
        <div className="px-8 pb-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Complete Rankings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {remainingTechnicians.map((technician) => (
                <div
                  key={technician.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getRankDisplay(technician.rank_position)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{technician.name}</h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-400">{technician.points_this_month}</div>
                          <div className="text-xs text-gray-400">Points</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{technician.avg_percentage_this_month}%</div>
                          <div className="text-xs text-gray-400">Average</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{technician.ratings_this_month}</div>
                          <div className="text-xs text-gray-400">Ratings</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getPerformanceIcon(technician.performance_level)}
                          <span className="text-sm capitalize text-gray-300">
                            {technician.performance_level.replace('_', ' ')}
                          </span>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getPerformanceGradient(technician.performance_level)}`}>
                          {technician.activity_level.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-black/20 px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="text-sm text-gray-300">
              Overall Team Performance: <span className="font-semibold text-white">{leaderboardData.summary.overall_avg_percentage}%</span>
            </div>
            <div className="text-sm text-gray-300">
              Total Points Awarded: <span className="font-semibold text-white">{leaderboardData.summary.total_points_awarded}</span>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Updated: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicLeaderboard;