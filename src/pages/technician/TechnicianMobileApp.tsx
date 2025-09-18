import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  Home, 
  Star, 
  TrendingUp, 
  Trophy, 
  User,
  Bell,
  Settings,
  ArrowLeft,
  LogOut,
  Moon,
  Sun,
  Monitor,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTechnicianStore } from '../../stores/technicianStore';
import { useThemeStore, useSystemThemeListener } from '../../stores/themeStore';
import PullToRefresh from '../../components/PullToRefresh';
import HapticFeedback from '../../utils/haptics';

// Tab content components
import DashboardTab from './tabs/DashboardTab';
import RatingsTab from './tabs/RatingsTab';
import PointsTab from './tabs/PointsTab';
import LeaderboardTab from './tabs/LeaderboardTab';
import ProfileTab from './tabs/ProfileTab';

// Settings Dropdown Component
const SettingsDropdown = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { logout, user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const handleLogout = async () => {
    HapticFeedback.medium();
    await logout();
    // Navigate will be handled by the auth system
    onClose();
  };

  const handleThemeToggle = () => {
    HapticFeedback.light();
    let newTheme: 'light' | 'dark' | 'system';
    
    if (theme === 'system') {
      newTheme = 'light';
    } else if (theme === 'light') {
      newTheme = 'dark';
    } else {
      newTheme = 'system';
    }
    
    setTheme(newTheme);
  };

  const getThemeIcon = () => {
    if (theme === 'light') return Sun;
    if (theme === 'dark') return Moon;
    return Monitor;
  };

  const getThemeLabel = () => {
    if (theme === 'light') return 'Light Mode';
    if (theme === 'dark') return 'Dark Mode';
    return 'System Mode';
  };

  if (!isOpen) return null;

  const ThemeIcon = getThemeIcon();

  return (
    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
      </div>
      
      {/* Menu Items */}
      <div className="py-2">
        <button 
          onClick={handleThemeToggle}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center">
            <ThemeIcon className="h-4 w-4 mr-3" />
            {getThemeLabel()}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{theme}</span>
        </button>
        <button 
          onClick={handleLogout}
          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

// Top Navigation Component
const TopNavigation = ({ title, showBack = false, onBack }: {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between relative">
      <div className="flex items-center">
        {showBack && (
          <button
            onClick={onBack}
            className="mr-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="relative">
          <button 
            onClick={() => {
              HapticFeedback.light();
              setShowSettings(!showSettings);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
          >
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <ChevronDown className={`h-3 w-3 ml-1 text-gray-600 dark:text-gray-400 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
          </button>
          <SettingsDropdown 
            isOpen={showSettings} 
            onClose={() => setShowSettings(false)} 
          />
        </div>
      </div>
      
      {/* Overlay to close dropdown when clicking outside */}
      {showSettings && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

// Bottom Navigation Component
const BottomNavigation = ({ activeTab, onTabChange }: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) => {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'ratings', icon: Star, label: 'Ratings' },
    { id: 'points', icon: TrendingUp, label: 'Points' },
    { id: 'leaderboard', icon: Trophy, label: 'Ranking' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-2 py-2 safe-area-bottom">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => {
                HapticFeedback.selection();
                onTabChange(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                isActive
                  ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 scale-105'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-red-600 dark:text-red-400' : ''}`} />
              <span className={`text-xs font-medium truncate ${isActive ? 'text-red-600 dark:text-red-400' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Main Mobile App Layout
const TechnicianMobileApp = () => {
  // Initialize theme system
  useSystemThemeListener();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const { 
    fetchDashboardData, 
    fetchRatings, 
    fetchPointsData, 
    fetchLeaderboardData, 
    fetchProfileData 
  } = useTechnicianStore();

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard';
      case 'ratings':
        return 'My Ratings';
      case 'points':
        return 'Points History';
      case 'leaderboard':
        return 'Leaderboard';
      case 'profile':
        return 'My Profile';
      default:
        return 'Technician App';
    }
  };

  const handleRefresh = async () => {
    try {
      switch (activeTab) {
        case 'dashboard':
          await fetchDashboardData();
          break;
        case 'ratings':
          await fetchRatings({ page: 1, limit: 20 });
          break;
        case 'points':
          await fetchPointsData();
          break;
        case 'leaderboard':
          await fetchLeaderboardData();
          break;
        case 'profile':
          await fetchProfileData();
          break;
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  const renderTabContent = () => {
    const content = (() => {
      switch (activeTab) {
        case 'dashboard':
          return <DashboardTab onNavigate={setActiveTab} />;
        case 'ratings':
          return <RatingsTab />;
        case 'points':
          return <PointsTab />;
        case 'leaderboard':
          return <LeaderboardTab />;
        case 'profile':
          return <ProfileTab />;
        default:
          return <DashboardTab onNavigate={setActiveTab} />;
      }
    })();

    return (
      <PullToRefresh onRefresh={handleRefresh}>
        {content}
      </PullToRefresh>
    );
  };

  return (
    <div className="mobile-viewport bg-gray-50 dark:bg-black flex flex-col overflow-hidden">
      {/* Fixed Top Navigation */}
      <div className="flex-shrink-0 safe-area-top">
        <TopNavigation title={getTabTitle(activeTab)} />
      </div>
      
      {/* Scrollable Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
      
      {/* Fixed Bottom Navigation */}
      <div className="flex-shrink-0">
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
};

// Route-based wrapper for navigation
export default function TechnicianDashboard() {
  return (
    <Routes>
      <Route path="/*" element={<TechnicianMobileApp />} />
    </Routes>
  );
}