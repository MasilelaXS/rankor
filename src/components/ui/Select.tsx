import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  children,
  className = '',
  error,
  ...props 
}) => {
  return (
    <div>
      <select
        className={`
          w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
          rounded-lg bg-white dark:bg-gray-800 
          text-gray-900 dark:text-gray-100
          focus:ring-2 focus:ring-[#cc0000] focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};