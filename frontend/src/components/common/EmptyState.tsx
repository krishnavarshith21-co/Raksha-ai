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
      className={`flex flex-col items-center justify-center p-12 text-center border border-dashed border-graphite-750 rounded-lg bg-graphite-900/30 ${className}`}
    >
      <div className="w-10 h-10 rounded-md bg-graphite-850 border border-graphite-750 flex items-center justify-center text-graphite-400 mb-3.5 shadow-sm">
        {icon || <ShieldAlert className="w-4 h-4 text-copper-400" />}
      </div>
      <h4 className="text-[13px] font-medium text-stone-100 mb-1">{title}</h4>
      <p className="text-xs text-graphite-400 max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
