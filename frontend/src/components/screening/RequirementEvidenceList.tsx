import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, MessageSquareQuote } from 'lucide-react';
import { MatchedRequirement, RequirementGap } from '../../types';
import { Badge } from '../common/Badge';

interface RequirementEvidenceListProps {
  matchedRequirements: MatchedRequirement[];
  gaps: RequirementGap[];
  uncertainties?: string[];
  followUpQuestions?: string[];
}

export const RequirementEvidenceList: React.FC<RequirementEvidenceListProps> = ({
  matchedRequirements,
  gaps,
  uncertainties = [],
  followUpQuestions = [],
}) => {
  return (
    <div className="space-y-6">
      {/* Matched Strengths */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4" />
          <span>Matched Strengths & Evidence ({matchedRequirements.length})</span>
        </div>

        {matchedRequirements.length === 0 ? (
          <p className="text-xs text-slate-500 italic pl-6">No explicit requirement strengths matched.</p>
        ) : (
          <div className="space-y-2 pl-2">
            {matchedRequirements.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-200">{item.requirement}</span>
                  <Badge variant={item.strength === 'strong' ? 'success' : 'warning'} size="sm">
                    {item.strength}
                  </Badge>
                </div>
                {item.evidence && (
                  <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    "{item.evidence}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Identified Gaps */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4" />
          <span>Identified Gaps & Missing Evidence ({gaps.length})</span>
        </div>

        {gaps.length === 0 ? (
          <p className="text-xs text-emerald-400/80 pl-6">No critical qualification gaps identified.</p>
        ) : (
          <div className="space-y-2 pl-2">
            {gaps.map((gap, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-200">{gap.requirement}</span>
                  <Badge
                    variant={gap.severity === 'must_have' ? 'danger' : 'warning'}
                    size="sm"
                  >
                    {gap.severity.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">{gap.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Uncertainties & Interview Follow-ups */}
      {((uncertainties && uncertainties.length > 0) || (followUpQuestions && followUpQuestions.length > 0)) && (
        <div className="pt-2 border-t border-slate-800/80 space-y-4">
          {uncertainties.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Uncertainties to Verify</span>
              </div>
              <ul className="space-y-1 text-xs text-slate-400 pl-5 list-disc">
                {uncertainties.map((u, idx) => (
                  <li key={idx}>{u}</li>
                ))}
              </ul>
            </div>
          )}

          {followUpQuestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>Suggested Recruiter Follow-up Questions</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 pl-2">
                {followUpQuestions.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-indigo-950/30 p-2 rounded-lg border border-indigo-500/20">
                    <span className="text-indigo-400 font-bold shrink-0">Q{idx + 1}:</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
