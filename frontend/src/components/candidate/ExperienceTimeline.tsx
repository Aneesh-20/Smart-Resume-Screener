import React from 'react';
import { Calendar, Building2 } from 'lucide-react';
import { ExperienceEntry } from '../../types';

interface ExperienceTimelineProps {
  entries: ExperienceEntry[];
}

export const ExperienceTimeline: React.FC<ExperienceTimelineProps> = ({ entries }) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-500 italic">
        No formal experience entries extracted.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
      {entries.map((entry, idx) => (
        <div key={entry.id || idx} className="relative group">
          {/* Dot */}
          <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-2 border-rose-500 shadow-xs group-hover:scale-110 transition-transform" />

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-stone-900">
                {entry.title || 'Role Title Not Specified'}
              </h4>
              <div className="inline-flex items-center gap-1 text-xs text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                <Calendar className="w-3 h-3" />
                <span>
                  {entry.start_date || '?'} – {entry.is_current ? 'Present' : entry.end_date || '?'}
                </span>
              </div>
            </div>

            {entry.company && (
              <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
                <Building2 className="w-3.5 h-3.5 text-stone-400" />
                <span>{entry.company}</span>
              </div>
            )}

            {entry.highlights && entry.highlights.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-stone-700">
                {entry.highlights.map((h, hIdx) => (
                  <li key={hIdx} className="flex items-start gap-2">
                    <span className="text-rose-500 shrink-0 mt-1">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}

            {entry.evidence && (
              <div className="mt-2 p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-stone-600">
                <span className="font-bold text-stone-700 block mb-0.5">Extracted Evidence:</span>
                <p className="italic text-stone-600">"{entry.evidence}"</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
