import React from 'react';
import { clsx } from 'clsx';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'sunset';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-black rounded-2xl border-[2.5px] border-slate-900 transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#0f172a]';

  const variantStyles = {
    primary: 'bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white shadow-[3.5px_3.5px_0px_0px_#0f172a] hover:shadow-[5.5px_5.5px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5',
    sunset: 'bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white shadow-[3.5px_3.5px_0px_0px_#0f172a] hover:shadow-[5.5px_5.5px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5',
    secondary: 'bg-white hover:bg-sky-50 text-slate-950 shadow-[3px_3px_0px_0px_#0f172a] hover:shadow-[5px_5px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5',
    outline: 'bg-white hover:bg-gradient-to-r hover:from-[#0284c7] hover:via-[#0ea5e9] hover:to-[#38bdf8] hover:text-white text-slate-950 shadow-[3px_3px_0px_0px_#0f172a] hover:shadow-[5px_5px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5',
    danger: 'bg-rose-50 hover:bg-rose-100 text-rose-950 shadow-[3px_3px_0px_0px_#0f172a] hover:shadow-[5px_5px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5',
    ghost: 'border-transparent hover:border-slate-900 text-slate-700 hover:text-slate-950 hover:bg-slate-100 shadow-none hover:shadow-[2px_2px_0px_0px_#0f172a]',
  };

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-4.5 py-2 text-sm gap-2',
    lg: 'px-6 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner size="sm" /> : leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
