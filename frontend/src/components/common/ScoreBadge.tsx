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
    sm: 'text-xs px-2.5 py-0.5 font-black',
    md: 'text-sm px-3 py-1 font-black',
    lg: 'text-lg px-4 py-1.5 font-black',
  };

  return (
    <div
      className={clsx(
        'inline-flex items-center rounded-xl border-2 border-stone-900 font-mono tracking-tight shadow-[2.5px_2.5px_0px_0px_#1c1917] transition-all duration-150',
        colors.bg,
        colors.text,
        sizeStyles[size],
        className
      )}
    >
      <span>{score.toFixed(1)}</span>
      {showMax && (
        <span className="text-[11px] opacity-80 ml-1 font-sans font-bold text-stone-900">/10</span>
      )}
    </div>
  );
};
