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
  const baseStyles = 'inline-flex items-center justify-center font-black rounded-2xl border-[2.5px] border-black transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000]';

  const variantStyles = {
    primary: 'bg-gradient-to-r from-[#ff0844] via-[#ff2a54] via-60% to-[#ff7300] hover:from-[#e50039] hover:to-[#ea580c] text-white shadow-[3.5px_3.5px_0px_0px_#000000] hover:shadow-[5.5px_5.5px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5',
    sunset: 'bg-gradient-to-r from-[#ff0844] via-[#ff2a54] via-60% to-[#ff7300] hover:from-[#e50039] hover:to-[#ea580c] text-white shadow-[3.5px_3.5px_0px_0px_#000000] hover:shadow-[5.5px_5.5px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5',
    secondary: 'bg-white hover:bg-rose-50/70 text-stone-950 shadow-[3px_3px_0px_0px_#000000] hover:shadow-[5px_5px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5',
    outline: 'bg-white hover:bg-gradient-to-r hover:from-[#ff0844] hover:via-[#ff2a54] hover:via-60% hover:to-[#ff7300] hover:text-white text-stone-950 shadow-[3px_3px_0px_0px_#000000] hover:shadow-[5px_5px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5',
    danger: 'bg-rose-100 hover:bg-rose-200 text-rose-950 shadow-[3px_3px_0px_0px_#000000] hover:shadow-[5px_5px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5',
    ghost: 'border-transparent hover:border-black text-stone-700 hover:text-stone-950 hover:bg-stone-100 shadow-none hover:shadow-[2px_2px_0px_0px_#000000]',
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
