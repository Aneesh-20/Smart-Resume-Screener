import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '../api/jobs';
import { candidatesApi } from '../api/candidates';
import { screeningsApi } from '../api/screenings';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ScoreBadge } from '../components/common/ScoreBadge';
import { Dropzone } from '../components/common/Dropzone';
import { Spinner } from '../components/common/Spinner';
import { CandidateDetailDrawer } from '../components/candidate/CandidateDetailDrawer';
import { ShortlistCard } from '../components/screening/ShortlistCard';
import { formatDate, getInitials } from '../utils/formatters';
import { getRecommendationBadge, getStatusBadge } from '../../src/utils/scoreColors';
import {
  Briefcase, ArrowLeft, Download, Sparkles, UploadCloud, Users,
  Award, AlertCircle, CheckCircle2, Search, Eye, Clock,
  Layers, ShieldCheck, ChevronRight
} from 'lucide-react';

export const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const queryClient = useQueryClient();

  const [activeView, setActiveView] = useState<'shortlist' | 'candidates' | 'audit'>('shortlist');
  const [shortlistFilter, setShortlistFilter] = useState<'shortlisted' | 'review' | 'do_not_shortlist'>('shortlisted');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidateStatusFilter, setCandidateStatusFilter] = useState<string>('');
  const [candidateSortBy, setCandidateSortBy] = useState<string>('score');
  const [isJdExpanded, setIsJdExpanded] = useState(false);

  // Selected candidate for drawer
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Job query
  const { data: job, isLoading: isJobLoading, error: jobError } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobsApi.getJob(jobId!),
    enabled: !!jobId,
    refetchInterval: 4000,
  });

  // Candidates query
  const { data: candidates, isLoading: isCandidatesLoading } = useQuery({
    queryKey: ['candidates', jobId, candidateStatusFilter, candidateSearch, candidateSortBy],
    queryFn: () =>
      jobsApi.listCandidates(jobId!, {
        status: candidateStatusFilter || undefined,
        search: candidateSearch || undefined,
        sort_by: candidateSortBy,
        sort_dir: 'desc',
      }),
    enabled: !!jobId,
    refetchInterval: 3000,
  });

  // Shortlist query
  const { data: shortlist, isLoading: isShortlistLoading } = useQuery({
    queryKey: ['shortlist', jobId],
    queryFn: () => screeningsApi.getShortlist(jobId!),
    enabled: !!jobId,
    refetchInterval: 3000,
  });

  // Audit query
  const { data: auditEvents } = useQuery({
    queryKey: ['audit', jobId],
    queryFn: () => screeningsApi.getAuditLogs('screening_job', jobId),
    enabled: !!jobId && activeView === 'audit',
  });

  // Selected candidate detail query
  const { data: selectedCandidate, refetch: refetchSelectedCandidate } = useQuery({
    queryKey: ['candidateDetail', selectedCandidateId],
    queryFn: () => candidatesApi.getCandidate(selectedCandidateId!),
    enabled: !!selectedCandidateId,
  });

  // Screening run mutation
  const screeningMutation = useMutation({
    mutationFn: () => screeningsApi.startScreening(jobId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shortlist', jobId] });
      queryClient.invalidateQueries({ queryKey: ['candidates', jobId] });
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      setActiveView('shortlist');
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to start screening run');
    },
  });

  // Resume upload handler
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    uploadedCount: number;
    errors: { filename: string; error: string }[];
  } | null>(null);

  const handleUploadResumes = async (files: File[]) => {
    setIsUploading(true);
    setUploadResults(null);
    try {
      const resp = await jobsApi.uploadResumes(jobId!, files);
      setUploadResults({
        uploadedCount: resp.uploaded_count,
        errors: resp.errors,
      });
      queryClient.invalidateQueries({ queryKey: ['candidates', jobId] });
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenCandidateDrawer = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setIsDrawerOpen(true);
  };

  if (isJobLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Spinner size="lg" className="text-[#ff0844]" />
        <p className="text-xs font-bold text-stone-600">Loading screening workspace...</p>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="p-8 text-center space-y-4 brutal-card bg-white">
        <AlertCircle className="w-10 h-10 text-[#ff0844] mx-auto" />
        <h2 className="text-lg font-black text-stone-900">Job not found</h2>
        <p className="text-xs font-bold text-stone-500">The requested screening job could not be loaded.</p>
        <Link to="/">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  const stats = job.stats || {
    total_candidates: 0,
    parsed_candidates: 0,
    scored_candidates: 0,
    shortlisted_candidates: 0,
    failed_candidates: 0,
  };

  const shortlistPercent = stats.total_candidates > 0
    ? Math.round((stats.shortlisted_candidates / stats.total_candidates) * 100)
    : 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* BRUTAL BENTO GRID: ROW 1 (Command Hub + Pipeline Metrics) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Bento Tile 1: Primary Job Focus & Quick Actions */}
        <div className="lg:col-span-8 brutal-hero p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-stone-700 hover:text-[#ff0844] transition-colors font-black"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Screening Hub
            </Link>

            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight">
                {job.title}
              </h1>
              {job.department && (
                <span className="glass-badge-amber">
                  {job.department}
                </span>
              )}
              <span className="glass-badge-rosegold font-mono font-black">
                Threshold: {job.min_score_threshold.toFixed(1)}/10
              </span>
            </div>

            {/* Responsible AI Banner */}
            <div className="p-3.5 rounded-xl bg-white border-2 border-stone-900 shadow-[2px_2px_0px_0px_#000000] text-xs font-bold text-stone-800 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Notice: Human decision-support tool. Final hiring determinations require recruiter confirmation.</span>
              </span>
              <span className="text-[#ff0844] font-black uppercase tracking-wider text-[10px] shrink-0">
                Audited Mode
              </span>
            </div>
          </div>

          {/* Action Button Row */}
          <div className="pt-6 flex flex-wrap items-center gap-3 relative z-10">
            <Button
              onClick={() => screeningMutation.mutate()}
              isLoading={screeningMutation.isPending}
              variant="primary"
              size="md"
              leftIcon={<Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />}
            >
              Start Screening Run
            </Button>

            <a
              href={jobsApi.exportCsvUrl(job.id)}
              download
              className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-2xl bg-white hover:bg-stone-50 text-stone-950 border-[2.5px] border-black text-xs font-black transition-all shadow-[3px_3px_0px_0px_#000000] hover:shadow-[5px_5px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000]"
            >
              <Download className="w-3.5 h-3.5 text-stone-700" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Bento Tile 2: Live Pipeline Telemetry Gauge */}
        <div className="lg:col-span-4 brutal-card p-6 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b-2 border-stone-900">
              <span className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#ff0844]" />
                <span>Pipeline Telemetry</span>
              </span>
              <span className="text-xs font-mono font-black text-emerald-950 bg-emerald-100 px-2.5 py-0.5 rounded-full border-2 border-stone-900 shadow-[1.5px_1.5px_0px_0px_#000000]">
                {shortlistPercent}% Shortlisted
              </span>
            </div>

            {/* 4-Cell Telemetry Grid */}
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <div className="p-3 glass-inner-box text-center">
                <span className="text-xl font-black text-stone-950 block">{stats.total_candidates}</span>
                <span className="text-[10px] text-stone-600 uppercase font-black">Uploaded</span>
              </div>
              <div className="p-3 glass-inner-box text-center">
                <span className="text-xl font-black text-[#ff0844] block">{stats.parsed_candidates}</span>
                <span className="text-[10px] text-stone-600 uppercase font-black">Parsed</span>
              </div>
              <div className="p-3 glass-inner-box text-center">
                <span className="text-xl font-black text-amber-700 block">{stats.scored_candidates}</span>
                <span className="text-[10px] text-stone-600 uppercase font-black">Scored</span>
              </div>
              <div className="p-3 glass-inner-box text-center">
                <span className="text-xl font-black text-emerald-700 block">{stats.shortlisted_candidates}</span>
                <span className="text-[10px] text-stone-600 uppercase font-black">Shortlisted</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t-2 border-stone-900 flex items-center justify-between text-[11px] font-bold text-stone-600">
            <span>Errors: {stats.failed_candidates}</span>
            <span className="text-[#ff0844] font-black">Model: scoring_v1</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BRUTAL BENTO GRID: ROW 2 (Job Requirements + Multi-File Upload Dropzone) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Bento Tile 3: Tech Stack & Criteria Snapshot */}
        <div className="lg:col-span-5 brutal-card p-5 space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#ff0844]" />
              <span>Must-Have Tech Stack</span>
            </span>
            <button
              onClick={() => setIsJdExpanded(!isJdExpanded)}
              className="text-[11px] text-[#ff0844] hover:text-[#e50039] font-black flex items-center gap-0.5 cursor-pointer"
            >
              <span>{isJdExpanded ? 'Collapse' : 'View Description'}</span>
              <ChevronRight className={`w-3 h-3 transition-transform ${isJdExpanded ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {/* Skill Pills */}
          <div className="flex flex-wrap gap-1.5">
            {job.must_have_skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-xl bg-stone-100 text-stone-900 border-2 border-stone-900 font-bold shadow-[2px_2px_0px_0px_#000000]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff0844]" />
                {skill}
              </span>
            ))}
          </div>

          {/* Expanded Job Description Box */}
          {isJdExpanded && (
            <div className="p-3.5 rounded-xl bg-stone-50 border-2 border-stone-900 text-xs text-stone-800 max-h-56 overflow-y-auto leading-relaxed font-mono font-semibold whitespace-pre-wrap shadow-inner">
              {job.description}
            </div>
          )}
        </div>

        {/* Bento Tile 4: Multi-File Resume Dropzone */}
        <div className="lg:col-span-7 brutal-card p-5 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-[#ff0844]" />
              <span>Multi-File Resume Ingestion</span>
            </span>
            <span className="text-[11px] font-bold text-stone-500">Supports .PDF & .TXT up to 15MB</span>
          </div>

          <Dropzone onUpload={handleUploadResumes} isLoading={isUploading} />

          {uploadResults && (
            <div className="p-3 rounded-xl bg-stone-50 border-2 border-stone-900 space-y-1.5 text-xs shadow-[2px_2px_0px_0px_#000000]">
              {uploadResults.uploadedCount > 0 && (
                <p className="text-emerald-800 font-black">
                  ✓ Successfully queued {uploadResults.uploadedCount} resume(s) for background parsing.
                </p>
              )}
              {uploadResults.errors.length > 0 && (
                <div className="space-y-0.5">
                  <span className="font-black text-[#ff0844] block">Upload issues / skipped files:</span>
                  {uploadResults.errors.map((err, idx) => (
                    <p key={idx} className="text-rose-800 font-bold text-[11px]">
                      • {err.filename}: {err.error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BRUTAL BENTO GRID: ROW 3 (Workspace Navigation & Command Center Hub) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* View Switcher Floating Pills */}
        <div className="flex items-center justify-between flex-wrap gap-3 p-1.5 rounded-2xl bg-white border-[2.5px] border-black shadow-[3px_3px_0px_0px_#000000]">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveView('shortlist')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border-2 border-black cursor-pointer ${
                activeView === 'shortlist'
                  ? 'bg-gradient-to-r from-[#ff0844] via-[#ff2a54] via-40% to-[#ff7300] text-white shadow-[2px_2px_0px_0px_#000000]'
                  : 'bg-white text-stone-700 hover:bg-stone-100 shadow-none'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-200" />
              <span>Ranked Shortlist</span>
              {shortlist && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-900 text-white font-mono font-black">
                  {shortlist.shortlisted_count}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('candidates')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border-2 border-black cursor-pointer ${
                activeView === 'candidates'
                  ? 'bg-gradient-to-r from-[#ff0844] via-[#ff2a54] via-40% to-[#ff7300] text-white shadow-[2px_2px_0px_0px_#000000]'
                  : 'bg-white text-stone-700 hover:bg-stone-100 shadow-none'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-stone-200" />
              <span>Candidate Pool</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-900 text-white font-mono font-black">
                {stats.total_candidates}
              </span>
            </button>

            <button
              onClick={() => setActiveView('audit')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border-2 border-black cursor-pointer ${
                activeView === 'audit'
                  ? 'bg-gradient-to-r from-[#ff0844] via-[#ff2a54] via-40% to-[#ff7300] text-white shadow-[2px_2px_0px_0px_#000000]'
                  : 'bg-white text-stone-700 hover:bg-stone-100 shadow-none'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>Audit Activity Log</span>
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* VIEW 1: RANKED SHORTLIST */}
        {/* ----------------------------------------------------------------------- */}
        {activeView === 'shortlist' && (
          <div className="space-y-4">
            {/* Filter & Rule Control Strip */}
            <div className="brutal-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
              <div>
                <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" /> Auditable Decision Rule:
                </span>
                <p className="text-xs font-bold text-stone-700 mt-0.5">
                  Qualifying Condition: <code className="px-2 py-0.5 rounded-md bg-stone-100 font-mono text-[#ff0844] text-[11px] border border-stone-900">Fit Score &gt;= {job.min_score_threshold.toFixed(1)}</code> and <code className="px-2 py-0.5 rounded-md bg-stone-100 font-mono text-emerald-800 text-[11px] border border-stone-900">Recommendation == 'shortlist'</code>
                </p>
              </div>

              {/* Sub-Tier Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-2xl border-2 border-stone-900">
                <button
                  onClick={() => setShortlistFilter('shortlisted')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border border-stone-900 cursor-pointer ${
                    shortlistFilter === 'shortlisted'
                      ? 'bg-emerald-600 text-white shadow-[2px_2px_0px_0px_#000000]'
                      : 'bg-white text-stone-700 hover:text-stone-950'
                  }`}
                >
                  <span>Shortlisted</span>
                  <span className="font-mono text-[11px] opacity-90">({shortlist?.shortlisted_count || 0})</span>
                </button>

                <button
                  onClick={() => setShortlistFilter('review')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border border-stone-900 cursor-pointer ${
                    shortlistFilter === 'review'
                      ? 'bg-amber-600 text-white shadow-[2px_2px_0px_0px_#000000]'
                      : 'bg-white text-stone-700 hover:text-stone-950'
                  }`}
                >
                  <span>Needs Review</span>
                  <span className="font-mono text-[11px] opacity-90">({shortlist?.review_count || 0})</span>
                </button>

                <button
                  onClick={() => setShortlistFilter('do_not_shortlist')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border border-stone-900 cursor-pointer ${
                    shortlistFilter === 'do_not_shortlist'
                      ? 'bg-gradient-to-r from-[#ff0844] via-[#ff2a54] to-[#ff7300] text-white shadow-[2px_2px_0px_0px_#000000]'
                      : 'bg-white text-stone-700 hover:text-stone-950'
                  }`}
                >
                  <span>Not Shortlisted</span>
                  <span className="font-mono text-[11px] opacity-90">({shortlist?.do_not_shortlist_count || 0})</span>
                </button>
              </div>
            </div>

            {/* List Results */}
            {isShortlistLoading && (
              <div className="flex justify-center py-16">
                <Spinner size="md" className="text-[#ff0844]" />
              </div>
            )}

            {!isShortlistLoading && shortlist && (
              <div className="space-y-4">
                {shortlistFilter === 'shortlisted' && (
                  <>
                    {shortlist.shortlisted.length === 0 ? (
                      <div className="brutal-card text-center py-12 px-6 space-y-3 bg-white">
                        <Award className="w-8 h-8 mx-auto text-stone-400" />
                        <p className="text-sm font-black text-stone-900">
                          No candidates currently meet the minimum threshold ({job.min_score_threshold.toFixed(1)}/10).
                        </p>
                        <p className="text-xs font-bold text-stone-500">
                          Check the "Needs Review" tab or click "Start Screening Run" to evaluate newly uploaded resumes.
                        </p>
                      </div>
                    ) : (
                      shortlist.shortlisted.map((cand, idx) => (
                        <ShortlistCard
                          key={cand.candidate_id}
                          candidate={cand}
                          rank={idx + 1}
                          onViewDetails={handleOpenCandidateDrawer}
                        />
                      ))
                    )}
                  </>
                )}

                {shortlistFilter === 'review' && (
                  <>
                    {shortlist.review.length === 0 ? (
                      <div className="brutal-card text-center py-12 px-6 space-y-2 bg-white">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
                        <p className="text-sm font-black text-stone-900">No candidates requiring manual recruiter review.</p>
                      </div>
                    ) : (
                      shortlist.review.map((cand, idx) => (
                        <ShortlistCard
                          key={cand.candidate_id}
                          candidate={cand}
                          rank={idx + 1}
                          onViewDetails={handleOpenCandidateDrawer}
                        />
                      ))
                    )}
                  </>
                )}

                {shortlistFilter === 'do_not_shortlist' && (
                  <>
                    {shortlist.do_not_shortlist.length === 0 ? (
                      <div className="brutal-card text-center py-12 px-6 space-y-2 bg-white">
                        <p className="text-sm font-black text-stone-900">No candidates in this tier.</p>
                      </div>
                    ) : (
                      shortlist.do_not_shortlist.map((cand, idx) => (
                        <ShortlistCard
                          key={cand.candidate_id}
                          candidate={cand}
                          rank={idx + 1}
                          onViewDetails={handleOpenCandidateDrawer}
                        />
                      ))
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* VIEW 2: FULL CANDIDATE POOL */}
        {/* ----------------------------------------------------------------------- */}
        {activeView === 'candidates' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-900" />
                <input
                  type="text"
                  placeholder="Search candidates by name, email, or file..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 glass-input rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={candidateStatusFilter}
                  onChange={(e) => setCandidateStatusFilter(e.target.value)}
                  className="px-3 py-2 glass-input rounded-xl text-xs"
                >
                  <option value="">All Statuses</option>
                  <option value="parsed">Parsed</option>
                  <option value="scored">Scored</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>

                <select
                  value={candidateSortBy}
                  onChange={(e) => setCandidateSortBy(e.target.value)}
                  className="px-3 py-2 glass-input rounded-xl text-xs"
                >
                  <option value="score">Sort by Fit Score</option>
                  <option value="created_at">Sort by Upload Date</option>
                  <option value="candidate_name">Sort by Candidate Name</option>
                </select>
              </div>
            </div>

            {/* Candidate Table Brutal Card */}
            <div className="brutal-card overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-stone-900 bg-stone-100 text-stone-900 font-black uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4">Candidate / Filename</th>
                      <th className="py-3.5 px-4">Experience</th>
                      <th className="py-3.5 px-4">Parsed Skills</th>
                      <th className="py-3.5 px-4">Status / Rec</th>
                      <th className="py-3.5 px-4">Fit Score</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-stone-100 text-stone-800">
                    {isCandidatesLoading && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-500">
                          <Spinner size="md" className="mx-auto text-[#ff0844] mb-2" />
                          <span className="font-bold">Loading candidate pool...</span>
                        </td>
                      </tr>
                    )}

                    {!isCandidatesLoading && (!candidates || candidates.length === 0) && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center font-bold text-stone-500">
                          No candidates uploaded yet. Drag & drop resumes above to get started.
                        </td>
                      </tr>
                    )}

                    {!isCandidatesLoading && candidates && candidates.map((cand) => {
                      const statusBadge = getStatusBadge(cand.status);
                      const recBadge = cand.latest_recommendation ? getRecommendationBadge(cand.latest_recommendation) : null;

                      return (
                        <tr
                          key={cand.id}
                          className="hover:bg-rose-50/50 transition-colors cursor-pointer font-bold"
                          onClick={() => handleOpenCandidateDrawer(cand.id)}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#ff0844] to-[#ff7300] border-2 border-black text-white font-black flex items-center justify-center text-xs shrink-0 shadow-[1px_1px_0px_0px_#000000]">
                                {getInitials(cand.candidate_name)}
                              </div>
                              <div>
                                <span className="font-black text-stone-950 block">
                                  {cand.candidate_name || 'Anonymous Candidate'}
                                </span>
                                <span className="text-[11px] font-bold text-stone-500">{cand.original_filename}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {cand.total_experience_years !== null && cand.total_experience_years !== undefined ? (
                              <span className="font-mono font-bold">~{cand.total_experience_years.toFixed(1)} yrs</span>
                            ) : (
                              <span className="text-stone-400 italic">N/A</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {cand.skills_preview.map((s, idx) => (
                                <Badge key={idx} variant="primary" size="sm">
                                  {s}
                                </Badge>
                              ))}
                              {cand.skills_count > cand.skills_preview.length && (
                                <Badge variant="default" size="sm">
                                  +{cand.skills_count - cand.skills_preview.length}
                                </Badge>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <Badge
                                variant={cand.status === 'scored' ? 'success' : cand.status === 'failed' ? 'danger' : 'default'}
                                size="sm"
                                dot
                              >
                                {statusBadge.label}
                              </Badge>
                              {recBadge && (
                                <Badge
                                  variant={cand.latest_recommendation === 'shortlist' ? 'success' : cand.latest_recommendation === 'review' ? 'warning' : 'danger'}
                                  size="sm"
                                >
                                  {recBadge.label}
                                </Badge>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {cand.latest_score !== null && cand.latest_score !== undefined ? (
                              <ScoreBadge score={cand.latest_score} size="md" />
                            ) : (
                              <span className="text-stone-400 text-xs font-bold">Unscored</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenCandidateDrawer(cand.id)}
                              leftIcon={<Eye className="w-3.5 h-3.5 text-[#ff0844]" />}
                            >
                              Inspect
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* VIEW 3: AUDIT ACTIVITY LOG */}
        {/* ----------------------------------------------------------------------- */}
        {activeView === 'audit' && (
          <div className="brutal-card p-5 space-y-4 bg-white">
            <h3 className="text-sm font-black text-stone-950 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#ff0844]" />
              <span>Immutable Audit Trail</span>
            </h3>

            <div className="space-y-2.5">
              {!auditEvents || auditEvents.length === 0 ? (
                <p className="text-xs font-bold text-stone-500 italic py-6 text-center">No audit events recorded yet.</p>
              ) : (
                auditEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3.5 glass-inner-box text-xs flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary" size="sm">
                          {evt.event_type}
                        </Badge>
                        <span className="text-stone-600 font-bold">by {evt.actor}</span>
                      </div>
                      <p className="text-stone-800 font-mono font-bold text-[11px]">
                        {JSON.stringify(evt.details)}
                      </p>
                    </div>
                    <span className="text-[11px] text-stone-600 whitespace-nowrap font-mono font-bold">
                      {formatDate(evt.timestamp)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Candidate Detail Drawer */}
      <CandidateDetailDrawer
        candidate={selectedCandidate || null}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onCandidateUpdated={() => {
          refetchSelectedCandidate();
          queryClient.invalidateQueries({ queryKey: ['candidates', jobId] });
          queryClient.invalidateQueries({ queryKey: ['shortlist', jobId] });
        }}
        onCandidateDeleted={() => {
          queryClient.invalidateQueries({ queryKey: ['candidates', jobId] });
          queryClient.invalidateQueries({ queryKey: ['shortlist', jobId] });
          queryClient.invalidateQueries({ queryKey: ['job', jobId] });
        }}
      />
    </div>
  );
};
