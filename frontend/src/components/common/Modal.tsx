import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-graphite-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidthClass} bg-graphite-900 border border-graphite-750 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-graphite-800 flex items-center justify-between gap-4 shrink-0 bg-graphite-900">
          <div>
            <h3 className="text-sm font-semibold text-stone-100">{title}</h3>
            {subtitle && <p className="text-xs text-graphite-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-graphite-400 hover:text-stone-100 hover:bg-graphite-800 border border-transparent hover:border-graphite-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-3.5 border-t border-graphite-800 bg-graphite-950/40 flex items-center justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
