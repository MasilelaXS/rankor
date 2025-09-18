import { create } from 'zustand';
import type { 
  RatingFormData,
  SubmitRatingResponse,
  SystemInfo 
} from '../types/api';

interface RatingState {
  // System info
  systemInfo: SystemInfo | null;
  
  // Rating form data
  formData: RatingFormData | null;
  isFormLoading: boolean;
  
  // Submission state
  isSubmitting: boolean;
  submissionResult: SubmitRatingResponse | null;
  
  // Form answers
  answers: Record<string, number>;
  comments: string;
  
  // Error state
  error: string | null;
  
  // Form validation
  isValid: boolean;
}

interface RatingActions {
  // System info actions
  setSystemInfo: (info: SystemInfo) => void;
  
  // Form data actions
  setFormData: (data: RatingFormData) => void;
  setFormLoading: (loading: boolean) => void;
  
  // Answer actions
  setAnswer: (questionId: string, value: number) => void;
  setAnswers: (answers: Record<string, number>) => void;
  setComments: (comments: string) => void;
  
  // Submission actions
  setSubmitting: (submitting: boolean) => void;
  setSubmissionResult: (result: SubmitRatingResponse) => void;
  
  // Validation actions
  validateForm: () => boolean;
  setValid: (valid: boolean) => void;
  
  // Error actions
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Reset actions
  resetForm: () => void;
  reset: () => void;
}

export type RatingStore = RatingState & RatingActions;

export const useRatingStore = create<RatingStore>((set, get) => ({
  // Initial state
  systemInfo: null,
  formData: null,
  isFormLoading: false,
  isSubmitting: false,
  submissionResult: null,
  answers: {},
  comments: '',
  error: null,
  isValid: false,

  // System info actions
  setSystemInfo: (systemInfo) => set({ systemInfo }),

  // Form data actions
  setFormData: (formData) => {
    set({ formData, error: null });
    // Initialize answers object with default values
    if (formData?.questions) {
      const initialAnswers: Record<string, number> = {};
      formData.questions.forEach((q) => {
        initialAnswers[q.id.toString()] = 0;
      });
      set({ answers: initialAnswers });
    }
  },
  setFormLoading: (isFormLoading) => set({ isFormLoading }),

  // Answer actions
  setAnswer: (questionId, value) => {
    set((state) => {
      const newAnswers = { ...state.answers, [questionId]: value };
      const isValid = get().validateForm();
      return { 
        answers: newAnswers,
        isValid,
        error: null 
      };
    });
  },
  
  setAnswers: (answers) => {
    set({ answers });
    const isValid = get().validateForm();
    set({ isValid });
  },
  
  setComments: (comments) => set({ comments }),

  // Submission actions
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setSubmissionResult: (submissionResult) => set({ submissionResult, error: null }),

  // Validation actions
  validateForm: () => {
    const state = get();
    if (!state.formData?.questions) return false;
    
    // Check if all questions have been answered (value > 0)
    const allQuestionsAnswered = state.formData.questions.every((question) => {
      const answer = state.answers[question.id.toString()];
      return answer && answer > 0 && answer <= 5;
    });
    
    return allQuestionsAnswered;
  },
  
  setValid: (isValid) => set({ isValid }),

  // Error actions
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Reset actions
  resetForm: () =>
    set({
      answers: {},
      comments: '',
      isValid: false,
      error: null,
    }),
    
  reset: () =>
    set({
      systemInfo: null,
      formData: null,
      isFormLoading: false,
      isSubmitting: false,
      submissionResult: null,
      answers: {},
      comments: '',
      error: null,
      isValid: false,
    }),
}));