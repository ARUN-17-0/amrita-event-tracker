import React, { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

export interface FormDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  loading?: boolean;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

export const FormDialog: React.FC<FormDialogProps> = ({
  open,
  title,
  onClose,
  onSubmit,
  submitLabel = 'Submit',
  loading = false,
  children,
  width = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, loading]);

  if (!open) return null;

  const widthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }[width];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />
      <div className={`relative bg-surface w-full ${widthClass} rounded-xl shadow-lg border border-border flex flex-col max-h-[90vh]`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-1 text-text-secondary hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 overflow-y-auto flex-1">
            {children}
          </div>
          <div className="p-4 border-t border-border flex justify-end gap-3 bg-gray-50/50 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-text-secondary hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormDialog;
