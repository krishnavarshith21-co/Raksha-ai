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
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-300',
    border: 'border-emerald-700/40',
    dot: 'bg-emerald-400',
  },
  block: {
    bg: 'bg-rose-950/40',
    text: 'text-rose-300',
    border: 'border-rose-700/40',
    dot: 'bg-rose-400',
  },
  pending: {
    bg: 'bg-amber-950/40',
    text: 'text-amber-300',
    border: 'border-amber-700/40',
    dot: 'bg-amber-400 animate-pulse',
  },
  warning: {
    bg: 'bg-amber-950/40',
    text: 'text-amber-300',
    border: 'border-amber-700/40',
    dot: 'bg-amber-400',
  },
  critical: {
    bg: 'bg-red-950/50',
    text: 'text-red-300',
    border: 'border-red-600/50',
    dot: 'bg-red-400 animate-ping',
  },
  high: {
    bg: 'bg-orange-950/40',
    text: 'text-orange-300',
    border: 'border-orange-700/40',
    dot: 'bg-orange-400',
  },
  medium: {
    bg: 'bg-yellow-950/40',
    text: 'text-yellow-300',
    border: 'border-yellow-700/30',
    dot: 'bg-yellow-400',
  },
  low: {
    bg: 'bg-graphite-850',
    text: 'text-graphite-300',
    border: 'border-graphite-700',
    dot: 'bg-graphite-400',
  },
  info: {
    bg: 'bg-sky-950/40',
    text: 'text-sky-300',
    border: 'border-sky-700/40',
    dot: 'bg-sky-400',
  },
  neutral: {
    bg: 'bg-graphite-850',
    text: 'text-graphite-300',
    border: 'border-graphite-700',
    dot: 'bg-graphite-400',
  },
  active: {
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-300',
    border: 'border-emerald-700/40',
    dot: 'bg-emerald-400',
  },
  suspended: {
    bg: 'bg-red-950/40',
    text: 'text-red-300',
    border: 'border-red-700/40',
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
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : size === 'lg' ? 'text-xs px-3 py-1' : 'text-[11px] px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded border font-mono tracking-wide uppercase ${style.bg} ${style.text} ${style.border} ${sizeClass} ${className}`}
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
