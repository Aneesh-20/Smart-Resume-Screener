import React from 'react';
import { CandidateSkill } from '../../types';
import { Badge } from '../common/Badge';

interface SkillsTagListProps {
  skills: CandidateSkill[];
  limit?: number;
  showCategory?: boolean;
}

export const SkillsTagList: React.FC<SkillsTagListProps> = ({
  skills,
  limit,
  showCategory = false,
}) => {
  const displaySkills = limit ? skills.slice(0, limit) : skills;
  const remaining = limit && skills.length > limit ? skills.length - limit : 0;

  const categoryVariants: Record<string, 'primary' | 'success' | 'warning' | 'purple' | 'info' | 'default'> = {
    technical: 'primary',
    tool: 'info',
    domain: 'purple',
    soft: 'warning',
    language: 'success',
    other: 'default',
  };

  if (skills.length === 0) {
    return <span className="text-xs text-slate-500 italic">No skills extracted</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {displaySkills.map((s, idx) => (
        <Badge
          key={s.id || idx}
          variant={categoryVariants[s.category] || 'primary'}
          size="sm"
        >
          {s.normalized_name}
          {showCategory && <span className="text-[10px] opacity-70 ml-1">({s.category})</span>}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="default" size="sm">
          +{remaining} more
        </Badge>
      )}
    </div>
  );
};
