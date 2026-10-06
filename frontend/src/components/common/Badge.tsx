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
    bg: 'bg-status-green/10',
    text: 'text-status-green',
    border: 'border-status-green/25',
    dot: 'bg-status-green',
  },
  block: {
    bg: 'bg-status-red/10',
    text: 'text-status-red',
    border: 'border-status-red/25',
    dot: 'bg-status-red',
  },
  pending: {
    bg: 'bg-status-yellow/10',
    text: 'text-status-yellow',
    border: 'border-status-yellow/25',
    dot: 'bg-status-yellow',
  },
  warning: {
    bg: 'bg-status-yellow/10',
    text: 'text-status-yellow',
    border: 'border-status-yellow/25',
    dot: 'bg-status-yellow',
  },
  critical: {
    bg: 'bg-status-red/15',
    text: 'text-status-red',
    border: 'border-status-red/35',
    dot: 'bg-status-red',
  },
  high: {
    bg: 'bg-status-orange/10',
    text: 'text-status-orange',
    border: 'border-status-orange/25',
    dot: 'bg-status-orange',
  },
  medium: {
    bg: 'bg-status-yellow/10',
    text: 'text-status-yellow',
    border: 'border-status-yellow/25',
    dot: 'bg-status-yellow',
  },
  low: {
    bg: 'bg-graphite-800',
    text: 'text-graphite-400',
    border: 'border-graphite-750',
    dot: 'bg-graphite-500',
  },
  info: {
    bg: 'bg-status-blue/10',
    text: 'text-status-blue',
    border: 'border-status-blue/25',
    dot: 'bg-status-blue',
  },
  neutral: {
    bg: 'bg-graphite-800/80',
    text: 'text-graphite-300',
    border: 'border-graphite-750',
    dot: 'bg-graphite-400',
  },
  active: {
    bg: 'bg-status-green/10',
    text: 'text-status-green',
    border: 'border-status-green/25',
    dot: 'bg-status-green',
  },
  suspended: {
    bg: 'bg-status-red/10',
    text: 'text-status-red',
    border: 'border-status-red/25',
    dot: 'bg-status-red',
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
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : size === 'lg' ? 'text-xs px-2.5 py-1' : 'text-[11px] px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border font-mono tracking-wider uppercase ${style.bg} ${style.text} ${style.border} ${sizeClass} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />}
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
