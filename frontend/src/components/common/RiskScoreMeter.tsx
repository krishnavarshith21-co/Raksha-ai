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

  let color = 'text-emerald-400';
  let barColor = 'bg-emerald-500';
  let label = 'Low Risk';
  let badgeBg = 'bg-emerald-950/60 border-emerald-800/40 text-emerald-300';

  if (normalizedScore >= 80) {
    color = 'text-red-400';
    barColor = 'bg-red-500';
    label = 'Critical Risk';
    badgeBg = 'bg-red-950/60 border-red-800/50 text-red-300';
  } else if (normalizedScore >= 60) {
    color = 'text-orange-400';
    barColor = 'bg-orange-500';
    label = 'High Risk';
    badgeBg = 'bg-orange-950/60 border-orange-800/50 text-orange-300';
  } else if (normalizedScore >= 30) {
    color = 'text-amber-400';
    barColor = 'bg-amber-500';
    label = 'Medium Risk';
    badgeBg = 'bg-amber-950/60 border-amber-800/50 text-amber-300';
  }

  if (size === 'sm') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
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
      <div className={`p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Risk Score</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${badgeBg}`}>
            {label}
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-3xl font-bold font-mono ${color}`}>{normalizedScore}</span>
          <span className="text-zinc-500 text-sm font-mono">/ 100</span>
        </div>
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
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
      <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`font-mono text-sm font-bold ${color}`}>{normalizedScore}</span>
        {showLabel && (
          <span className="text-xs text-zinc-400 font-mono">({label})</span>
        )}
      </div>
    </div>
  );
};
