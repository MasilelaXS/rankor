import { useState, useEffect } from 'react';
import {
  Trophy,
  TrendingUp,
  Star,
  Users,
  RefreshCw,
  Activity,
  Zap,
  Crown,
  BarChart3,
  TrendingDown
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import type { LeaderboardData } from '../../types/api';

// Type for actual API response
type ApiLeaderboardTechnician = {
  id: number;
  name: string;
  overall_points: number;
  current_month_points: number;
  current_month_percentage: string;
  current_month_ratings: number;
  overall_rank: number;
  monthly_rank: number;
  points_growth: number;
  percentage_growth: string;
  performance_level?: string;
  activity_level?: string;
};

const PublicLeaderboard = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [nextScreen, setNextScreen] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Slideshow configuration
  const SCREEN_DURATION = 300000; // 5 minutes per screen
  const TOTAL_SCREENS = 4;

  const fetchLeaderboard = async (isInitialLoad = false) => {
    try {
      setError(null);
      const data = await apiService.getPublicLeaderboard();
      setLeaderboardData(data);
    } catch (err) {
      console.error('Failed to fetch public leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      // Only set loading to false on initial load
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  // Auto-refresh and slideshow management
  useEffect(() => {
    // Initial load with loading indicator
    fetchLeaderboard(true);
    
    // Update data every full cycle (4 screens × 5 minutes = 20 minutes) - silent updates
    const FULL_CYCLE_DURATION = SCREEN_DURATION * TOTAL_SCREENS;
    const refreshInterval = setInterval(() => fetchLeaderboard(false), FULL_CYCLE_DURATION);
    
    // Update time display every second
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Advance slideshow screen every 5 minutes with smooth transitions
    const slideInterval = setInterval(() => {
      setIsTransitioning(true);
      setNextScreen(prev => (prev + 1) % TOTAL_SCREENS);
      
      // After transition animation starts, update current screen
      setTimeout(() => {
        setCurrentScreen(prevScreen => (prevScreen + 1) % TOTAL_SCREENS);
        setIsTransitioning(false);
      }, 500); // Half second transition
    }, SCREEN_DURATION);
    
    return () => {
      clearInterval(refreshInterval);
      clearInterval(timeInterval);
      clearInterval(slideInterval);
    };
  }, [SCREEN_DURATION, TOTAL_SCREENS]);

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

  // Prepare data for different screens
  const allTechnicians = leaderboardData.leaderboard as unknown as ApiLeaderboardTechnician[];
  const topThree = allTechnicians.slice(0, 3);
  const lowerTier = allTechnicians.slice(8, 13); // Positions 9-13

  // Screen Components
  const renderTopThreeScreen = () => (
    <div className="h-screen flex flex-col justify-center px-12 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center items-center mb-6">
          <Trophy className="h-16 w-16 text-yellow-400 mr-4" />
          <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            TOP 3 CHAMPIONS
          </h1>
          <Trophy className="h-16 w-16 text-yellow-400 ml-4" />
        </div>
        <p className="text-2xl text-blue-200">This Month's Elite Performers</p>
      </div>

      {/* Clean Top 3 Display */}
      <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* First Place - Center */}
        {topThree[0] && (
          <div className="order-2 text-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl p-8 mb-6 shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Crown className="h-12 w-12 text-white drop-shadow-lg" />
                </div>
                <div className="mt-4">
                  <div className="text-6xl font-bold text-white mb-2">1ST</div>
                  <h3 className="text-2xl font-bold text-white mb-4">{topThree[0].name}</h3>
                  <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-4xl font-bold text-white mb-1">{topThree[0].current_month_points}</div>
                    <div className="text-lg text-yellow-100">Points • {topThree[0].current_month_percentage}%</div>
                    <div className="text-sm text-yellow-200 mt-2">{topThree[0].current_month_ratings} ratings</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Second Place - Left */}
        {topThree[1] && (
          <div className="order-1 text-center">
            <div className="bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 rounded-2xl p-6 mb-6 shadow-xl">
              <div className="text-4xl font-bold text-white mb-2">2ND</div>
              <h3 className="text-xl font-bold text-white mb-4">{topThree[1].name}</h3>
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-3xl font-bold text-white mb-1">{topThree[1].current_month_points}</div>
                <div className="text-base text-gray-200">{topThree[1].current_month_percentage}%</div>
                <div className="text-sm text-gray-300 mt-1">{topThree[1].current_month_ratings} ratings</div>
              </div>
            </div>
          </div>
        )}

        {/* Third Place - Right */}
        {topThree[2] && (
          <div className="order-3 text-center">
            <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-2xl p-6 mb-6 shadow-xl">
              <div className="text-4xl font-bold text-white mb-2">3RD</div>
              <h3 className="text-xl font-bold text-white mb-4">{topThree[2].name}</h3>
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-3xl font-bold text-white mb-1">{topThree[2].current_month_points}</div>
                <div className="text-base text-orange-200">{topThree[2].current_month_percentage}%</div>
                <div className="text-sm text-orange-300 mt-1">{topThree[2].current_month_ratings} ratings</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-12">
        <div className="text-2xl text-blue-200 mb-2">🎉 Outstanding Performance! 🎉</div>
        <div className="text-lg text-blue-300">Leading the way in customer satisfaction</div>
      </div>
    </div>
  );

  const renderPerformanceChartScreen = () => {
    // Show positions 4+ (remaining technicians after top 3) with proper bounds checking
    const chartData = allTechnicians.slice(3); // Get all remaining after top 3
    const startPosition = 4;
    const endPosition = Math.min(startPosition + chartData.length - 1, allTechnicians.length);
    
    return (
      <div className="h-screen flex flex-col justify-center px-6 py-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex justify-center items-center mb-2">
            <BarChart3 className="h-8 w-8 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold">PERFORMANCE RANKINGS</h1>
          </div>
          <p className="text-lg text-blue-200">
            Positions {startPosition}-{endPosition} • Current Month Performance
          </p>
        </div>

        {/* Three Column Grid Layout - Left to Right, Then Next Row */}
        <div className="grid grid-cols-3 gap-3 max-w-7xl mx-auto w-full">
          {chartData.map((tech, index) => {
            const position = index + 4;
            const isImproving = (tech.points_growth || 0) > 0;
            
            return (
              <div key={tech.id} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm flex items-center space-x-3">
                {/* Position Badge */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">{position}</span>
                </div>
                
                {/* Technician Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-bold text-white truncate">{tech.name}</h3>
                    <div className="text-right flex-shrink-0">
                      <div className="text-base font-bold text-blue-400">{tech.current_month_points}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-blue-200">
                      <Star className="h-3 w-3" />
                      <span>{tech.current_month_ratings}</span>
                      {isImproving ? (
                        <TrendingUp className="h-3 w-3 text-green-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                      <span className={isImproving ? 'text-green-400' : 'text-red-400'}>
                        {Math.abs(tech.points_growth || 0)}
                      </span>
                    </div>
                    <span className="text-gray-300">{tech.current_month_percentage}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-4">
          <div className="text-base text-blue-200">
            <Activity className="inline h-4 w-4 mr-2" />
            Showing {chartData.length} of {allTechnicians.length} technicians • Live updates
          </div>
        </div>
      </div>
    );
  };

  const renderRankingsTableScreen = () => (
    <div className="h-screen flex flex-col justify-center px-8 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">COMPLETE RANKINGS</h1>
        <p className="text-xl text-blue-200">Positions 9 and below</p>
      </div>

      {/* Rankings Grid */}
      <div className="grid grid-cols-2 gap-6 max-w-6xl mx-auto">
        {lowerTier.map((tech, index) => {
          const position = index + 9;
          const isImproving = tech.points_growth > 0;
          
          return (
            <div key={tech.id} className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    {position}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{tech.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <span>{tech.current_month_ratings} ratings</span>
                      <span>•</span>
                      <span>{tech.current_month_percentage}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">{tech.current_month_points}</div>
                  <div className={`flex items-center text-sm ${isImproving ? 'text-green-400' : 'text-red-400'}`}>
                    {isImproving ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="ml-1">{isImproving ? '+' : ''}{tech.points_growth}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-8 text-blue-200">
        <Activity className="inline h-5 w-5 mr-2" />
        Keep up the great work! Every rating counts.
      </div>
    </div>
  );

  const renderSummaryScreen = () => (
    <div className="h-screen flex flex-col justify-center px-8 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">MONTHLY HIGHLIGHTS</h1>
        <p className="text-xl text-blue-200">Monthly Summary</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto mb-8">
        <div className="bg-white/10 rounded-xl p-8 text-center backdrop-blur-sm">
          <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <div className="text-4xl font-bold text-white mb-2">{allTechnicians.length}</div>
          <div className="text-lg text-blue-200">Total Technicians</div>
        </div>

        <div className="bg-white/10 rounded-xl p-8 text-center backdrop-blur-sm">
          <Activity className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <div className="text-4xl font-bold text-white mb-2">{allTechnicians.filter(t => t.current_month_ratings > 0).length}</div>
          <div className="text-lg text-green-200">Active This Month</div>
        </div>

        <div className="bg-white/10 rounded-xl p-8 text-center backdrop-blur-sm">
          <Star className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <div className="text-4xl font-bold text-white mb-2">{allTechnicians.reduce((sum, t) => sum + t.current_month_ratings, 0)}</div>
          <div className="text-lg text-yellow-200">Total Ratings</div>
        </div>
      </div>

      {/* Most Improved */}
      {(() => {
        const mostImproved = allTechnicians.reduce((prev, current) => 
          (current.points_growth > prev.points_growth) ? current : prev
        );
        return mostImproved.points_growth > 0 && (
          <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl p-8 max-w-4xl mx-auto text-center">
            <div className="flex justify-center items-center mb-4">
              <TrendingUp className="h-8 w-8 text-white mr-3" />
              <h2 className="text-3xl font-bold text-white">Most Improved</h2>
              <TrendingUp className="h-8 w-8 text-white ml-3" />
            </div>
            <h3 className="text-4xl font-bold text-white mb-2">{mostImproved.name}</h3>
            <p className="text-xl text-green-100">
              +{mostImproved.points_growth} points improvement • {mostImproved.percentage_growth}% growth
            </p>
          </div>
        );
      })()}

      <div className="text-center mt-8 text-blue-200">
        <RefreshCw className="inline h-5 w-5 mr-2" />
        Updated live • Next refresh in {Math.ceil(30 - (Date.now() % 30000) / 1000)}s
      </div>
    </div>
  );

  // Screen Selector
  const renderScreen = (screenIndex: number) => {
    switch (screenIndex) {
      case 0:
        return renderTopThreeScreen();
      case 1:
        return renderPerformanceChartScreen();
      case 2:
        return renderRankingsTableScreen();
      case 3:
        return renderSummaryScreen();
      default:
        return renderTopThreeScreen();
    }
  };

  const renderCurrentScreen = () => {
    return renderScreen(currentScreen);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
      {/* Slideshow Content */}
      <div className="relative h-full">
        {/* Screen Indicator */}
        <div className="absolute top-6 right-6 z-10 flex space-x-2">
          {[...Array(TOTAL_SCREENS)].map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentScreen 
                  ? 'bg-white shadow-lg' 
                  : 'bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Screen Content with Smooth Transitions */}
        <div className="relative h-full overflow-hidden">
          {/* Current Screen */}
          <div 
            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
              isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            {renderCurrentScreen()}
          </div>
          
          {/* Next Screen (during transition) */}
          {isTransitioning && (
            <div 
              className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                isTransitioning ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            >
              {renderScreen(nextScreen)}
            </div>
          )}
        </div>

        {/* Live Status Indicator */}
        <div className="absolute bottom-6 left-6 flex items-center space-x-2 bg-black/20 rounded-full px-4 py-2 backdrop-blur-sm">
          <Zap className="h-4 w-4 text-green-400 animate-pulse" />
          <span className="text-sm text-green-300">LIVE</span>
          <span className="text-sm text-white">•</span>
          <span className="text-sm text-white">{currentTime.toLocaleTimeString()}</span>
        </div>

        {/* Auto-advance indicator */}
        <div className="absolute bottom-6 right-6 flex items-center space-x-2 bg-black/20 rounded-full px-4 py-2 backdrop-blur-sm">
          <Activity className="h-4 w-4 text-blue-400" />
          <span className="text-sm text-blue-300">Screen {currentScreen + 1} of {TOTAL_SCREENS}</span>
        </div>
      </div>
    </div>
  );
};
export default PublicLeaderboard;
