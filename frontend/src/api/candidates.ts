import { request } from './client';
import { CandidateDetail } from '../types';

export interface CandidateCorrectionInput {
  candidate_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  total_experience_years?: number | null;
  summary?: string;
  skills?: any[];
  experience?: any[];
  education?: any[];
  certifications?: any[];
}

export const candidatesApi = {
  getCandidate: (candidateId: string) =>
    request<CandidateDetail>(`/candidates/${candidateId}`),

  updateCorrections: (candidateId: string, data: CandidateCorrectionInput) =>
    request<CandidateDetail>(`/candidates/${candidateId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  reparse: (candidateId: string) =>
    request<{ message: string; candidate_id: string; status: string }>(`/candidates/${candidateId}/reparse`, {
      method: 'POST',
    }),

  rescore: (candidateId: string) =>
    request<{ candidate_id: string; fit_score: number; recommendation: string; summary_justification: string }>(`/candidates/${candidateId}/rescore`, {
      method: 'POST',
    }),

  deleteCandidate: (candidateId: string) =>
    request<{ message: string; candidate_id: string }>(`/candidates/${candidateId}`, {
      method: 'DELETE',
    }),
};
