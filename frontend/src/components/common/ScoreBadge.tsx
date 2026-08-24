import React from 'react';
import { clsx } from 'clsx';
import { getScoreColor } from '../../utils/scoreColors';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showMax?: boolean;
  className?: string;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score,
  size = 'md',
  showMax = true,
  className,
}) => {
  const colors = getScoreColor(score);

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 font-bold',
    md: 'text-sm px-3 py-1 font-bold',
    lg: 'text-lg px-4 py-1.5 font-extrabold',
  };

  return (
    <div
      className={clsx(
        'inline-flex items-center rounded-xl border font-mono tracking-tight shadow-sm transition-all duration-200',
        colors.bg,
        colors.text,
        colors.border,
        sizeStyles[size],
        className
      )}
    >
      <span>{score.toFixed(1)}</span>
      {showMax && (
        <span className="text-[11px] opacity-70 ml-1 font-sans font-medium">/10</span>
      )}
    </div>
  );
};
