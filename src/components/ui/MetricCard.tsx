import React from 'react';
import { clsx } from 'clsx';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className
}) => {
  return (
    <div className={clsx(
      'bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-apple-lg',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={clsx(
                'text-sm font-medium',
                trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500 ml-1">
                vs last month
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-gray-600 dark:text-gray-400">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};