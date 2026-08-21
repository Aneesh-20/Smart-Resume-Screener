import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface ResponsibleNoticeProps {
  compact?: boolean;
}

export const ResponsibleNotice: React.FC<ResponsibleNoticeProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/10 text-[11px] text-slate-300 shadow-glass-sm">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        <span>Recruiter decision-support system • Human oversight</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/15 bg-gradient-to-r from-purple-950/30 via-slate-900/60 to-cyan-950/30 p-4 text-sm text-slate-300 shadow-glass-md flex items-start gap-3.5 backdrop-blur-2xl relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-purple-500/30 before:via-cyan-400/40 before:to-emerald-400/30">
      <div className="p-2 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-400/30 shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
        <Info className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="font-bold text-white text-xs tracking-wide uppercase flex items-center gap-2">
          <span>Responsible AI & Fair Hiring Notice</span>
          <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Protected Attributes Excluded
          </span>
        </p>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          This tool supports recruiter review; it does not make final hiring decisions. All match scores, gaps, and justifications are AI/heuristic assistance intended for human evaluation.
        </p>
      </div>
    </div>
  );
};
