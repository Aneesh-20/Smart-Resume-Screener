import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  padding = 'md',
  className,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-slate-900 border border-slate-800',
    glass: 'bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-lg shadow-black/20',
    interactive: 'bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all duration-200 shadow-lg shadow-black/20 group',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={clsx('rounded-2xl', variantStyles[variant], paddingStyles[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
};
