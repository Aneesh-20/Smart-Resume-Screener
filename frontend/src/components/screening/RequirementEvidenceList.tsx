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
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Matched Strengths & Evidence ({matchedRequirements.length})</span>
        </div>

        {matchedRequirements.length === 0 ? (
          <p className="text-xs text-stone-400 italic pl-6">No explicit requirement strengths matched.</p>
        ) : (
          <div className="space-y-2 pl-2">
            {matchedRequirements.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white border border-emerald-200 shadow-xs space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-stone-900">{item.requirement}</span>
                  <Badge variant={item.strength === 'strong' ? 'success' : 'warning'} size="sm">
                    {item.strength}
                  </Badge>
                </div>
                {item.evidence && (
                  <p className="text-xs text-stone-600 italic bg-stone-50 p-2.5 rounded-lg border border-stone-200">
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
        <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Identified Gaps & Missing Evidence ({gaps.length})</span>
        </div>

        {gaps.length === 0 ? (
          <p className="text-xs text-emerald-700 font-medium pl-6">No critical qualification gaps identified.</p>
        ) : (
          <div className="space-y-2 pl-2">
            {gaps.map((gap, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white border border-amber-200 shadow-xs space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-stone-900">{gap.requirement}</span>
                  <Badge
                    variant={gap.severity === 'must_have' ? 'danger' : 'warning'}
                    size="sm"
                  >
                    {gap.severity.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-xs text-stone-600">{gap.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Uncertainties & Interview Follow-ups */}
      {((uncertainties && uncertainties.length > 0) || (followUpQuestions && followUpQuestions.length > 0)) && (
        <div className="pt-3 border-t border-stone-200 space-y-4">
          {uncertainties.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Uncertainties to Verify</span>
              </div>
              <ul className="space-y-1 text-xs text-stone-600 pl-5 list-disc">
                {uncertainties.map((u, idx) => (
                  <li key={idx}>{u}</li>
                ))}
              </ul>
            </div>
          )}

          {followUpQuestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wider">
                <MessageSquareQuote className="w-3.5 h-3.5 text-rose-600" />
                <span>Suggested Recruiter Follow-up Questions</span>
              </div>
              <ul className="space-y-1.5 text-xs text-stone-800 pl-2">
                {followUpQuestions.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-rose-50/70 p-2.5 rounded-xl border border-rose-200">
                    <span className="text-rose-600 font-bold shrink-0">Q{idx + 1}:</span>
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
