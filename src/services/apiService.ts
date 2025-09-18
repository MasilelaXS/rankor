import type {
  LoginRequest,
  LoginResponse,
  PasswordCreationResponse,
  CreatePasswordRequest,
  AdminDashboardData,
  TechnicianUser,
  Question,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  DeleteQuestionResponse,
  CreateRatingLinkRequest,
  RatingLinkResponse,
  RatingLinksResponse,
  RatingsResponse,
  TechnicianRatingsResponse,
  OverrideRatingRequest,
  EnhancedOverrideRatingRequest,
  AdjustPointsRequest,
  PointHistoryResponse,
  TechnicianMobileDashboard,
  TechnicianPointsData,
  TechnicianLeaderboardData,
  TechnicianProfileData,
  RatingFormData,
  SubmitRatingRequest,
  SubmitRatingResponse,
  SystemInfo,
  User,
  LeaderboardData,
  LeaderboardParams,
} from '../types/api';
import { handleGlobalTokenExpiration } from '../hooks/useTokenValidation';

const API_BASE_URL = 'https://score.ctecg.co.za/api';

class ApiError extends Error {
  public statusCode: number;
  public data?: unknown;
  
  constructor(
    message: string,
    statusCode: number,
    data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

class ApiService {
  private getHeaders(includeAuth = false): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['X-Token'] = token;
      }
    }

    return headers;
  }

  private getToken(): string | null {
    try {
      const authData = localStorage.getItem('ctecg-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.token || null;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth = false
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders(includeAuth);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      // Check for 401 status code directly
      if (response.status === 401 && includeAuth) {
        this.handleTokenExpiration();
        throw new ApiError('Authentication token expired', 401);
      }

      const data = await response.json();

      if (!data.success) {
        // Double-check for token expiration in response data
        if (data.status_code === 401 && includeAuth) {
          this.handleTokenExpiration();
        }
        throw new ApiError(data.message, data.status_code, data.data);
      }

      return data.data;
    } catch (error) {
      // Handle network errors that might also be 401
      if (error instanceof TypeError && includeAuth) {
        // Check if it's a fetch error due to 401
        console.warn('Network error during authenticated request, checking token validity');
      }
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      console.error('API request failed:', error);
      throw new ApiError('Network error occurred', 500);
    }
  }

  private handleTokenExpiration(): void {
    // Use the global token expiration handler
    handleGlobalTokenExpiration();
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse | PasswordCreationResponse> {
    return this.request<LoginResponse | PasswordCreationResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async createPassword(data: CreatePasswordRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/create-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(email: string, userType: 'admin' | 'technician'): Promise<void> {
    return this.request<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, user_type: userType }),
    });
  }

  async resetPassword(token: string, password: string, confirmPassword: string): Promise<void> {
    return this.request<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token,
        password,
        confirm_password: confirmPassword,
      }),
    });
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    }, true);
  }

  async verifyToken(): Promise<{ user: User; authenticated: boolean }> {
    return this.request<{ user: User; authenticated: boolean }>('/auth/verify', {
      method: 'GET',
    }, true);
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile', {
      method: 'GET',
    }, true);
  }

  // Admin endpoints
  async getAdminDashboard(): Promise<AdminDashboardData> {
    return this.request<AdminDashboardData>('/admin/dashboard', {
      method: 'GET',
    }, true);
  }

  async getTechnicians(): Promise<TechnicianUser[]> {
    return this.request<TechnicianUser[]>('/admin/technicians', {
      method: 'GET',
    }, true);
  }

  async createTechnician(data: Omit<TechnicianUser, 'id' | 'total_points' | 'total_ratings' | 'created_at' | 'updated_at'>): Promise<TechnicianUser> {
    return this.request<TechnicianUser>('/admin/technicians', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async updateTechnician(id: number, data: Partial<TechnicianUser>): Promise<TechnicianUser> {
    return this.request<TechnicianUser>(`/admin/technicians/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  async deactivateTechnician(id: number): Promise<void> {
    return this.request<void>(`/admin/technicians/${id}`, {
      method: 'DELETE',
    }, true);
  }

  async getQuestions(): Promise<Question[]> {
    return this.request<Question[]>('/admin/questions', {
      method: 'GET',
    }, true);
  }

  async getInactiveQuestions(): Promise<Question[]> {
    return this.request<Question[]>('/admin/questions/inactive', {
      method: 'GET',
    }, true);
  }

  async createQuestion(data: CreateQuestionRequest): Promise<Question> {
    return this.request<Question>('/admin/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async updateQuestion(id: number, data: UpdateQuestionRequest): Promise<Question> {
    return this.request<Question>(`/admin/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  async deleteQuestion(id: number): Promise<DeleteQuestionResponse> {
    return this.request<DeleteQuestionResponse>(`/admin/questions/${id}`, {
      method: 'DELETE',
    }, true);
  }

  async reorderQuestions(questions: Question[]): Promise<void> {
    // Update each question's order_position sequentially to avoid conflicts
    // Send complete data to avoid validation issues
    for (const question of questions) {
      await this.updateQuestion(question.id, { 
        text: question.text,
        order_position: question.order_position,
        active: question.active
      });
    }
  }

  async createRatingLink(data: CreateRatingLinkRequest): Promise<RatingLinkResponse> {
    return this.request<RatingLinkResponse>('/admin/rating-links', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async getRatingLinks(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<RatingLinksResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/admin/rating-links${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<RatingLinksResponse>(endpoint, {
      method: 'GET',
    }, true);
  }

  async getRatings(params?: {
    page?: number;
    limit?: number;
    technician_id?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<RatingsResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/admin/ratings${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<RatingsResponse>(endpoint, {
      method: 'GET',
    }, true);
  }

  async getAdminTechnicianRatings(params?: {
    page?: number;
    limit?: number;
    technician_id?: number;
    start_date?: string;
    end_date?: string;
    search?: string;
  }): Promise<TechnicianRatingsResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/admin/ratings${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<TechnicianRatingsResponse>(endpoint, {
      method: 'GET',
    }, true);
  }

  async overrideRating(id: number, data: OverrideRatingRequest): Promise<void> {
    return this.request<void>(`/admin/ratings/${id}/override`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  // Enhanced Points System Methods
  async adjustTechnicianPoints(technicianId: number, data: AdjustPointsRequest): Promise<void> {
    return this.request<void>(`/admin/technicians/${technicianId}/adjust-points`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async getTechnicianPointHistory(technicianId: number, params?: {
    page?: number;
    limit?: number;
  }): Promise<PointHistoryResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/admin/technicians/${technicianId}/point-history${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<PointHistoryResponse>(endpoint, {
      method: 'GET',
    }, true);
  }

  async enhancedOverrideRating(id: number, data: EnhancedOverrideRatingRequest): Promise<void> {
    return this.request<void>(`/admin/ratings/${id}/enhanced-override`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async getSettings(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/admin/settings', {
      method: 'GET',
    }, true);
  }

  async updateSettings(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  // Technician endpoints
  async getTechnicianDashboard(): Promise<TechnicianMobileDashboard> {
    return this.request<TechnicianMobileDashboard>('/technician/dashboard', {
      method: 'GET',
    }, true);
  }

  async getTechnicianRatings(params?: { page?: number; limit?: number; start_date?: string; end_date?: string }): Promise<RatingsResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/technician/ratings${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<RatingsResponse>(endpoint, {
      method: 'GET',
    }, true);
  }

  // New mobile app endpoints
  async getTechnicianPoints(): Promise<TechnicianPointsData> {
    return this.request<TechnicianPointsData>('/technician/points', {
      method: 'GET',
    }, true);
  }

  async getTechnicianLeaderboard(): Promise<TechnicianLeaderboardData> {
    return this.request<TechnicianLeaderboardData>('/technician/leaderboard', {
      method: 'GET',
    }, true);
  }

  async getTechnicianProfile(): Promise<TechnicianProfileData> {
    return this.request<TechnicianProfileData>('/technician/profile', {
      method: 'GET',
    }, true);
  }

  async getTechnicianRatingDetails(id: number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/technician/ratings/${id}`, {
      method: 'GET',
    }, true);
  }

  async getTechnicianPerformance(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/technician/performance', {
      method: 'GET',
    }, true);
  }

  async getTechnicianRanking(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/technician/ranking', {
      method: 'GET',
    }, true);
  }

  // Public endpoints
  async getSystemInfo(): Promise<SystemInfo> {
    return this.request<SystemInfo>('/public/info', {
      method: 'GET',
    });
  }

  async getRatingForm(token: string): Promise<RatingFormData> {
    return this.request<RatingFormData>(`/public/rating/${token}`, {
      method: 'GET',
    });
  }

  async submitRating(token: string, data: SubmitRatingRequest): Promise<SubmitRatingResponse> {
    return this.request<SubmitRatingResponse>(`/public/rating/${token}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async checkRatingStatus(token: string): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/public/rating/${token}/status`, {
      method: 'GET',
    });
  }

  // ============== LEADERBOARD ENDPOINTS ==============

  async getAdminLeaderboard(params?: LeaderboardParams): Promise<LeaderboardData> {
    const queryParams = new URLSearchParams();
    if (params?.year) queryParams.set('year', params.year.toString());
    if (params?.month) queryParams.set('month', params.month.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    
    const query = queryParams.toString();
    const url = `/admin/leaderboard${query ? `?${query}` : ''}`;
    
    return this.request<LeaderboardData>(url, {
      method: 'GET',
    }, true);
  }

  async getPublicLeaderboard(params?: LeaderboardParams): Promise<LeaderboardData> {
    const queryParams = new URLSearchParams();
    if (params?.year) queryParams.set('year', params.year.toString());
    if (params?.month) queryParams.set('month', params.month.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    
    const query = queryParams.toString();
    const url = `/public/leaderboard${query ? `?${query}` : ''}`;
    
    return this.request<LeaderboardData>(url, {
      method: 'GET',
    });
  }
}

export const apiService = new ApiService();