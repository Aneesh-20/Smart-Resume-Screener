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
      color: 'bg-emerald-600',
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
              <span className="font-bold text-stone-700">{item.label}</span>
              <span className="font-mono font-bold text-stone-900">
                {item.data.score.toFixed(1)} <span className="text-stone-400 text-[10px]">/ {item.data.max_score.toFixed(1)}</span>
              </span>
            </div>

            {/* Progress Track */}
            <div className="h-2 w-full rounded-full bg-stone-100 border border-stone-200/80 overflow-hidden">
              <div
                className={`h-full rounded-full ${item.color} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>

            {!compact && item.data.rationale && (
              <p className="text-[11px] text-stone-600 leading-relaxed">
                {item.data.rationale}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
