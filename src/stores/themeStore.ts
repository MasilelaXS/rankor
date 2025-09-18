import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  systemPrefersDark: boolean;
}

interface ThemeActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  updateSystemPreference: (prefersDark: boolean) => void;
}

export type ThemeStore = ThemeState & ThemeActions;

// Helper function to determine if dark mode should be active
const getIsDark = (theme: Theme, systemPrefersDark: boolean): boolean => {
  if (theme === 'system') {
    return systemPrefersDark;
  }
  return theme === 'dark';
};

// Helper function to apply theme to document
const applyTheme = (isDark: boolean) => {
  const root = document.documentElement;
  
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Helper function to get system preference
const getSystemPreference = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => {
      return {
        theme: 'system',
        isDark: false,
        systemPrefersDark: false,

        setTheme: (theme: Theme) => {
          const systemPrefersDark = getSystemPreference();
          const isDark = getIsDark(theme, systemPrefersDark);
          applyTheme(isDark);
          
          set({ theme, isDark, systemPrefersDark });
        },

        toggleTheme: () => {
          const { theme } = get();
          let newTheme: Theme;
          
          if (theme === 'system') {
            newTheme = 'light';
          } else if (theme === 'light') {
            newTheme = 'dark';
          } else {
            newTheme = 'system';
          }
          
          get().setTheme(newTheme);
        },

        updateSystemPreference: (prefersDark: boolean) => {
          const { theme } = get();
          const isDark = getIsDark(theme, prefersDark);
          
          set({ systemPrefersDark: prefersDark, isDark });
          if (theme === 'system') {
            applyTheme(isDark);
          }
        },
      };
    },
    {
      name: 'theme-store',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Initialize system preference after hydration
          const systemPrefersDark = getSystemPreference();
          const isDark = getIsDark(state.theme, systemPrefersDark);
          
          state.systemPrefersDark = systemPrefersDark;
          state.isDark = isDark;
          
          // Apply theme after hydration
          applyTheme(isDark);
        }
      },
    }
  )
);

// Hook to set up system preference listener
export const useSystemThemeListener = () => {
  const updateSystemPreference = useThemeStore(state => state.updateSystemPreference);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      updateSystemPreference(e.matches);
    };
    
    // Set initial value
    updateSystemPreference(mediaQuery.matches);
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [updateSystemPreference]);
};