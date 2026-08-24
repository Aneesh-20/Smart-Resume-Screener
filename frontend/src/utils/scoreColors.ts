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
      bg: 'bg-emerald-50/90',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
      ring: 'ring-emerald-400/30',
      gradient: 'from-emerald-600 to-teal-600',
    };
  }
  if (score >= 6.5) {
    return {
      bg: 'bg-rose-50/90',
      text: 'text-rose-800',
      border: 'border-rose-300',
      ring: 'ring-rose-400/30',
      gradient: 'from-rose-500 to-amber-600',
    };
  }
  if (score >= 5.0) {
    return {
      bg: 'bg-amber-50/90',
      text: 'text-amber-800',
      border: 'border-amber-300',
      ring: 'ring-amber-400/30',
      gradient: 'from-amber-500 to-orange-500',
    };
  }
  return {
    bg: 'bg-rose-50/90',
    text: 'text-rose-700',
    border: 'border-rose-300',
    ring: 'ring-rose-400/30',
    gradient: 'from-rose-600 to-pink-600',
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
        color: 'text-emerald-800',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        dotColor: 'bg-emerald-600',
      };
    case 'review':
      return {
        label: 'Review Needed',
        color: 'text-amber-800',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        dotColor: 'bg-amber-600',
      };
    case 'do_not_shortlist':
      return {
        label: 'Do Not Shortlist',
        color: 'text-rose-800',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
        dotColor: 'bg-rose-600',
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
      return { label: 'Queued', color: 'text-stone-600', bgColor: 'bg-stone-100', dotColor: 'bg-stone-400' };
    case 'processing':
      return { label: 'Processing', color: 'text-amber-700', bgColor: 'bg-amber-50', dotColor: 'bg-amber-500', animate: true };
    case 'parsed':
      return { label: 'Parsed', color: 'text-rose-700', bgColor: 'bg-rose-50', dotColor: 'bg-rose-500' };
    case 'scored':
      return { label: 'Scored', color: 'text-emerald-800', bgColor: 'bg-emerald-50', dotColor: 'bg-emerald-600' };
    case 'failed':
      return { label: 'Failed', color: 'text-rose-700', bgColor: 'bg-rose-50', dotColor: 'bg-rose-600' };
  }
}
