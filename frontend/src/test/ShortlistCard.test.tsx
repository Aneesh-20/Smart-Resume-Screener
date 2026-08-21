import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShortlistCard } from '../components/screening/ShortlistCard';
import { ShortlistCandidateItem } from '../types';

const mockCandidate: ShortlistCandidateItem = {
  candidate_id: 'cand-123',
  candidate_name: 'Alice Chen',
  original_filename: 'alice_chen.pdf',
  fit_score: 8.8,
  recommendation: 'shortlist',
  summary_justification: 'Strong candidate with deep FastAPI and React experience.',
  score_breakdown: {
    skills: { score: 3.8, max_score: 4.0, rationale: 'Excellent skill match' },
    relevant_experience: { score: 3.5, max_score: 4.0, rationale: '6 years experience' },
    education_certifications: { score: 0.9, max_score: 1.0, rationale: 'MS in CS' },
    role_specific_criteria: { score: 0.6, max_score: 1.0, rationale: 'Direct alignment' },
  },
  matched_requirements: [
    { requirement: 'Python & FastAPI', evidence: '6 years of experience', strength: 'strong' },
  ],
  gaps: [],
  uncertainties: [],
  confidence: 'high',
  is_fallback: false,
  skills_preview: ['Python', 'React', 'TypeScript', 'PostgreSQL'],
  total_experience_years: 6.0,
  assessed_at: new Date().toISOString(),
};

describe('ShortlistCard Component', () => {
  it('renders candidate rank, name, score, and justification', () => {
    const handleViewDetails = vi.fn();
    render(
      <ShortlistCard
        candidate={mockCandidate}
        rank={1}
        onViewDetails={handleViewDetails}
      />
    );

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('Alice Chen')).toBeInTheDocument();
    expect(screen.getByText('8.8')).toBeInTheDocument();
    expect(screen.getByText('Shortlist')).toBeInTheDocument();
    expect(screen.getByText('Strong candidate with deep FastAPI and React experience.')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('triggers onViewDetails when clicking View Full Evidence', () => {
    const handleViewDetails = vi.fn();
    render(
      <ShortlistCard
        candidate={mockCandidate}
        rank={1}
        onViewDetails={handleViewDetails}
      />
    );

    const button = screen.getByText('View Full Evidence & Profile');
    fireEvent.click(button);
    expect(handleViewDetails).toHaveBeenCalledWith('cand-123');
  });
});
