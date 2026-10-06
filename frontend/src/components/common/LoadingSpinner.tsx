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
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  }[size];

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-graphite-400 gap-3 ${
        fullHeight ? 'min-h-[50vh]' : ''
      }`}
    >
      <div className="relative">
        <Loader2 className={`${sizeClasses} animate-spin text-copper-400`} />
        {size === 'lg' && (
          <Shield className="w-4 h-4 text-copper-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
      </div>
      {label && <span className="text-xs font-mono text-graphite-400 tracking-wide">{label}</span>}
    </div>
  );
};
