import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { handleGlobalTokenExpiration } from '../hooks/useTokenValidation';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ApiErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('API Error Boundary caught an error:', error, errorInfo);

    // Check if it's a token expiration error
    if (error.message.includes('token expired') || 
        error.message.includes('Authentication') ||
        error.message.includes('401')) {
      console.warn('Token expiration detected in error boundary, logging out...');
      handleGlobalTokenExpiration();
      return;
    }
  }

  public render() {
    if (this.state.hasError) {
      // Check for token expiration errors
      if (this.state.error?.message.includes('token expired') || 
          this.state.error?.message.includes('Authentication') ||
          this.state.error?.message.includes('401')) {
        // Don't render anything, let the global handler redirect
        return null;
      }

      // Render generic error fallback for other errors
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Something went wrong
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-[#cc0000] text-white py-2 px-4 rounded-lg hover:bg-[#990000] transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}