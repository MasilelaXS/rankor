import React from 'react';
import { clsx } from 'clsx';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  isLoading = false
}) => {
  if (!isOpen) return null;

  const icons = {
    info: <Info className="w-6 h-6 text-blue-500" />,
    warning: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
    error: <AlertCircle className="w-6 h-6 text-red-500" />,
    success: <CheckCircle className="w-6 h-6 text-green-500" />,
    confirm: <AlertTriangle className="w-6 h-6 text-yellow-500" />
  };

  const borderColors = {
    info: 'border-blue-200 dark:border-blue-800',
    warning: 'border-yellow-200 dark:border-yellow-800',
    error: 'border-red-200 dark:border-red-800',
    success: 'border-green-200 dark:border-green-800',
    confirm: 'border-yellow-200 dark:border-yellow-800'
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className={clsx(
          'w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-apple-lg border',
          borderColors[type],
          'transform transition-all duration-200 scale-100'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            {icons[type]}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            {type === 'confirm' ? (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {cancelText}
                </Button>
                <Button
                  variant="destructive"
                  onClick={onConfirm}
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {confirmText}
                </Button>
              </>
            ) : (
              <Button
                onClick={onClose}
                disabled={isLoading}
              >
                {confirmText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};