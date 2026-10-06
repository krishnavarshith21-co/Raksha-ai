import React from 'react';
import { Loader2, Shield } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading security data...',
  size = 'md',
  fullHeight = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-zinc-400 gap-3 ${
        fullHeight ? 'min-h-[50vh]' : ''
      }`}
    >
      <div className="relative">
        <Loader2 className={`${sizeClasses} animate-spin text-amber-500`} />
        {size === 'lg' && (
          <Shield className="w-5 h-5 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
      </div>
      {label && <span className="text-xs font-mono text-zinc-400 tracking-wide">{label}</span>}
    </div>
  );
};
