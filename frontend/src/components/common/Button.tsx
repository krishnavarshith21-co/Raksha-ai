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
    sm: 'text-[13px] px-3 py-1.5 rounded-lg gap-1.5 h-8 font-medium',
    md: 'text-[14px] px-4 py-2 rounded-lg gap-2 h-10 font-medium',
    lg: 'text-[15px] px-5 py-2.5 rounded-lg gap-2.5 h-12 font-medium',
  }[size];

  const variantClasses = {
    primary:
      'bg-gradient-to-b from-[#E0C28D] to-[#C9A66B] hover:from-[#EBD3A9] hover:to-[#D4B691] text-[#070707] font-semibold border border-white/20 shadow-md shadow-[#C9A66B]/15 active:translate-y-px transition-all',
    secondary:
      'bg-[#141415] hover:bg-[#1A1A1C] text-[#F2EEE7] border border-white/10 hover:border-white/15 shadow-sm active:translate-y-px transition-all',
    danger:
      'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/35 shadow-sm active:translate-y-px transition-all',
    success:
      'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/35 shadow-sm active:translate-y-px transition-all',
    outline:
      'bg-transparent hover:bg-white/[0.05] text-[#96939A] hover:text-[#F2EEE7] border border-white/10 hover:border-white/20 transition-all',
    ghost:
      'bg-transparent hover:bg-white/[0.05] text-[#96939A] hover:text-[#F2EEE7] transition-all',
  }[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed select-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
