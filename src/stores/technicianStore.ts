import { create } from 'zustand';
import { apiService } from '../services/apiService';
import type { 
  TechnicianMobileDashboard,
  TechnicianPointsData,
  TechnicianLeaderboardData,
  TechnicianProfileData,
  Rating,
  RatingsResponse 
} from '../types/api';

interface TechnicianState {
  // Dashboard data
  dashboardData: TechnicianMobileDashboard | null;
  isDashboardLoading: boolean;
  
  // Points data
  pointsData: TechnicianPointsData | null;
  isPointsLoading: boolean;
  
  // Leaderboard data
  leaderboardData: TechnicianLeaderboardData | null;
  isLeaderboardLoading: boolean;
  
  // Profile data
  profileData: TechnicianProfileData | null;
  isProfileLoading: boolean;
  
  // Ratings
  ratings: Rating[];
  ratingsPagination: RatingsResponse['pagination'] | null;
  isRatingsLoading: boolean;
  
  // Error state
  error: string | null;
}

interface TechnicianActions {
  // Dashboard actions
  setDashboardData: (data: TechnicianMobileDashboard) => void;
  setDashboardLoading: (loading: boolean) => void;
  fetchDashboardData: () => Promise<void>;
  
  // Points actions
  setPointsData: (data: TechnicianPointsData) => void;
  setPointsLoading: (loading: boolean) => void;
  fetchPointsData: () => Promise<void>;
  
  // Leaderboard actions
  setLeaderboardData: (data: TechnicianLeaderboardData) => void;
  setLeaderboardLoading: (loading: boolean) => void;
  fetchLeaderboardData: () => Promise<void>;
  
  // Profile actions
  setProfileData: (data: TechnicianProfileData) => void;
  setProfileLoading: (loading: boolean) => void;
  fetchProfileData: () => Promise<void>;
  
  // Rating actions
  setRatings: (data: RatingsResponse) => void;
  setRatingsLoading: (loading: boolean) => void;
  fetchRatings: (params?: { page?: number; limit?: number; start_date?: string; end_date?: string }) => Promise<void>;
  
  // Error actions
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Reset action
  reset: () => void;
}

export type TechnicianStore = TechnicianState & TechnicianActions;

export const useTechnicianStore = create<TechnicianStore>((set) => ({
  // Initial state
  dashboardData: null,
  isDashboardLoading: false,
  pointsData: null,
  isPointsLoading: false,
  leaderboardData: null,
  isLeaderboardLoading: false,
  profileData: null,
  isProfileLoading: false,
  ratings: [],
  ratingsPagination: null,
  isRatingsLoading: false,
  error: null,

  // Dashboard actions
  setDashboardData: (dashboardData) => set({ dashboardData, error: null }),
  setDashboardLoading: (isDashboardLoading) => set({ isDashboardLoading }),

  fetchDashboardData: async () => {
    set({ isDashboardLoading: true, error: null });
    try {
      const data = await apiService.getTechnicianDashboard();
      set({ dashboardData: data, isDashboardLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
      set({ error: message, isDashboardLoading: false });
    }
  },

  // Points actions
  setPointsData: (pointsData) => set({ pointsData, error: null }),
  setPointsLoading: (isPointsLoading) => set({ isPointsLoading }),

  fetchPointsData: async () => {
    set({ isPointsLoading: true, error: null });
    try {
      const data = await apiService.getTechnicianPoints();
      set({ pointsData: data, isPointsLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch points data';
      set({ error: message, isPointsLoading: false });
    }
  },

  // Leaderboard actions
  setLeaderboardData: (leaderboardData) => set({ leaderboardData, error: null }),
  setLeaderboardLoading: (isLeaderboardLoading) => set({ isLeaderboardLoading }),

  fetchLeaderboardData: async () => {
    set({ isLeaderboardLoading: true, error: null });
    try {
      const data = await apiService.getTechnicianLeaderboard();
      set({ leaderboardData: data, isLeaderboardLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch leaderboard data';
      set({ error: message, isLeaderboardLoading: false });
    }
  },

  // Profile actions
  setProfileData: (profileData) => set({ profileData, error: null }),
  setProfileLoading: (isProfileLoading) => set({ isProfileLoading }),

  fetchProfileData: async () => {
    set({ isProfileLoading: true, error: null });
    try {
      const data = await apiService.getTechnicianProfile();
      set({ profileData: data, isProfileLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch profile data';
      set({ error: message, isProfileLoading: false });
    }
  },

  // Rating actions
  setRatings: (data) =>
    set({
      ratings: data.ratings,
      ratingsPagination: data.pagination,
      error: null,
    }),
  setRatingsLoading: (isRatingsLoading) => set({ isRatingsLoading }),

  fetchRatings: async (params = {}) => {
    set({ isRatingsLoading: true, error: null });
    try {
      const data = await apiService.getTechnicianRatings(params);
      set({ 
        ratings: data.ratings,
        ratingsPagination: data.pagination,
        isRatingsLoading: false 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch ratings';
      set({ error: message, isRatingsLoading: false });
    }
  },

  // Error actions
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Reset action
  reset: () =>
    set({
      dashboardData: null,
      isDashboardLoading: false,
      pointsData: null,
      isPointsLoading: false,
      leaderboardData: null,
      isLeaderboardLoading: false,
      profileData: null,
      isProfileLoading: false,
      ratings: [],
      ratingsPagination: null,
      isRatingsLoading: false,
      error: null,
    }),
}));