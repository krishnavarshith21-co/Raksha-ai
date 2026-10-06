import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center border border-dashed border-graphite-800 rounded-xl bg-graphite-900/30 ${className}`}
    >
      <div className="w-11 h-11 rounded-lg bg-graphite-850 border border-graphite-750 flex items-center justify-center text-graphite-400 mb-4 shadow-inner">
        {icon || <ShieldAlert className="w-5 h-5 text-copper-400/80" />}
      </div>
      <h4 className="text-sm font-medium text-stone-200 mb-1">{title}</h4>
      <p className="text-xs text-graphite-400 max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
