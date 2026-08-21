import { request } from './client';
import { ScreeningRun, ShortlistResponse, AuditEvent } from '../types';

export const screeningsApi = {
  startScreening: (jobId: string, minScoreThreshold?: number) =>
    request<ScreeningRun>(`/jobs/${jobId}/screenings`, {
      method: 'POST',
      body: JSON.stringify({ min_score_threshold: minScoreThreshold }),
    }),

  getLatestRun: (jobId: string) =>
    request<ScreeningRun>(`/jobs/${jobId}/screenings/latest`),

  getShortlist: (jobId: string) =>
    request<ShortlistResponse>(`/jobs/${jobId}/shortlist`),

  getRunDetails: (runId: string) =>
    request<ScreeningRun>(`/screenings/${runId}`),

  getAuditLogs: (entityType?: string, entityId?: string) => {
    const query = new URLSearchParams();
    if (entityType) query.set('entity_type', entityType);
    if (entityId) query.set('entity_id', entityId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<AuditEvent[]>(`/audit${qs}`);
  },
};
