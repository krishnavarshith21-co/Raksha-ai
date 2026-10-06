import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading telemetry...',
  size = 'md',
  fullHeight = false,
}) => {
  const sizeMap = {
    sm: 'w-3.5 h-3.5 border-[1.5px]',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-2',
  }[size];

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-graphite-400 gap-2.5 ${
        fullHeight ? 'min-h-[50vh]' : ''
      }`}
    >
      <div
        className={`${sizeMap} rounded-full border-graphite-750 border-t-copper-500 animate-spin`}
      />
      {label && (
        <span className="text-[11px] font-mono text-graphite-400 tracking-wider uppercase">
          {label}
        </span>
      )}
    </div>
  );
};
