import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface ResponsibleNoticeProps {
  compact?: boolean;
}

export const ResponsibleNotice: React.FC<ResponsibleNoticeProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
        <span>Recruiter decision-support system • Human oversight required</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-950/40 p-3.5 text-sm text-slate-300 shadow-sm flex items-start gap-3 backdrop-blur-md">
      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 mt-0.5">
        <Info className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-slate-200">
          Responsible AI Notice
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          This tool supports recruiter review; it does not make final hiring decisions. All match scores, gaps, and justifications are AI/heuristic assistance intended for human evaluation.
        </p>
      </div>
    </div>
  );
};
