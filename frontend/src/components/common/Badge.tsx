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
    default: 'bg-stone-100 text-stone-900 border-2 border-stone-900 shadow-[1.5px_1.5px_0px_0px_#1c1917]',
    primary: 'bg-rose-100 text-rose-950 border-2 border-stone-900 shadow-[1.5px_1.5px_0px_0px_#1c1917]',
    success: 'bg-emerald-100 text-emerald-950 border-2 border-stone-900 shadow-[1.5px_1.5px_0px_0px_#1c1917]',
    warning: 'bg-amber-100 text-amber-950 border-2 border-stone-900 shadow-[1.5px_1.5px_0px_0px_#1c1917]',
    danger: 'bg-rose-200 text-rose-950 border-2 border-stone-900 shadow-[1.5px_1.5px_0px_0px_#1c1917]',
    info: 'bg-sky-100 text-sky-950 border-2 border-stone-900 shadow-[1.5px_1.5px_0px_0px_#1c1917]',
    purple: 'bg-purple-100 text-purple-950 border-2 border-stone-900 shadow-[1.5px_1.5px_0px_0px_#1c1917]',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-[11px] gap-1.5 font-bold',
    md: 'px-3 py-1 text-xs gap-1.5 font-extrabold',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-lg tracking-wide transition-all duration-150',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={clsx('w-2 h-2 rounded-full shrink-0 border border-stone-900', dotColor || 'bg-current')}
        />
      )}
      <span>{children}</span>
    </span>
  );
};
