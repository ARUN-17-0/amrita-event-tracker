import React from 'react';

export interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: () => void;
  actionLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, message, icon, action, actionLabel }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-surface rounded-xl border border-border shadow-sm">
      {icon && <div className="text-text-secondary opacity-50 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-md mb-6">{message}</p>
      {action && actionLabel && (
        <button
          onClick={action}
          className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
