// Base API response interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
  timestamp: string;
}

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  user_type: 'admin' | 'technician';
}

export interface AdminUser extends User {
  user_type: 'admin';
}

export interface TechnicianUser extends User {
  user_type: 'technician';
  phone: string;
  employee_id: string;
  total_points: number;
  total_ratings: number;
  created_at: string;
  updated_at: string;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
  user_type: 'admin' | 'technician';
}

export interface LoginResponse {
  token: string;
  user: User;
  expires_in: string;
}

export interface PasswordCreationResponse {
  requires_password_creation: boolean;
  user_id: number;
  user_type: 'admin' | 'technician';
  name: string;
  email: string;
}

export interface CreatePasswordRequest {
  user_id: number;
  user_type: 'admin' | 'technician';
  password: string;
  confirm_password: string;
}

// Dashboard types
export interface DashboardStats {
  total_technicians: number;
  ratings_this_month: number;
  avg_percentage_this_month: number;
}

export interface RecentRating {
  id: number;
  rating_link_id: number;
  total_score: number;
  max_score: number;
  percentage: string;
  points_awarded_auto: number;
  points_awarded_final: number | null;
  admin_override_reason: string | null;
  admin_override_by: string | null;
  admin_override_at: string | null;
  comments: string;
  submitted_at: string;
  client_name: string;
  client_email: string;
  technician_names: string;
}

export interface TopTechnician {
  id: number;
  name: string;
  total_points: number;
  ratings_this_month: number;
  avg_percentage: string | null;
  points_this_month: string | null;
}

export interface AdminDashboardData {
  stats: DashboardStats;
  recent_ratings: RecentRating[];
  top_technicians: TopTechnician[];
}

// Technician types
export interface TechnicianPerformance {
  total_ratings: number;
  average_percentage: number;
  total_points_calculated: string;
}

export interface MonthlyStats {
  total_ratings: number;
  good_ratings: number;
  bad_ratings: number;
  points_gained: number;
  points_lost: number;
  net_points: number;
}

export interface CurrentMonth {
  stats: MonthlyStats;
  performance_percentage: number;
}

export interface TechnicianDashboardData {
  technician: TechnicianUser;
  performance: TechnicianPerformance;
  current_month: CurrentMonth;
  recent_ratings: RecentRating[];
  monthly_trend: Record<string, unknown>[];
}

// Question types
export interface Question {
  id: number;
  text: string;
  order_position: number;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface CreateQuestionRequest {
  text: string;
  order_position: number;
}

export interface UpdateQuestionRequest {
  text?: string;
  order_position?: number;
  active?: number;
}

export interface DeleteQuestionResponse {
  action_taken: 'deleted' | 'deactivated';
  ratings_count?: number;
}

// Rating Link types
export interface CreateRatingLinkRequest {
  technician_ids: number[];
  client_name: string;
  client_code?: string;
  client_email: string;
  client_contact?: string;
}

export interface RatingLinkResponse {
  link_id: number;
  token: string;
  rating_url: string;
  expires_at: string;
  client_name: string;
  client_email: string;
  action: 'created' | 'updated';
}

export interface RatingLink {
  id: number;
  token: string;
  client_name: string;
  client_code: string | null;
  client_email: string;
  client_contact: string | null;
  expires_at: string;
  used: number;
  used_at: string | null;
  created_by_admin_id: number;
  created_at: string;
  updated_at: string;
  created_by_name: string;
  status: 'active' | 'used' | 'expired';
  submitted_at: string | null;
  rating_percentage: string | null;
  technician_names: string;
  technician_count: number;
}

export interface RatingLinksResponse {
  rating_links: RatingLink[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters: {
    status: string;
    search: string;
  };
}

// Rating types
export interface Rating {
  id: number;
  rating_link_id: number;
  total_score: number;
  max_score: number;
  percentage: string;
  points_awarded_auto: number;
  points_awarded_final: number | null;
  admin_override_reason: string | null;
  admin_override_by: string | null;
  admin_override_at: string | null;
  comments: string;
  submitted_at: string;
  client_name: string;
  client_email: string;
  client_code: string | null;
  client_contact: string | null;
  technician_names: string;
  technician_ids: string;
  overridden_by: string | null;
}

// Technician Rating (grouped by technician) types
export interface TechnicianRating {
  technician_id: number;
  technician_name: string;
  technician_email: string;
  current_total_points: number;
  total_ratings: number;
  average_percentage: number;
  good_ratings: number;
  poor_ratings: number;
  total_points_from_ratings: number;
  overridden_ratings: number;
  ratings: {
    id: number;
    total_score: number;
    max_score: number;
    percentage: string;
    points_awarded_auto: number;
    points_awarded_final: number | null;
    admin_override_reason: string | null;
    admin_override_by: number | null;
    admin_override_at: string | null;
    comments: string;
    submitted_at: string;
    client_name: string;
    client_code: string | null;
    client_email: string;
    overridden_by: string | null;
  }[];
}

export interface TechnicianRatingsResponse {
  technicians: TechnicianRating[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters_applied: {
    technician_id: number | null;
    start_date: string | null;
    end_date: string | null;
  };
}

export interface RatingsResponse {
  ratings: Rating[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface OverrideRatingRequest {
  points_awarded_final: number;
  admin_override_reason: string;
}

// Enhanced Points System types
export interface PointAdjustment {
  id: number;
  technician_id: number;
  adjustment_type: 'rating_override' | 'manual_adjustment';
  points_change: number;
  points_before: number;
  points_after: number;
  reason: string;
  admin_id: number;
  admin_name: string;
  rating_id?: number;
  client_name?: string;
  created_at: string;
}

export interface PointHistoryResponse {
  technician_id: string;
  technician_name: string;
  current_total_points: number;
  history: PointAdjustment[];
  total_records: number;
  summary?: {
    total_adjustments: number;
    points_gained: number;
    points_lost: number;
    net_change: number;
  };
}

export interface AdjustPointsRequest {
  points_change: number;
  reason: string;
}

export interface EnhancedOverrideRatingRequest {
  points_change: number;
  admin_override_reason: string;
}

// Public rating form types
export interface ClientInfo {
  name: string;
  code: string | null;
  email: string;
  contact: string;
}

export interface TechnicianSimple {
  id: number;
  name: string;
}

export interface RatingFormData {
  client_info: ClientInfo;
  technicians: TechnicianSimple[];
  questions: Question[];
  expires_at: string;
  instructions: string;
}

export interface SubmitRatingRequest {
  answers: Record<string, number>;
  comments?: string;
}

export interface SubmitRatingResponse {
  rating_id: string;
  total_score: number;
  max_score: number;
  percentage: number;
  points_awarded: number;
  technicians: string[];
  thank_you_message: string;
}

// System info types
export interface SystemInfo {
  company_name: string;
  company_color: string;
  timezone: string;
  rating_scale: Record<string, string>;
}

// Mobile app specific types
export interface TechnicianPointsData {
  current_points: number;
  adjustments_history: PointAdjustment[];
  monthly_timeline: MonthlyTimeline[];
  current_month_adjustments: MonthlyAdjustments;
  statistics: AdjustmentStatistics;
}

export interface PointAdjustment {
  id: number;
  points_change: number;
  reason: string;
  created_at: string;
  adjustment_type: "rating_override" | "manual_adjustment";
  previous_total: number;
  new_total: number;
  admin_name: string;
  adjustment_category: string;
}

export interface MonthlyTimeline {
  year: number;
  month: number;
  total_ratings: number;
  good_ratings: number;
  bad_ratings: number;
  net_points: number;
  points_at_month_end: number;
}

export interface MonthlyAdjustments {
  total_adjustments: number;
  bonus_points: string;
  penalty_points: string;
  net_adjustment: string;
}

export interface AdjustmentStatistics {
  total_adjustments: number;
  positive_adjustments: number;
  negative_adjustments: number;
}

export interface TechnicianLeaderboardData {
  leaderboard: LeaderboardEntry[];
  current_user_position: CurrentUserPosition;
  top_performer: TopPerformer;
  month_context: MonthContext;
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  total_points: number;
  month_ratings: number;
  month_good_ratings: number;
  month_points: number;
  month_percentage: string;
  is_current_user: number;
}

export interface CurrentUserPosition {
  rank: number;
  total_points: number;
  points_to_first: number;
  total_technicians: number;
}

export interface TopPerformer {
  id: number;
  name: string;
  total_points: number;
}

export interface MonthContext {
  year: string;
  month: string;
  month_name: string;
}

export interface TechnicianProfileData {
  technician: TechnicianUser;
  performance_status: PerformanceStatus;
  statistics: ProfileStatistics;
  recent_performance: RecentPerformance[];
  badges: TechnicianBadges;
}

export interface PerformanceStatus {
  status: string;
  message: string;
  color: string;
  trend: string;
}

export interface ProfileStatistics {
  total_points: number;
  total_ratings: number;
  average_percentage: number;
  good_ratings_count: number;
  poor_ratings_count: number;
}

export interface RecentPerformance {
  year: number;
  month: number;
  total_ratings: number;
  good_ratings: number;
  bad_ratings: number;
  month_percentage: string;
}

export interface TechnicianBadges {
  has_excellent_rating: boolean;
  consistent_performer: boolean;
  active_technician: boolean;
  top_performer: boolean;
}

// Enhanced dashboard data for mobile app
export interface TechnicianMobileDashboard {
  technician: {
    id: number;
    name: string;
    email: string;
    employee_id: string;
  };
  summary: {
    total_points: number;
    total_ratings: number;
    average_percentage: number;
    current_rank: number;
    total_technicians: number;
  };
  this_month: {
    ratings_count: number;
    good_ratings: number;
    bad_ratings: number;
    performance_percentage: number;
    points_earned: number;
  };
  activity: {
    recent_ratings_7_days: number;
  };
}

// Leaderboard types
export interface LeaderboardTechnician {
  id: number;
  name: string;
  email: string;
  total_points: number;
  ratings_this_month: number;
  points_this_month: number;
  good_ratings: number;
  bad_ratings: number;
  points_gained: number;
  points_lost: number;
  avg_percentage_this_month: string;
  rank_position: number;
  performance_level: 'excellent' | 'good' | 'average' | 'needs_improvement' | 'no_ratings';
  activity_level: 'highly_active' | 'active' | 'low_activity' | 'inactive';
}

export interface LeaderboardLeader {
  id: number;
  name: string;
  email: string;
  total_points: number;
  rank_position: number;
  performance_level: string;
}

export interface LeaderboardSummary {
  total_active_technicians: number;
  total_ratings_this_month: number;
  overall_avg_percentage: string;
  total_points_awarded: number;
  highest_monthly_points: number;
  lowest_monthly_points: number;
}

export interface LeaderboardPeriod {
  year: number;
  month: number;
  month_name: string;
  is_current_month: boolean;
}

export interface LeaderboardMetadata {
  total_technicians_shown: number;
  leaders_count: number;
  trailers_count: number;
}

export interface LeaderboardData {
  leaderboard: LeaderboardTechnician[];
  leaders: LeaderboardLeader[];
  trailers: LeaderboardLeader[];
  summary: LeaderboardSummary;
  period: LeaderboardPeriod;
  metadata: LeaderboardMetadata;
}

export interface LeaderboardParams {
  year?: number;
  month?: number;
  limit?: number;
}

// Error types
export interface ValidationError {
  errors: Record<string, string>;
}

export interface ApiError {
  success: false;
  status_code: number;
  message: string;
  data?: ValidationError | null;
  timestamp: string;
}