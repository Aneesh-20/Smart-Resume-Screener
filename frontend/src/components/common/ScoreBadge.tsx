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
    sm: 'text-xs px-2.5 py-0.5 font-semibold',
    md: 'text-sm px-3 py-1 font-bold',
    lg: 'text-lg px-4 py-1.5 font-black',
  };

  // Glass shadow glow based on score
  let glowShadow = 'shadow-[0_0_15px_rgba(16,185,129,0.25)]';
  if (score < 5.0) glowShadow = 'shadow-[0_0_15px_rgba(244,63,94,0.25)]';
  else if (score < 7.0) glowShadow = 'shadow-[0_0_15px_rgba(245,158,11,0.25)]';

  return (
    <div
      className={clsx(
        'inline-flex items-center rounded-xl border backdrop-blur-xl font-mono tracking-tight transition-all duration-200',
        colors.bg,
        colors.text,
        colors.border,
        glowShadow,
        sizeStyles[size],
        className
      )}
    >
      <span>{score.toFixed(1)}</span>
      {showMax && (
        <span className="text-[10px] opacity-60 ml-1 font-sans font-normal">/10</span>
      )}
    </div>
  );
};
