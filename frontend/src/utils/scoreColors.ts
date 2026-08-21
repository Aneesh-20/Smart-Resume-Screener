import { Recommendation, CandidateStatus } from '../types';

export function getScoreColor(score: number): {
  bg: string;
  text: string;
  border: string;
  ring: string;
  gradient: string;
} {
  if (score >= 8.0) {
    return {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      ring: 'ring-emerald-500/20',
      gradient: 'from-emerald-500 to-teal-400',
    };
  }
  if (score >= 6.5) {
    return {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      border: 'border-indigo-500/30',
      ring: 'ring-indigo-500/20',
      gradient: 'from-indigo-500 to-blue-400',
    };
  }
  if (score >= 5.0) {
    return {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      ring: 'ring-amber-500/20',
      gradient: 'from-amber-500 to-orange-400',
    };
  }
  return {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    ring: 'ring-rose-500/20',
    gradient: 'from-rose-500 to-pink-500',
  };
}

export function getRecommendationBadge(rec: Recommendation): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
} {
  switch (rec) {
    case 'shortlist':
      return {
        label: 'Shortlist',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        dotColor: 'bg-emerald-400',
      };
    case 'review':
      return {
        label: 'Review Needed',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        dotColor: 'bg-amber-400',
      };
    case 'do_not_shortlist':
      return {
        label: 'Do Not Shortlist',
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/10',
        borderColor: 'border-rose-500/30',
        dotColor: 'bg-rose-400',
      };
  }
}

export function getStatusBadge(status: CandidateStatus): {
  label: string;
  color: string;
  bgColor: string;
  dotColor: string;
  animate?: boolean;
} {
  switch (status) {
    case 'queued':
      return { label: 'Queued', color: 'text-slate-400', bgColor: 'bg-slate-800', dotColor: 'bg-slate-400' };
    case 'processing':
      return { label: 'Processing', color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', dotColor: 'bg-indigo-400', animate: true };
    case 'parsed':
      return { label: 'Parsed', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', dotColor: 'bg-cyan-400' };
    case 'scored':
      return { label: 'Scored', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', dotColor: 'bg-emerald-400' };
    case 'failed':
      return { label: 'Failed', color: 'text-rose-400', bgColor: 'bg-rose-500/10', dotColor: 'bg-rose-400' };
  }
}
