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
    default: 'bg-white/[0.05] backdrop-blur-md text-slate-300 border-white/10 shadow-glass-sm',
    primary: 'bg-indigo-500/15 backdrop-blur-md text-indigo-200 border-indigo-400/30 shadow-[0_0_12px_rgba(99,102,241,0.2)]',
    success: 'bg-emerald-500/15 backdrop-blur-md text-emerald-200 border-emerald-400/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    warning: 'bg-amber-500/15 backdrop-blur-md text-amber-200 border-amber-400/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    danger: 'bg-rose-500/15 backdrop-blur-md text-rose-200 border-rose-400/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
    info: 'bg-cyan-500/15 backdrop-blur-md text-cyan-200 border-cyan-400/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
    purple: 'bg-purple-500/15 backdrop-blur-md text-purple-200 border-purple-400/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]',
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
