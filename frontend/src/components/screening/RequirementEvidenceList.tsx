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
        <div className="flex items-center gap-2 text-xs font-black text-emerald-900 uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Matched Strengths & Evidence ({matchedRequirements.length})</span>
        </div>

        {matchedRequirements.length === 0 ? (
          <p className="text-xs text-stone-500 font-bold italic pl-6">No explicit requirement strengths matched.</p>
        ) : (
          <div className="space-y-2 pl-2">
            {matchedRequirements.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white border-2 border-stone-900 shadow-[2px_2px_0px_0px_#1c1917] space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-black text-stone-950">{item.requirement}</span>
                  <Badge variant={item.strength === 'strong' ? 'success' : 'warning'} size="sm">
                    {item.strength}
                  </Badge>
                </div>
                {item.evidence && (
                  <p className="text-xs text-stone-700 italic bg-stone-50 p-2.5 rounded-lg border border-stone-900 shadow-[1px_1px_0px_0px_#1c1917] font-semibold">
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
        <div className="flex items-center gap-2 text-xs font-black text-amber-900 uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-700" />
          <span>Identified Gaps & Missing Evidence ({gaps.length})</span>
        </div>

        {gaps.length === 0 ? (
          <p className="text-xs text-emerald-800 font-black pl-6">No critical qualification gaps identified.</p>
        ) : (
          <div className="space-y-2 pl-2">
            {gaps.map((gap, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white border-2 border-stone-900 shadow-[2px_2px_0px_0px_#1c1917] space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-black text-stone-950">{gap.requirement}</span>
                  <Badge
                    variant={gap.severity === 'must_have' ? 'danger' : 'warning'}
                    size="sm"
                  >
                    {gap.severity.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-xs font-bold text-stone-700">{gap.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Uncertainties & Interview Follow-ups */}
      {((uncertainties && uncertainties.length > 0) || (followUpQuestions && followUpQuestions.length > 0)) && (
        <div className="pt-3 border-t-2 border-stone-900 space-y-4">
          {uncertainties.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-amber-900 uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>Uncertainties to Verify</span>
              </div>
              <ul className="space-y-1 text-xs font-bold text-stone-700 pl-5 list-disc">
                {uncertainties.map((u, idx) => (
                  <li key={idx}>{u}</li>
                ))}
              </ul>
            </div>
          )}

          {followUpQuestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-rose-950 uppercase tracking-wider">
                <MessageSquareQuote className="w-3.5 h-3.5 text-rose-700" />
                <span>Suggested Recruiter Follow-up Questions</span>
              </div>
              <ul className="space-y-1.5 text-xs text-stone-900 pl-2">
                {followUpQuestions.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-rose-50 p-2.5 rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_0px_#1c1917] font-bold">
                    <span className="text-rose-700 font-black shrink-0">Q{idx + 1}:</span>
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
