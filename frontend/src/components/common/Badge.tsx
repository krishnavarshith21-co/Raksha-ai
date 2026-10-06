import React from 'react';

export type BadgeVariant = 
  | 'allow' | 'block' | 'pending' | 'warning'
  | 'critical' | 'high' | 'medium' | 'low'
  | 'info' | 'neutral' | 'active' | 'suspended';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dot: string }> = {
  allow: {
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-300',
    border: 'border-emerald-700/50',
    dot: 'bg-emerald-400',
  },
  block: {
    bg: 'bg-rose-950/60',
    text: 'text-rose-300',
    border: 'border-rose-700/50',
    dot: 'bg-rose-400',
  },
  pending: {
    bg: 'bg-amber-950/60',
    text: 'text-amber-300',
    border: 'border-amber-700/50',
    dot: 'bg-amber-400 animate-pulse',
  },
  warning: {
    bg: 'bg-amber-950/60',
    text: 'text-amber-300',
    border: 'border-amber-700/50',
    dot: 'bg-amber-400',
  },
  critical: {
    bg: 'bg-red-950/80',
    text: 'text-red-300',
    border: 'border-red-600/60',
    dot: 'bg-red-500 animate-ping',
  },
  high: {
    bg: 'bg-orange-950/60',
    text: 'text-orange-300',
    border: 'border-orange-700/50',
    dot: 'bg-orange-400',
  },
  medium: {
    bg: 'bg-yellow-950/50',
    text: 'text-yellow-300',
    border: 'border-yellow-700/40',
    dot: 'bg-yellow-400',
  },
  low: {
    bg: 'bg-slate-900/60',
    text: 'text-slate-300',
    border: 'border-slate-700/50',
    dot: 'bg-slate-400',
  },
  info: {
    bg: 'bg-sky-950/60',
    text: 'text-sky-300',
    border: 'border-sky-700/50',
    dot: 'bg-sky-400',
  },
  neutral: {
    bg: 'bg-zinc-800/80',
    text: 'text-zinc-300',
    border: 'border-zinc-700/50',
    dot: 'bg-zinc-400',
  },
  active: {
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-300',
    border: 'border-emerald-700/50',
    dot: 'bg-emerald-400',
  },
  suspended: {
    bg: 'bg-red-950/60',
    text: 'text-red-300',
    border: 'border-red-700/50',
    dot: 'bg-red-400',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const style = variantStyles[variant] || variantStyles.neutral;
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : size === 'lg' ? 'text-xs px-3 py-1' : 'text-xs px-2.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border font-mono uppercase tracking-wider ${style.bg} ${style.text} ${style.border} ${sizeClass} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      {children}
    </span>
  );
};

export function getDecisionBadgeVariant(decision: string): BadgeVariant {
  switch (decision?.toUpperCase()) {
    case 'ALLOW':
      return 'allow';
    case 'BLOCK':
      return 'block';
    case 'REQUIRE_APPROVAL':
      return 'pending';
    default:
      return 'neutral';
  }
}

export function getSeverityBadgeVariant(severity: string): BadgeVariant {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return 'critical';
    case 'HIGH':
      return 'high';
    case 'MEDIUM':
      return 'medium';
    case 'LOW':
      return 'low';
    default:
      return 'neutral';
  }
}

export function getStatusBadgeVariant(status: string): BadgeVariant {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'RESOLVED':
    case 'EXECUTED':
      return 'allow';
    case 'BLOCKED':
    case 'REJECTED':
    case 'SUSPENDED':
      return 'block';
    case 'PENDING':
    case 'INVESTIGATING':
      return 'pending';
    default:
      return 'neutral';
  }
}
