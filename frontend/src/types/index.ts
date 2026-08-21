export type CandidateStatus = 'queued' | 'processing' | 'parsed' | 'scored' | 'failed';
export type Recommendation = 'shortlist' | 'review' | 'do_not_shortlist';
export type Confidence = 'high' | 'medium' | 'low';
export type SkillCategory = 'technical' | 'tool' | 'domain' | 'soft' | 'language' | 'other';
export type GapSeverity = 'must_have' | 'preferred' | 'uncertain';

export interface JobSummaryStats {
  total_candidates: number;
  parsed_candidates: number;
  scored_candidates: number;
  shortlisted_candidates: number;
  failed_candidates: number;
  latest_run_id?: string | null;
  latest_run_status?: string | null;
}

export interface Job {
  id: string;
  title: string;
  department?: string | null;
  description: string;
  min_score_threshold: number;
  must_have_skills: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  stats?: JobSummaryStats;
}

export interface CandidateSkill {
  id: string;
  name: string;
  normalized_name: string;
  category: SkillCategory;
  evidence?: string | null;
}

export interface ExperienceEntry {
  id: string;
  title?: string | null;
  company?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current: boolean;
  highlights: string[];
  skills: string[];
  evidence?: string | null;
}

export interface EducationEntry {
  id: string;
  institution?: string | null;
  degree?: string | null;
  field_of_study?: string | null;
  end_year?: number | null;
  evidence?: string | null;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer?: string | null;
  year?: number | null;
  evidence?: string | null;
}

export interface ScoreBreakdownItem {
  score: number;
  max_score: number;
  rationale: string;
}

export interface ScoreBreakdown {
  skills: ScoreBreakdownItem;
  relevant_experience: ScoreBreakdownItem;
  education_certifications: ScoreBreakdownItem;
  role_specific_criteria: ScoreBreakdownItem;
}

export interface MatchedRequirement {
  requirement: string;
  evidence: string;
  strength: 'strong' | 'partial';
}

export interface RequirementGap {
  requirement: string;
  reason: string;
  severity: GapSeverity;
}

export interface CandidateAssessment {
  id: string;
  run_id: string;
  candidate_id: string;
  fit_score: number;
  recommendation: Recommendation;
  summary_justification: string;
  score_breakdown: ScoreBreakdown;
  matched_requirements: MatchedRequirement[];
  gaps: RequirementGap[];
  uncertainties: string[];
  follow_up_questions: string[];
  confidence: Confidence;
  is_fallback: boolean;
  model_metadata: Record<string, any>;
  created_at: string;
}

export interface CandidateListItem {
  id: string;
  job_id: string;
  original_filename: string;
  file_type: string;
  file_size_bytes: number;
  status: CandidateStatus;
  status_message?: string | null;
  candidate_name?: string | null;
  email?: string | null;
  location?: string | null;
  total_experience_years?: number | null;
  skills_count: number;
  skills_preview: string[];
  latest_score?: number | null;
  latest_recommendation?: Recommendation | null;
  latest_justification?: string | null;
  is_shortlisted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CandidateDetail {
  id: string;
  job_id: string;
  original_filename: string;
  stored_filename: string;
  file_type: string;
  file_size_bytes: number;
  content_hash: string;
  raw_text: string;
  status: CandidateStatus;
  status_message?: string | null;
  candidate_name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  links: string[];
  total_experience_years?: number | null;
  summary?: string | null;
  parse_warnings: string[];
  parse_payload: Record<string, any>;
  skills: CandidateSkill[];
  experience_entries: ExperienceEntry[];
  education_entries: EducationEntry[];
  certifications: CertificationEntry[];
  assessments: CandidateAssessment[];
  latest_assessment?: CandidateAssessment | null;
  created_at: string;
  updated_at: string;
}

export interface ShortlistCandidateItem {
  candidate_id: string;
  candidate_name?: string | null;
  original_filename: string;
  fit_score: number;
  recommendation: Recommendation;
  summary_justification: string;
  score_breakdown: ScoreBreakdown;
  matched_requirements: MatchedRequirement[];
  gaps: RequirementGap[];
  uncertainties: string[];
  confidence: Confidence;
  is_fallback: boolean;
  skills_preview: string[];
  total_experience_years?: number | null;
  assessed_at: string;
}

export interface ShortlistResponse {
  job_id: string;
  threshold: number;
  total_screened: number;
  shortlisted_count: number;
  review_count: number;
  do_not_shortlist_count: number;
  shortlisted: ShortlistCandidateItem[];
  review: ShortlistCandidateItem[];
  do_not_shortlist: ShortlistCandidateItem[];
}

export interface ScreeningRun {
  id: string;
  job_id: string;
  job_title_snapshot: string;
  job_description_snapshot: string;
  must_have_skills_snapshot: string[];
  min_score_threshold_snapshot: number;
  prompt_version: string;
  model_name: string;
  provider_name: string;
  status: 'running' | 'completed' | 'failed';
  total_candidates: number;
  screened_candidates: number;
  started_at: string;
  completed_at?: string | null;
  assessments: CandidateAssessment[];
}

export interface AuditEvent {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  actor: string;
  details: Record<string, any>;
  timestamp: string;
}
