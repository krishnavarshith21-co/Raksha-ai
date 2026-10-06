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
      className={`bg-graphite-900 border border-graphite-800 rounded-lg overflow-hidden transition-all duration-200 ${
        hoverable ? 'hover:border-graphite-700 hover:shadow-md cursor-pointer' : ''
      } ${className}`}
    >
      {(title || action) && (
        <div className="px-5 py-3.5 border-b border-graphite-800 flex items-center justify-between gap-4 bg-graphite-900/60">
          <div>
            {title && <h3 className="font-medium text-stone-100 text-sm tracking-tight">{title}</h3>}
            {subtitle && <p className="text-[11px] text-graphite-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
      {footer && <div className="px-5 py-3 border-t border-graphite-800 bg-graphite-950/40 text-xs text-graphite-400">{footer}</div>}
    </div>
  );
};
