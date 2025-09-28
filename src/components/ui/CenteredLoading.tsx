import React from 'react';
import { LoadingSpinner } from './Loading';

interface CenteredLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CenteredLoading: React.FC<CenteredLoadingProps> = ({ 
  message = 'Loading...', 
  size = 'lg',
  className = ''
}) => {
  return (
    <div className={`p-8 flex items-center justify-center min-h-96 ${className}`}>
      <div className="text-center flex flex-col items-center">
        <LoadingSpinner size={size} />
        <p className="text-gray-600 dark:text-gray-400 mt-4">
          {message}
        </p>
      </div>
    </div>
  );
};