import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry, fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="w-12 h-12 text-error mb-4" />
      <p className="text-text-primary font-medium mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-error text-white rounded-xl hover:bg-red-600 transition-colors shadow-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="bg-surface p-8 rounded-xl shadow-md max-w-sm w-full mx-4">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default ErrorState;
