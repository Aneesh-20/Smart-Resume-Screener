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
    sm: 'text-xs px-2 py-0.5 font-semibold',
    md: 'text-sm px-2.5 py-1 font-bold',
    lg: 'text-lg px-3.5 py-1.5 font-extrabold',
  };

  return (
    <div
      className={clsx(
        'inline-flex items-center rounded-lg border font-mono tracking-tight shadow-sm',
        colors.bg,
        colors.text,
        colors.border,
        sizeStyles[size],
        className
      )}
    >
      <span>{score.toFixed(1)}</span>
      {showMax && (
        <span className="text-[10px] opacity-60 ml-0.5 font-normal">/10</span>
      )}
    </div>
  );
};
