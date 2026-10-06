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
  let strokeHex = '#30a46c';
  let label = 'Low Risk';
  let badgeClass = 'bg-status-green/10 text-status-green border-status-green/25';

  if (normalizedScore >= 80) {
    color = 'text-status-red';
    barColor = 'bg-status-red';
    strokeHex = '#e5484d';
    label = 'Critical';
    badgeClass = 'bg-status-red/10 text-status-red border-status-red/25';
  } else if (normalizedScore >= 60) {
    color = 'text-status-orange';
    barColor = 'bg-status-orange';
    strokeHex = '#e07a3c';
    label = 'High';
    badgeClass = 'bg-status-orange/10 text-status-orange border-status-orange/25';
  } else if (normalizedScore >= 30) {
    color = 'text-status-yellow';
    barColor = 'bg-status-yellow';
    strokeHex = '#f5a623';
    label = 'Medium';
    badgeClass = 'bg-status-yellow/10 text-status-yellow border-status-yellow/25';
  }

  if (size === 'sm') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-14 h-1 bg-graphite-800 rounded-full overflow-hidden shrink-0">
          <div
            className={`h-full ${barColor} transition-all duration-300`}
            style={{ width: `${normalizedScore}%` }}
          />
        </div>
        <span className={`font-mono text-[11px] font-medium tabular-nums ${color}`}>{normalizedScore}</span>
      </div>
    );
  }

  if (size === 'lg') {
    // Semi-circular precision SVG gauge
    const radius = 42;
    const strokeWidth = 5;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = Math.PI * normalizedRadius; // half circle arc
    const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

    return (
      <div className={`p-4 rounded-lg bg-graphite-850 border border-graphite-750 flex flex-col items-center justify-center relative ${className}`}>
        <div className="w-full flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-graphite-400 font-mono">Risk Telemetry</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase border ${badgeClass}`}>
            {label}
          </span>
        </div>

        <div className="relative flex items-center justify-center my-1">
          <svg height="60" width="104" className="overflow-visible">
            {/* Background arc */}
            <path
              d="M 10 52 A 42 42 0 0 1 94 52"
              fill="none"
              stroke="#1a1b1f"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* Value arc */}
            <path
              d="M 10 52 A 42 42 0 0 1 94 52"
              fill="none"
              stroke={strokeHex}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
            />
          </svg>
          <div className="absolute top-4 flex flex-col items-center">
            <span className={`text-2xl font-mono font-medium tracking-tight tabular-nums ${color}`}>
              {normalizedScore}
            </span>
            <span className="text-[9px] text-graphite-500 font-mono -mt-0.5">/ 100</span>
          </div>
        </div>
      </div>
    );
  }

  // md default
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="w-18 h-1.5 bg-graphite-800 rounded-full overflow-hidden shrink-0">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
      <div className="flex items-center gap-1.5 font-mono text-xs">
        <span className={`font-medium tabular-nums ${color}`}>{normalizedScore}</span>
        {showLabel && (
          <span className="text-[10px] text-graphite-400 font-mono">({label})</span>
        )}
      </div>
    </div>
  );
};
