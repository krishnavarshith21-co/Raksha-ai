import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  footer,
  className = '',
  bodyClassName = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-hidden shadow-sm backdrop-blur-sm ${
        hoverable ? 'hover:border-zinc-700 hover:shadow-lg transition-all duration-200 cursor-pointer' : ''
      } ${className}`}
    >
      {(title || action) && (
        <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="font-semibold text-zinc-100 text-sm tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
      {footer && <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-950/40 text-xs text-zinc-400">{footer}</div>}
    </div>
  );
};
