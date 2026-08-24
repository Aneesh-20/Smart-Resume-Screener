import React from 'react';
import { ScoreBreakdown } from '../../types';

interface ScoreBreakdownBarsProps {
  breakdown: ScoreBreakdown;
  compact?: boolean;
}

export const ScoreBreakdownBars: React.FC<ScoreBreakdownBarsProps> = ({
  breakdown,
  compact = false,
}) => {
  const items = [
    {
      key: 'skills',
      label: 'Skills & Tech Stack',
      data: breakdown.skills,
      color: 'bg-rose-500',
    },
    {
      key: 'relevant_experience',
      label: 'Relevant Experience',
      data: breakdown.relevant_experience,
      color: 'bg-amber-500',
    },
    {
      key: 'education_certifications',
      label: 'Education & Certs',
      data: breakdown.education_certifications,
      color: 'bg-emerald-500',
    },
    {
      key: 'role_specific_criteria',
      label: 'Role-Specific Fit',
      data: breakdown.role_specific_criteria,
      color: 'bg-rose-600',
    },
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => {
        if (!item.data) return null;
        const pct = Math.min(100, Math.max(0, (item.data.score / item.data.max_score) * 100));

        return (
          <div key={item.key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-stone-900">{item.label}</span>
              <span className="font-mono font-black text-stone-950">
                {item.data.score.toFixed(1)} <span className="text-stone-500 text-[10px]">/ {item.data.max_score.toFixed(1)}</span>
              </span>
            </div>

            {/* Progress Track with Brutal Border */}
            <div className="h-2.5 w-full rounded-md bg-stone-100 border-2 border-stone-900 overflow-hidden shadow-[1px_1px_0px_0px_#1c1917]">
              <div
                className={`h-full ${item.color} transition-all duration-300`}
                style={{ width: `${pct}%` }}
              />
            </div>

            {!compact && item.data.rationale && (
              <p className="text-[11px] font-bold text-stone-700 leading-relaxed">
                {item.data.rationale}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
