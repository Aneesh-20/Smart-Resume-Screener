import { request } from './client';
import { Job, CandidateListItem } from '../types';

export interface CreateJobInput {
  title: string;
  department?: string;
  description: string;
  min_score_threshold: number;
  must_have_skills: string[];
}

export interface UpdateJobInput {
  title?: string;
  department?: string;
  description?: string;
  min_score_threshold?: number;
  must_have_skills?: string[];
  is_active?: boolean;
}

export interface UploadResumesResponse {
  job_id: string;
  uploaded_count: number;
  error_count: number;
  uploaded: { candidate_id: string; original_filename: string; status: string }[];
  errors: { filename: string; error: string }[];
}

export const jobsApi = {
  listJobs: () => request<Job[]>('/jobs'),
  
  getJob: (jobId: string) => request<Job>(`/jobs/${jobId}`),
  
  createJob: (data: CreateJobInput) =>
    request<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  updateJob: (jobId: string, data: UpdateJobInput) =>
    request<Job>(`/jobs/${jobId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    
  uploadResumes: (jobId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return request<UploadResumesResponse>(`/jobs/${jobId}/resumes`, {
      method: 'POST',
      body: formData,
    });
  },
  
  listCandidates: (jobId: string, params?: {
    status?: string;
    recommendation?: string;
    search?: string;
    sort_by?: string;
    sort_dir?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.recommendation) query.set('recommendation', params.recommendation);
    if (params?.search) query.set('search', params.search);
    if (params?.sort_by) query.set('sort_by', params.sort_by);
    if (params?.sort_dir) query.set('sort_dir', params.sort_dir);
    
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<CandidateListItem[]>(`/jobs/${jobId}/candidates${qs}`);
  },

  exportCsvUrl: (jobId: string) => `/api/v1/jobs/${jobId}/export.csv`,
};
