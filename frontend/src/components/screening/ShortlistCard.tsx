import React from 'react';
import { ShortlistCandidateItem } from '../../types';
import { ScoreBadge } from '../common/ScoreBadge';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ScoreBreakdownBars } from './ScoreBreakdownBars';
import { getRecommendationBadge } from '../../utils/scoreColors';
import { InteractiveScoreGauge3D } from '../3d/InteractiveScoreGauge3D';
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
    <div className="brutal-card-interactive p-5 space-y-4 bg-white">
      {/* Card Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          {/* Rank Badge with brutalist border */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#ff0844] via-[#ff2a54] via-60% to-[#ff7300] border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-white font-mono font-black text-sm flex items-center justify-center shrink-0">
            #{rank}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-stone-950 tracking-tight">
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
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-stone-900 shadow-[1px_1px_0px_0px_#1c1917]">
                  <Cpu className="w-2.5 h-2.5 text-amber-700" /> Fallback
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-stone-600 font-bold mt-1">
              <span>{candidate.original_filename}</span>
              {candidate.total_experience_years && (
                <span className="flex items-center gap-1 text-stone-900 font-bold">
                  <Briefcase className="w-3 h-3 text-stone-500" />
                  ~{candidate.total_experience_years.toFixed(1)} yrs exp
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3D Gauge & Score Display */}
        <div className="flex items-center gap-3">
          <InteractiveScoreGauge3D score={candidate.fit_score} size={48} />
          <ScoreBadge score={candidate.fit_score} size="lg" />
        </div>
      </div>

      {/* Summary Justification */}
      <div className="p-3.5 rounded-xl bg-stone-50 border-2 border-stone-900 shadow-[2px_2px_0px_0px_#1c1917] text-xs text-stone-800 leading-relaxed font-bold">
        <span className="font-black text-[#ff0844] block mb-0.5">Match Rationale:</span>
        {candidate.summary_justification}
      </div>

      {/* Key Skills & Quick Breakdown Grid Sub-blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {/* Left: Matched Strengths & Gaps Highlights */}
        <div className="p-3.5 rounded-xl bg-white border-2 border-stone-900 shadow-[2px_2px_0px_0px_#1c1917] space-y-2.5">
          {candidate.matched_requirements.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-black text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Key Strengths
              </span>
              <div className="space-y-1">
                {candidate.matched_requirements.slice(0, 2).map((m, idx) => (
                  <p key={idx} className="text-xs font-bold text-stone-800 truncate">
                    • <strong className="text-stone-950 font-black">{m.requirement}</strong>: <span className="text-stone-600 italic text-[11px]">"{m.evidence.substring(0, 75)}..."</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {candidate.gaps.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-black text-amber-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Identified Gaps
              </span>
              <div className="space-y-1">
                {candidate.gaps.slice(0, 2).map((g, idx) => (
                  <p key={idx} className="text-xs font-bold text-stone-700 truncate">
                    • <span className="text-stone-950 font-black">{g.requirement}</span> ({g.reason})
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Score Breakdown Progress Bars */}
        <div className="p-3.5 rounded-xl bg-white border-2 border-stone-900 shadow-[2px_2px_0px_0px_#1c1917] flex flex-col justify-center">
          <ScoreBreakdownBars breakdown={candidate.score_breakdown} compact />
        </div>
      </div>

      {/* Card Footer: Skills pills & View details button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-stone-900">
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
