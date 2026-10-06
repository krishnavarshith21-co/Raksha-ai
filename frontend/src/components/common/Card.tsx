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
      className={`surface-card ${
        hoverable ? 'surface-card-hover cursor-pointer' : ''
      } ${className}`}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between gap-4 bg-white/[0.01]">
          <div>
            {title && (
              <h3 className="font-medium text-[#F2EEE7] text-base lg:text-[17px] tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[13px] text-[#96939A] mt-0.5 leading-normal">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
      {footer && (
        <div className="px-6 py-3.5 border-t border-white/[0.06] bg-white/[0.01] text-[13px] text-[#96939A]">
          {footer}
        </div>
      )}
    </div>
  );
};
