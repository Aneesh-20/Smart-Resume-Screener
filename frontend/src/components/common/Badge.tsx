import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  dot?: boolean;
  dotColor?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  dotColor,
  className,
}) => {
  const variantStyles = {
    default: 'bg-stone-100/90 text-stone-700 border-stone-200 shadow-sm',
    primary: 'bg-rose-50/90 text-rose-800 border-rose-200/90 shadow-sm',
    success: 'bg-emerald-50/90 text-emerald-800 border-emerald-200/90 shadow-sm',
    warning: 'bg-amber-50/90 text-amber-800 border-amber-200/90 shadow-sm',
    danger: 'bg-rose-50/90 text-rose-800 border-rose-200/90 shadow-sm',
    info: 'bg-sky-50/90 text-sky-800 border-sky-200/90 shadow-sm',
    purple: 'bg-purple-50/90 text-purple-800 border-purple-200/90 shadow-sm',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-[11px] gap-1.5 font-medium',
    md: 'px-3 py-1 text-xs gap-1.5 font-semibold',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border tracking-wide transition-all duration-200',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full shrink-0 shadow-sm', dotColor || 'bg-current')}
        />
      )}
      <span>{children}</span>
    </span>
  );
};
