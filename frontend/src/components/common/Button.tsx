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
    sm: 'text-xs px-2.5 py-1.5 rounded-md gap-1.5 font-sans',
    md: 'text-xs px-3.5 py-2 rounded-md gap-2 font-sans',
    lg: 'text-sm px-4.5 py-2.5 rounded-lg gap-2.5 font-sans',
  }[size];

  const variantClasses = {
    primary:
      'bg-copper-500 hover:bg-copper-400 text-graphite-950 font-medium shadow-sm active:translate-y-px transition-colors',
    secondary:
      'bg-graphite-800 hover:bg-graphite-750 text-stone-100 border border-graphite-700 hover:border-graphite-600 shadow-sm active:translate-y-px transition-colors',
    danger:
      'bg-status-red/15 hover:bg-status-red/25 text-red-300 border border-status-red/30 shadow-sm active:translate-y-px transition-colors',
    success:
      'bg-status-green/15 hover:bg-status-green/25 text-emerald-300 border border-status-green/30 shadow-sm active:translate-y-px transition-colors',
    outline:
      'bg-transparent hover:bg-graphite-850 text-graphite-300 hover:text-stone-100 border border-graphite-750 hover:border-graphite-600 transition-colors',
    ghost:
      'bg-transparent hover:bg-graphite-850 text-graphite-400 hover:text-stone-100 transition-colors',
  }[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none ${sizeClasses} ${variantClasses} ${className}`}
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
