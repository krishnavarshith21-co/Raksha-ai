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
      className={`bg-graphite-850 border border-graphite-750 rounded-lg overflow-hidden transition-all duration-150 ${
        hoverable ? 'hover:border-graphite-700 hover:bg-graphite-850/80 cursor-pointer' : ''
      } ${className}`}
    >
      {(title || action) && (
        <div className="px-5 py-3.5 border-b border-graphite-750/70 flex items-center justify-between gap-4 bg-graphite-900/40">
          <div>
            {title && <h3 className="font-medium text-stone-100 text-[13px] tracking-tight">{title}</h3>}
            {subtitle && <p className="text-[11px] text-graphite-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
      {footer && <div className="px-5 py-2.5 border-t border-graphite-750/70 bg-graphite-900/30 text-xs text-graphite-400">{footer}</div>}
    </div>
  );
};
