import React from 'react';
import { ShortlistCandidateItem } from '../../types';
import { ScoreBadge } from '../common/ScoreBadge';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ScoreBreakdownBars } from './ScoreBreakdownBars';
import { getRecommendationBadge } from '../../utils/scoreColors';
import { CheckCircle2, AlertTriangle, ArrowRight, Cpu, Briefcase } from 'lucide-react';

interface ShortlistCardProps {
  candidate: ShortlistCandidateItem;
  rank: number;
  onViewDetails: (candidateId: string) => void;
}

export const ShortlistCard: React.FC<ShortlistCardProps> = ({
  candidate,
  rank,
  onViewDetails,
}) => {
  const recBadge = getRecommendationBadge(candidate.recommendation);

  return (
    <div className="bento-card-interactive p-5 space-y-4 bg-slate-900/60 border border-slate-800">
      {/* Card Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          {/* Rank Badge with glowing ring */}
          <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-indigo-300 font-mono font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/10">
            #{rank}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white tracking-tight">
                {candidate.candidate_name || candidate.original_filename}
              </h3>
              <Badge
                variant={
                  candidate.recommendation === 'shortlist'
                    ? 'success'
                    : candidate.recommendation === 'review'
                    ? 'warning'
                    : 'danger'
                }
                size="sm"
                dot
              >
                {recBadge.label}
              </Badge>
              {candidate.is_fallback && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Cpu className="w-2.5 h-2.5" /> Fallback
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span>{candidate.original_filename}</span>
              {candidate.total_experience_years && (
                <span className="flex items-center gap-1 text-slate-300">
                  <Briefcase className="w-3 h-3 text-slate-500" />
                  ~{candidate.total_experience_years.toFixed(1)} yrs exp
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Score Display */}
        <div className="flex items-center gap-3">
          <ScoreBadge score={candidate.fit_score} size="lg" />
        </div>
      </div>

      {/* Summary Justification */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
        <span className="font-semibold text-indigo-300 block mb-0.5">Match Rationale:</span>
        {candidate.summary_justification}
      </div>

      {/* Key Skills & Quick Breakdown Bento Grid Sub-blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {/* Left: Matched Strengths & Gaps Highlights */}
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2.5">
          {candidate.matched_requirements.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Key Strengths
              </span>
              <div className="space-y-1">
                {candidate.matched_requirements.slice(0, 2).map((m, idx) => (
                  <p key={idx} className="text-xs text-slate-300 truncate">
                    • <strong className="text-slate-200">{m.requirement}</strong>: <span className="text-slate-400 italic text-[11px]">"{m.evidence.substring(0, 75)}..."</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {candidate.gaps.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Identified Gaps
              </span>
              <div className="space-y-1">
                {candidate.gaps.slice(0, 2).map((g, idx) => (
                  <p key={idx} className="text-xs text-slate-400 truncate">
                    • <span className="text-slate-300 font-medium">{g.requirement}</span> ({g.reason})
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Score Breakdown Progress Bars */}
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col justify-center">
          <ScoreBreakdownBars breakdown={candidate.score_breakdown} compact />
        </div>
      </div>

      {/* Card Footer: Skills pills & View details button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center gap-1.5">
          {candidate.skills_preview.map((skill, idx) => (
            <Badge key={idx} variant="primary" size="sm">
              {skill}
            </Badge>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(candidate.candidate_id)}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          View Full Evidence & Profile
        </Button>
      </div>
    </div>
  );
};
