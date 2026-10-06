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
  let barColor = 'bg-emerald-400';
  let strokeHex = '#10B981';
  let label = 'Low Risk';
  let badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  if (normalizedScore >= 80) {
    color = 'text-red-400';
    barColor = 'bg-red-400';
    strokeHex = '#EF4444';
    label = 'Critical';
    badgeClass = 'bg-red-500/15 text-red-400 border-red-500/35';
  } else if (normalizedScore >= 60) {
    color = 'text-orange-400';
    barColor = 'bg-orange-400';
    strokeHex = '#F97316';
    label = 'High';
    badgeClass = 'bg-orange-500/12 text-orange-400 border-orange-500/30';
  } else if (normalizedScore >= 30) {
    color = 'text-amber-400';
    barColor = 'bg-amber-400';
    strokeHex = '#F59E0B';
    label = 'Medium';
    badgeClass = 'bg-amber-500/12 text-amber-400 border-amber-500/30';
  }

  if (size === 'sm') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <div className="w-16 h-1.5 bg-white/[0.08] rounded-full overflow-hidden shrink-0">
          <div
            className={`h-full ${barColor} rounded-full transition-all duration-300`}
            style={{ width: `${normalizedScore}%` }}
          />
        </div>
        <span className={`font-mono text-[13px] font-semibold tabular-nums ${color}`}>
          {normalizedScore}
        </span>
      </div>
    );
  }

  if (size === 'lg') {
    const radius = 46;
    const circumference = Math.PI * radius;
    const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

    return (
      <div className={`flex flex-col items-center ${className}`}>
        <div className="relative w-28 h-16 flex items-end justify-center overflow-hidden">
          <svg className="w-28 h-28 transform -rotate-180" viewBox="0 0 100 100">
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke={strokeHex}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute bottom-0 text-center">
            <span className={`text-2xl font-mono font-bold tabular-nums ${color}`}>
              {normalizedScore}
            </span>
          </div>
        </div>
        {showLabel && (
          <span className={`mt-2 font-mono text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded border ${badgeClass}`}>
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-24 h-2 bg-white/[0.08] rounded-full overflow-hidden shrink-0">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-300`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
      <span className={`font-mono text-[14px] font-semibold tabular-nums ${color}`}>
        {normalizedScore}
      </span>
      {showLabel && (
        <span className={`font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 rounded border ${badgeClass}`}>
          {label}
        </span>
      )}
    </div>
  );
};
