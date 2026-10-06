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
      className={`flex flex-col items-center justify-center p-14 text-center border border-dashed border-[#222225] rounded-xl bg-[#0b0b0c]/40 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-[#121214] border border-[#222225] flex items-center justify-center text-copper-400 mb-4 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
        {icon || <ShieldAlert className="w-5 h-5 text-copper-400" />}
      </div>
      <h4 className="text-[17px] font-medium text-stone-100 mb-1.5 font-sans">{title}</h4>
      <p className="text-[14px] text-graphite-400 max-w-md mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
