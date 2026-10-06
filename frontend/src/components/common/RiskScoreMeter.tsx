import React from 'react';

interface RiskScoreMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const RiskScoreMeter: React.FC<RiskScoreMeterProps> = ({
  score = 0,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));

  let color = 'text-status-green';
  let barColor = 'bg-status-green';
  let label = 'Low Risk';
  let badgeBg = 'bg-status-green/10 border-status-green/30 text-emerald-300';

  if (normalizedScore >= 80) {
    color = 'text-status-red';
    barColor = 'bg-status-red';
    label = 'Critical';
    badgeBg = 'bg-status-red/10 border-status-red/30 text-red-300';
  } else if (normalizedScore >= 60) {
    color = 'text-copper-400';
    barColor = 'bg-copper-500';
    label = 'High Risk';
    badgeBg = 'bg-copper-500/10 border-copper-500/30 text-copper-300';
  } else if (normalizedScore >= 30) {
    color = 'text-status-yellow';
    barColor = 'bg-status-yellow';
    label = 'Medium Risk';
    badgeBg = 'bg-status-yellow/10 border-status-yellow/30 text-amber-300';
  }

  if (size === 'sm') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-16 h-1.5 bg-graphite-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-300`}
            style={{ width: `${normalizedScore}%` }}
          />
        </div>
        <span className={`font-mono text-xs font-semibold ${color}`}>{normalizedScore}</span>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`p-4 rounded-lg bg-graphite-900 border border-graphite-800 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider text-graphite-400 font-mono">Risk Level</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${badgeBg}`}>
            {label}
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-3xl font-semibold font-mono ${color}`}>{normalizedScore}</span>
          <span className="text-graphite-500 text-xs font-mono">/ 100</span>
        </div>
        <div className="w-full h-1.5 bg-graphite-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-500`}
            style={{ width: `${normalizedScore}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-20 h-1.5 bg-graphite-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`font-mono text-xs font-medium ${color}`}>{normalizedScore}</span>
        {showLabel && (
          <span className="text-[11px] text-graphite-400 font-mono">({label})</span>
        )}
      </div>
    </div>
  );
};
