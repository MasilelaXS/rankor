import { create } from 'zustand';
import { apiService } from '../services/apiService';
import type { 
  AdminDashboardData, 
  TechnicianUser, 
  Question, 
  Rating,
  RatingsResponse,
  TechnicianRating,
  TechnicianRatingsResponse,
  RatingLink,
  RatingLinksResponse,
  CreateRatingLinkRequest,
  RatingLinkResponse,
  PointHistoryResponse,
  AdjustPointsRequest,
  EnhancedOverrideRatingRequest
} from '../types/api';

interface AdminState {
  // Dashboard data
  dashboardData: AdminDashboardData | null;
  isDashboardLoading: boolean;
  
  // Technicians
  technicians: TechnicianUser[];
  isTechniciansLoading: boolean;
  
  // Questions
  questions: Question[];
  inactiveQuestions: Question[];
  isQuestionsLoading: boolean;
  questionLoadingStates: {
    [questionId: number]: {
      toggling?: boolean;
      updating?: boolean;
      deleting?: boolean;
    };
  };
  isCreatingQuestion: boolean;
  isReorderingQuestions: boolean;
  
  // Ratings
  ratings: Rating[];
  ratingsPagination: RatingsResponse['pagination'] | null;
  isRatingsLoading: boolean;
  
  // Technician Ratings (grouped by technician)
  technicianRatings: TechnicianRating[];
  technicianRatingsPagination: TechnicianRatingsResponse['pagination'] | null;
  isTechnicianRatingsLoading: boolean;
  
  // Rating Links
  ratingLinks: RatingLink[];
  ratingLinksPagination: RatingLinksResponse['pagination'] | null;
  isRatingLinksLoading: boolean;
  
  // Error states
  error: string | null;
}

interface AdminActions {
  // Dashboard actions
  setDashboardData: (data: AdminDashboardData) => void;
  setDashboardLoading: (loading: boolean) => void;
  fetchDashboardData: () => Promise<void>;
  
  // Technician actions
  setTechnicians: (technicians: TechnicianUser[]) => void;
  setTechniciansLoading: (loading: boolean) => void;
  fetchTechnicians: () => Promise<void>;
  createTechnician: (data: Omit<TechnicianUser, 'id' | 'total_points' | 'total_ratings' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTechnicianAsync: (id: number, data: Partial<TechnicianUser>) => Promise<void>;
  addTechnician: (technician: TechnicianUser) => void;
  updateTechnician: (id: number, updates: Partial<TechnicianUser>) => void;
  removeTechnician: (id: number) => void;
  
  // Question actions
  setQuestions: (questions: Question[]) => void;
  setInactiveQuestions: (questions: Question[]) => void;
  setQuestionsLoading: (loading: boolean) => void;
  setQuestionLoadingState: (questionId: number, loadingType: 'toggling' | 'updating' | 'deleting', loading: boolean) => void;
  setCreatingQuestion: (loading: boolean) => void;
  setReorderingQuestions: (loading: boolean) => void;
  fetchQuestions: () => Promise<void>;
  fetchInactiveQuestions: () => Promise<void>;
  fetchAllQuestions: () => Promise<void>;
  toggleQuestionActive: (id: number) => Promise<void>;
  createQuestion: (data: { text: string; order_position: number }) => Promise<void>;
  updateQuestionAsync: (id: number, data: Partial<Question>) => Promise<void>;
  deleteQuestion: (id: number) => Promise<{ action_taken: 'deleted' | 'deactivated'; ratings_count?: number; message?: string }>;
  addQuestion: (question: Question) => void;
  updateQuestion: (id: number, updates: Partial<Question>) => void;
  removeQuestion: (id: number) => void;
  reorderQuestions: (questions: Question[]) => void;
  reorderQuestionsAsync: (questions: Question[]) => Promise<void>;
  
  // Rating actions
  setRatings: (data: RatingsResponse) => void;
  setRatingsLoading: (loading: boolean) => void;
  fetchRatings: (page?: number, limit?: number) => Promise<void>;
  updateRating: (id: number, updates: Partial<Rating>) => void;
  overrideRatingPoints: (id: number, data: EnhancedOverrideRatingRequest) => Promise<void>;
  adjustTechnicianPoints: (technicianId: number, data: AdjustPointsRequest) => Promise<void>;
  getTechnicianPointHistory: (technicianId: number, params?: { page?: number; limit?: number }) => Promise<PointHistoryResponse>;
  
  // Technician Rating actions
  setTechnicianRatings: (data: TechnicianRatingsResponse) => void;
  setTechnicianRatingsLoading: (loading: boolean) => void;
  fetchTechnicianRatings: (params?: { page?: number; limit?: number; technician_id?: number; start_date?: string; end_date?: string; search?: string }) => Promise<void>;
  
  // Rating Link actions
  setRatingLinks: (data: RatingLinksResponse) => void;
  setRatingLinksLoading: (loading: boolean) => void;
  fetchRatingLinks: (params?: { page?: number; limit?: number; status?: string; search?: string }) => Promise<void>;
  createRatingLink: (data: CreateRatingLinkRequest) => Promise<RatingLinkResponse>;
  
  // Error actions
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Reset actions
  reset: () => void;
}

export type AdminStore = AdminState & AdminActions;

export const useAdminStore = create<AdminStore>((set) => ({
  // Initial state
  dashboardData: null,
  isDashboardLoading: false,
  technicians: [],
  isTechniciansLoading: false,
  questions: [],
  inactiveQuestions: [],
  isQuestionsLoading: false,
  questionLoadingStates: {},
  isCreatingQuestion: false,
  isReorderingQuestions: false,
  ratings: [],
  ratingsPagination: null,
  isRatingsLoading: false,
  technicianRatings: [],
  technicianRatingsPagination: null,
  isTechnicianRatingsLoading: false,
  ratingLinks: [],
  ratingLinksPagination: null,
  isRatingLinksLoading: false,
  error: null,

  // Dashboard actions
  setDashboardData: (dashboardData) => set({ dashboardData, error: null }),
  setDashboardLoading: (isDashboardLoading) => set({ isDashboardLoading }),
  
  fetchDashboardData: async () => {
    set({ isDashboardLoading: true, error: null });
    try {
      const data = await apiService.getAdminDashboard();
      set({ dashboardData: data, isDashboardLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
      set({ error: message, isDashboardLoading: false });
    }
  },

  // Technician actions
  setTechnicians: (technicians) => set({ technicians, error: null }),
  setTechniciansLoading: (isTechniciansLoading) => set({ isTechniciansLoading }),
  
  fetchTechnicians: async () => {
    set({ isTechniciansLoading: true, error: null });
    try {
      const data = await apiService.getTechnicians();
      set({ technicians: data, isTechniciansLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch technicians';
      set({ error: message, isTechniciansLoading: false });
    }
  },

  createTechnician: async (data) => {
    set({ isTechniciansLoading: true, error: null });
    try {
      const newTechnician = await apiService.createTechnician(data);
      set((state) => ({
        technicians: [...state.technicians, newTechnician],
        isTechniciansLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create technician';
      set({ error: message, isTechniciansLoading: false });
      throw error;
    }
  },

  updateTechnicianAsync: async (id, data) => {
    set({ isTechniciansLoading: true, error: null });
    try {
      const updatedTechnician = await apiService.updateTechnician(id, data);
      set((state) => ({
        technicians: state.technicians.map((tech) =>
          tech.id === id ? updatedTechnician : tech
        ),
        isTechniciansLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update technician';
      set({ error: message, isTechniciansLoading: false });
      throw error;
    }
  },
  
  addTechnician: (technician) =>
    set((state) => ({
      technicians: [...state.technicians, technician],
      error: null,
    })),
    
  updateTechnician: (id, updates) =>
    set((state) => ({
      technicians: state.technicians.map((tech) =>
        tech.id === id ? { ...tech, ...updates } : tech
      ),
      error: null,
    })),
    
  removeTechnician: (id) =>
    set((state) => ({
      technicians: state.technicians.filter((tech) => tech.id !== id),
      error: null,
    })),

  // Question actions
  setQuestions: (questions) => set({ questions, error: null }),
  setInactiveQuestions: (inactiveQuestions) => set({ inactiveQuestions, error: null }),
  setQuestionsLoading: (isQuestionsLoading) => set({ isQuestionsLoading }),
  
  setQuestionLoadingState: (questionId, loadingType, loading) =>
    set((state) => ({
      questionLoadingStates: {
        ...state.questionLoadingStates,
        [questionId]: {
          ...state.questionLoadingStates[questionId],
          [loadingType]: loading
        }
      }
    })),
    
  setCreatingQuestion: (isCreatingQuestion) => set({ isCreatingQuestion }),
  setReorderingQuestions: (isReorderingQuestions) => set({ isReorderingQuestions }),
  
  fetchQuestions: async () => {
    set({ isQuestionsLoading: true, error: null });
    try {
      const data = await apiService.getQuestions();
      set({ questions: data, isQuestionsLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch questions';
      set({ error: message, isQuestionsLoading: false });
    }
  },

  fetchInactiveQuestions: async () => {
    set({ isQuestionsLoading: true, error: null });
    try {
      const data = await apiService.getInactiveQuestions();
      set({ inactiveQuestions: data, isQuestionsLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch inactive questions';
      set({ error: message, isQuestionsLoading: false });
    }
  },

  fetchAllQuestions: async () => {
    set({ isQuestionsLoading: true, error: null });
    try {
      const [activeQuestions, inactiveQuestions] = await Promise.all([
        apiService.getQuestions(),
        apiService.getInactiveQuestions()
      ]);
      set({ 
        questions: activeQuestions, 
        inactiveQuestions: inactiveQuestions,
        isQuestionsLoading: false 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch questions';
      set({ error: message, isQuestionsLoading: false });
    }
  },

  toggleQuestionActive: async (id) => {
    // Set loading state for this specific question
    set((state) => ({
      questionLoadingStates: {
        ...state.questionLoadingStates,
        [id]: { ...state.questionLoadingStates[id], toggling: true }
      }
    }));

    try {
      // Find the question in either active or inactive list
      const state = useAdminStore.getState();
      const activeQuestion = state.questions.find(q => q.id === id);
      const inactiveQuestion = state.inactiveQuestions.find(q => q.id === id);
      const question = activeQuestion || inactiveQuestion;
      
      if (!question) throw new Error('Question not found');

      // Toggle the active status
      const newActiveStatus = question.active === 1 ? 0 : 1;
      
      // Make API call
      await apiService.updateQuestion(id, { active: newActiveStatus });
      
      // Optimistically update local state
      if (newActiveStatus === 0) {
        // Moving from active to inactive
        const updatedQuestion = { ...question, active: 0 };
        set((state) => ({
          questions: state.questions.filter(q => q.id !== id),
          inactiveQuestions: [...state.inactiveQuestions, updatedQuestion].sort((a, b) => (a.order_position || 0) - (b.order_position || 0)),
          questionLoadingStates: {
            ...state.questionLoadingStates,
            [id]: { ...state.questionLoadingStates[id], toggling: false }
          }
        }));
      } else {
        // Moving from inactive to active
        const updatedQuestion = { ...question, active: 1 };
        set((state) => ({
          inactiveQuestions: state.inactiveQuestions.filter(q => q.id !== id),
          questions: [...state.questions, updatedQuestion].sort((a, b) => (a.order_position || 0) - (b.order_position || 0)),
          questionLoadingStates: {
            ...state.questionLoadingStates,
            [id]: { ...state.questionLoadingStates[id], toggling: false }
          }
        }));
      }
    } catch (error) {
      // Clear loading state on error
      set((state) => ({
        questionLoadingStates: {
          ...state.questionLoadingStates,
          [id]: { ...state.questionLoadingStates[id], toggling: false }
        },
        error: error instanceof Error ? error.message : 'Failed to toggle question status'
      }));
      throw error;
    }
  },

  createQuestion: async (data) => {
    set({ isCreatingQuestion: true, error: null });
    try {
      const newQuestion = await apiService.createQuestion(data);
      set((state) => ({
        questions: [...state.questions, newQuestion].sort((a, b) => (a.order_position || 0) - (b.order_position || 0)),
        isCreatingQuestion: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create question';
      set({ error: message, isCreatingQuestion: false });
      throw error;
    }
  },

  updateQuestionAsync: async (id, data) => {
    // Set loading state for this specific question
    set((state) => ({
      questionLoadingStates: {
        ...state.questionLoadingStates,
        [id]: { ...state.questionLoadingStates[id], updating: true }
      },
      error: null
    }));
    
    try {
      await apiService.updateQuestion(id, data);
      // API returns null data, so we update locally with the provided data
      set((state) => ({
        questions: state.questions.map((question) => {
          if (question.id === id) {
            return {
              ...question,
              ...data // Apply the updates to the existing question
            };
          }
          return question;
        }).sort((a, b) => (a.order_position || 0) - (b.order_position || 0)),
        questionLoadingStates: {
          ...state.questionLoadingStates,
          [id]: { ...state.questionLoadingStates[id], updating: false }
        }
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update question';
      set((state) => ({ 
        error: message,
        questionLoadingStates: {
          ...state.questionLoadingStates,
          [id]: { ...state.questionLoadingStates[id], updating: false }
        }
      }));
      throw error;
    }
  },

  deleteQuestion: async (id) => {
    // Set loading state for this specific question
    set((state) => ({
      questionLoadingStates: {
        ...state.questionLoadingStates,
        [id]: { ...state.questionLoadingStates[id], deleting: true }
      },
      error: null
    }));
    
    try {
      const response = await apiService.deleteQuestion(id);
      
      set((state) => {
        const newLoadingStates = { ...state.questionLoadingStates };
        delete newLoadingStates[id]; // Remove loading state for the question
        
        if (response.action_taken === 'deleted') {
          // Question was actually deleted - remove from both lists
          return {
            questions: state.questions.filter((question) => question.id !== id),
            inactiveQuestions: state.inactiveQuestions.filter((question) => question.id !== id),
            questionLoadingStates: newLoadingStates
          };
        } else if (response.action_taken === 'deactivated') {
          // Question was deactivated instead - move from active to inactive
          const questionToMove = state.questions.find(q => q.id === id);
          if (questionToMove) {
            const deactivatedQuestion = { ...questionToMove, active: 0 };
            return {
              questions: state.questions.filter((question) => question.id !== id),
              inactiveQuestions: [...state.inactiveQuestions, deactivatedQuestion].sort((a, b) => a.order_position - b.order_position),
              questionLoadingStates: newLoadingStates
            };
          }
        }
        
        // Fallback - just clear loading state
        return {
          questionLoadingStates: newLoadingStates
        };
      });
      
      return {
        action_taken: response.action_taken,
        ratings_count: response.ratings_count,
        message: response.action_taken === 'deactivated' 
          ? `Question cannot be deleted as it is used in ${response.ratings_count} rating(s). Question has been deactivated instead.`
          : 'Question deleted successfully'
      };
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete question';
      set((state) => ({ 
        error: message,
        questionLoadingStates: {
          ...state.questionLoadingStates,
          [id]: { ...state.questionLoadingStates[id], deleting: false }
        }
      }));
      throw error;
    }
  },
  
  addQuestion: (question) =>
    set((state) => ({
      questions: [...state.questions, question].sort((a, b) => (a.order_position || 0) - (b.order_position || 0)),
      error: null,
    })),
    
  updateQuestion: (id, updates) =>
    set((state) => ({
      questions: state.questions
        .map((q) => (q.id === id ? { ...q, ...updates } : q))
        .sort((a, b) => (a.order_position || 0) - (b.order_position || 0)),
      error: null,
    })),
    
  removeQuestion: (id) =>
    set((state) => ({
      questions: state.questions.filter((q) => q.id !== id),
      error: null,
    })),
    
  reorderQuestions: (questions) => set({ questions, error: null }),

  reorderQuestionsAsync: async (questions) => {
    set({ isReorderingQuestions: true, error: null });
    try {
      await apiService.reorderQuestions(questions);
      set({ questions, isReorderingQuestions: false });
    } catch (error) {
      console.error('Failed to reorder questions:', error);
      set({ error: 'Failed to reorder questions', isReorderingQuestions: false });
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
  
  fetchRatings: async (page = 1, limit = 20) => {
    set({ isRatingsLoading: true, error: null });
    try {
      const data = await apiService.getRatings({ page, limit });
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
  
  updateRating: (id, updates) =>
    set((state) => ({
      ratings: state.ratings.map((rating) =>
        rating.id === id ? { ...rating, ...updates } : rating
      ),
      error: null,
    })),

  overrideRatingPoints: async (id, data) => {
    try {
      await apiService.enhancedOverrideRating(id, data);
      // Refresh ratings to get updated data
      // Note: You might want to call fetchRatings() here or update the specific rating
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to override rating points';
      set({ error: message });
      throw error;
    }
  },

  adjustTechnicianPoints: async (technicianId, data) => {
    try {
      await apiService.adjustTechnicianPoints(technicianId, data);
      // Optionally refresh technicians list or dashboard data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to adjust technician points';
      set({ error: message });
      throw error;
    }
  },

  getTechnicianPointHistory: async (technicianId, params = {}) => {
    try {
      const data = await apiService.getTechnicianPointHistory(technicianId, params);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch point history';
      set({ error: message });
      throw error;
    }
  },

  // Technician Rating actions
  setTechnicianRatings: (data) =>
    set({
      technicianRatings: data.technicians,
      technicianRatingsPagination: data.pagination,
      error: null,
    }),
    
  setTechnicianRatingsLoading: (isTechnicianRatingsLoading) => set({ isTechnicianRatingsLoading }),
  
  fetchTechnicianRatings: async (params = {}) => {
    set({ isTechnicianRatingsLoading: true, error: null });
    try {
      const data = await apiService.getAdminTechnicianRatings(params);
      set({ 
        technicianRatings: data.technicians,
        technicianRatingsPagination: data.pagination,
        isTechnicianRatingsLoading: false 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch technician ratings';
      set({ error: message, isTechnicianRatingsLoading: false });
    }
  },

  // Rating Links actions
  setRatingLinks: (data) =>
    set({
      ratingLinks: data.rating_links,
      ratingLinksPagination: data.pagination,
      error: null,
    }),
    
  setRatingLinksLoading: (isRatingLinksLoading) => set({ isRatingLinksLoading }),
  
  fetchRatingLinks: async (params = {}) => {
    set({ isRatingLinksLoading: true, error: null });
    try {
      const data = await apiService.getRatingLinks(params);
      set({ 
        ratingLinks: data.rating_links,
        ratingLinksPagination: data.pagination,
        isRatingLinksLoading: false 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch rating links';
      set({ error: message, isRatingLinksLoading: false });
    }
  },
  
  createRatingLink: async (data) => {
    try {
      const response = await apiService.createRatingLink(data);
      // Optionally refresh the list
      // fetchRatingLinks();
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create rating link';
      set({ error: message });
      throw error;
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
      technicians: [],
      isTechniciansLoading: false,
      questions: [],
      inactiveQuestions: [],
      isQuestionsLoading: false,
      questionLoadingStates: {},
      isCreatingQuestion: false,
      isReorderingQuestions: false,
      ratings: [],
      ratingsPagination: null,
      isRatingsLoading: false,
      ratingLinks: [],
      ratingLinksPagination: null,
      isRatingLinksLoading: false,
      error: null,
    }),
}));