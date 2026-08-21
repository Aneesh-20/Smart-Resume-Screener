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
      color: 'bg-indigo-500',
    },
    {
      key: 'relevant_experience',
      label: 'Relevant Experience',
      data: breakdown.relevant_experience,
      color: 'bg-teal-500',
    },
    {
      key: 'education_certifications',
      label: 'Education & Certs',
      data: breakdown.education_certifications,
      color: 'bg-amber-500',
    },
    {
      key: 'role_specific_criteria',
      label: 'Role-Specific Fit',
      data: breakdown.role_specific_criteria,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-3.5">
      {items.map((item) => {
        if (!item.data) return null;
        const pct = Math.min(100, Math.max(0, (item.data.score / item.data.max_score) * 100));

        return (
          <div key={item.key} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">{item.label}</span>
              <span className="font-mono font-semibold text-slate-200">
                {item.data.score.toFixed(1)} <span className="text-slate-500 text-[10px]">/ {item.data.max_score.toFixed(1)}</span>
              </span>
            </div>

            {/* Progress Track */}
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${item.color} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>

            {!compact && item.data.rationale && (
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {item.data.rationale}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
