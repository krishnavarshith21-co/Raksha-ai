import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 rounded-md gap-1.5 h-7 font-sans',
    md: 'text-xs px-3.5 py-1.5 rounded-md gap-2 h-8.5 font-sans',
    lg: 'text-[13px] px-4 py-2 rounded-md gap-2 h-10 font-sans',
  }[size];

  const variantClasses = {
    primary:
      'bg-copper-500 hover:bg-copper-400 text-graphite-950 font-medium shadow-sm active:translate-y-px transition-colors',
    secondary:
      'bg-graphite-800/90 hover:bg-graphite-750 text-stone-100 border border-graphite-700 hover:border-graphite-600 shadow-sm active:translate-y-px transition-colors',
    danger:
      'bg-status-red/10 hover:bg-status-red/20 text-status-red border border-status-red/25 shadow-sm active:translate-y-px transition-colors',
    success:
      'bg-status-green/10 hover:bg-status-green/20 text-status-green border border-status-green/25 shadow-sm active:translate-y-px transition-colors',
    outline:
      'bg-transparent hover:bg-graphite-850 text-graphite-300 hover:text-stone-100 border border-graphite-750 hover:border-graphite-700 transition-colors',
    ghost:
      'bg-transparent hover:bg-graphite-850 text-graphite-400 hover:text-stone-100 transition-colors',
  }[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed select-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
