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
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  block: {
    bg: 'bg-red-500/12',
    text: 'text-red-400',
    border: 'border-red-500/30',
    dot: 'bg-red-400',
  },
  pending: {
    bg: 'bg-[#C9A66B]/12',
    text: 'text-[#E0C28D]',
    border: 'border-[#C9A66B]/35',
    dot: 'bg-[#C9A66B]',
  },
  warning: {
    bg: 'bg-amber-500/12',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
  },
  critical: {
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/40',
    dot: 'bg-red-400',
  },
  high: {
    bg: 'bg-orange-500/12',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    dot: 'bg-orange-400',
  },
  medium: {
    bg: 'bg-amber-500/12',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
  },
  low: {
    bg: 'bg-white/[0.04]',
    text: 'text-[#96939A]',
    border: 'border-white/[0.08]',
    dot: 'bg-[#66636A]',
  },
  info: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/25',
    dot: 'bg-blue-400',
  },
  neutral: {
    bg: 'bg-white/[0.04]',
    text: 'text-[#D8D4CC]',
    border: 'border-white/[0.09]',
    dot: 'bg-[#96939A]',
  },
  active: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  suspended: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/25',
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
  const sizeClass =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5 tracking-wider'
      : size === 'lg'
      ? 'text-[13px] px-3.5 py-1 tracking-wider'
      : 'text-[12px] px-2.5 py-0.5 tracking-wider';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-md border uppercase ${style.bg} ${style.text} ${style.border} ${sizeClass} ${className}`}
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
      return 'active';
    case 'BLOCKED':
    case 'SUSPENDED':
    case 'REJECTED':
      return 'suspended';
    case 'PENDING':
    case 'INVESTIGATING':
    case 'OPEN':
      return 'pending';
    default:
      return 'neutral';
  }
}
