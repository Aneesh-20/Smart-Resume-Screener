import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '../api/jobs';
import { candidatesApi } from '../api/candidates';
import { screeningsApi } from '../api/screenings';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ScoreBadge } from '../components/common/ScoreBadge';
import { Dropzone } from '../components/common/Dropzone';
import { Spinner } from '../components/common/Spinner';
import { CandidateDetailDrawer } from '../components/candidate/CandidateDetailDrawer';
import { ShortlistCard } from '../components/screening/ShortlistCard';
import { ResponsibleNotice } from '../components/layout/ResponsibleNotice';
import { formatDate, getInitials } from '../utils/formatters';
import { getRecommendationBadge, getStatusBadge } from '../../src/utils/scoreColors';
import {
  Briefcase, ArrowLeft, Download, Sparkles, UploadCloud, Users,
  Award, AlertCircle, CheckCircle2, Search, Eye, Clock
} from 'lucide-react';

export const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'shortlist' | 'audit'>('shortlist');
  const [shortlistFilter, setShortlistFilter] = useState<'shortlisted' | 'review' | 'do_not_shortlist'>('shortlisted');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidateStatusFilter, setCandidateStatusFilter] = useState<string>('');
  const [candidateSortBy, setCandidateSortBy] = useState<string>('score');

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
    enabled: !!jobId && activeTab === 'audit',
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
      setActiveTab('shortlist');
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
        <Spinner size="lg" className="text-indigo-500" />
        <p className="text-xs text-slate-400 font-medium">Loading screening workspace...</p>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Job not found</h2>
        <p className="text-xs text-slate-400">The requested screening job could not be loaded.</p>
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-300 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Jobs
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {job.title}
            </h1>
            {job.department && (
              <Badge variant="primary" size="sm">
                {job.department}
              </Badge>
            )}
            <Badge variant="default" size="sm">
              Threshold: {job.min_score_threshold.toFixed(1)}/10
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href={jobsApi.exportCsvUrl(job.id)}
            download
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </a>

          <Button
            onClick={() => screeningMutation.mutate()}
            isLoading={screeningMutation.isPending}
            variant="primary"
            size="md"
            leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
          >
            Start Screening Run
          </Button>
        </div>
      </div>

      {/* Responsible Notice */}
      <ResponsibleNotice />

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card padding="sm" className="bg-slate-900/40">
          <span className="text-[11px] font-medium text-slate-400 block">Total Uploads</span>
          <span className="text-xl font-bold text-white mt-1 block">{stats.total_candidates}</span>
        </Card>

        <Card padding="sm" className="bg-slate-900/40">
          <span className="text-[11px] font-medium text-slate-400 block">Parsed Profiles</span>
          <span className="text-xl font-bold text-cyan-400 mt-1 block">{stats.parsed_candidates}</span>
        </Card>

        <Card padding="sm" className="bg-slate-900/40">
          <span className="text-[11px] font-medium text-slate-400 block">Scored Candidates</span>
          <span className="text-xl font-bold text-indigo-400 mt-1 block">{stats.scored_candidates}</span>
        </Card>

        <Card padding="sm" className="bg-slate-900/40">
          <span className="text-[11px] font-medium text-slate-400 block">Shortlisted</span>
          <span className="text-xl font-bold text-emerald-400 mt-1 block">{stats.shortlisted_candidates}</span>
        </Card>

        <Card padding="sm" className="bg-slate-900/40 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-medium text-slate-400 block">Failed / Errors</span>
          <span className={`text-xl font-bold mt-1 block ${stats.failed_candidates > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
            {stats.failed_candidates}
          </span>
        </Card>
      </div>

      {/* Workspace Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('shortlist')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'shortlist'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Shortlist & Ranking</span>
          {shortlist && (
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {shortlist.shortlisted_count}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('candidates')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'candidates'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-400" />
          <span>Upload & Candidate Pool</span>
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {stats.total_candidates}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4 text-slate-400" />
          <span>Job Description & Snapshot</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Audit Log</span>
        </button>
      </div>

      {/* Tab 1: Shortlist & Ranking */}
      {activeTab === 'shortlist' && (
        <div className="space-y-6">
          {/* Rule & Filtering Control Strip */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Auditable Shortlist Decision Rule
              </span>
              <p className="text-xs text-slate-300">
                Rule: <code className="px-1.5 py-0.5 rounded bg-slate-950 font-mono text-indigo-300">Fit Score &gt;= {job.min_score_threshold.toFixed(1)}</code> and <code className="px-1.5 py-0.5 rounded bg-slate-950 font-mono text-emerald-300">Recommendation == 'shortlist'</code>
              </p>
            </div>

            {/* Sub-Tabs: Shortlisted / Needs Review / Do Not Shortlist */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setShortlistFilter('shortlisted')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  shortlistFilter === 'shortlisted'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Shortlisted</span>
                <span className="font-mono text-[11px] opacity-80">({shortlist?.shortlisted_count || 0})</span>
              </button>

              <button
                onClick={() => setShortlistFilter('review')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  shortlistFilter === 'review'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Needs Review</span>
                <span className="font-mono text-[11px] opacity-80">({shortlist?.review_count || 0})</span>
              </button>

              <button
                onClick={() => setShortlistFilter('do_not_shortlist')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  shortlistFilter === 'do_not_shortlist'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Not Shortlisted</span>
                <span className="font-mono text-[11px] opacity-80">({shortlist?.do_not_shortlist_count || 0})</span>
              </button>
            </div>
          </div>

          {/* List Content */}
          {isShortlistLoading && (
            <div className="flex justify-center py-16">
              <Spinner size="md" className="text-indigo-500" />
            </div>
          )}

          {!isShortlistLoading && shortlist && (
            <div className="space-y-4">
              {shortlistFilter === 'shortlisted' && (
                <>
                  {shortlist.shortlisted.length === 0 ? (
                    <Card padding="lg" className="text-center py-12 space-y-3">
                      <Award className="w-8 h-8 mx-auto text-slate-500" />
                      <p className="text-sm font-semibold text-slate-300">
                        No candidates currently qualify for the shortlist threshold ({job.min_score_threshold.toFixed(1)}/10).
                      </p>
                      <p className="text-xs text-slate-500">
                        Check the "Needs Review" tab or click "Start Screening Run" to score new uploads.
                      </p>
                    </Card>
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
                    <Card padding="lg" className="text-center py-12 space-y-2">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400/50" />
                      <p className="text-sm font-semibold text-slate-300">No candidates requiring manual recruiter review.</p>
                    </Card>
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
                    <Card padding="lg" className="text-center py-12 space-y-2">
                      <p className="text-sm font-semibold text-slate-300">No candidates in this tier.</p>
                    </Card>
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

      {/* Tab 2: Uploads & Candidate Pool */}
      {activeTab === 'candidates' && (
        <div className="space-y-6">
          {/* Uploader Card */}
          <Card padding="md">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-indigo-400" />
              <span>Multi-File Resume Upload</span>
            </h3>
            <Dropzone onUpload={handleUploadResumes} isLoading={isUploading} />

            {uploadResults && (
              <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                {uploadResults.uploadedCount > 0 && (
                  <p className="text-emerald-400 font-medium">
                    ✓ Successfully uploaded and queued {uploadResults.uploadedCount} resume(s) for background parsing.
                  </p>
                )}
                {uploadResults.errors.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-semibold text-rose-400 block">Upload warnings / skipped files:</span>
                    {uploadResults.errors.map((err, idx) => (
                      <p key={idx} className="text-rose-300/90 pl-2">
                        • {err.filename}: {err.error}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Search & Filter Table Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search candidates by name, email, or filename..."
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={candidateStatusFilter}
                onChange={(e) => setCandidateStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
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
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="score">Sort by Fit Score</option>
                <option value="created_at">Sort by Upload Date</option>
                <option value="candidate_name">Sort by Candidate Name</option>
              </select>
            </div>
          </div>

          {/* Candidate Table */}
          <Card padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Candidate / Filename</th>
                    <th className="py-3 px-4">Experience</th>
                    <th className="py-3 px-4">Parsed Skills</th>
                    <th className="py-3 px-4">Status / Rec</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {isCandidatesLoading && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <Spinner size="md" className="mx-auto text-indigo-500 mb-2" />
                        <span>Loading candidate pool...</span>
                      </td>
                    </tr>
                  )}

                  {!isCandidatesLoading && (!candidates || candidates.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
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
                        className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                        onClick={() => handleOpenCandidateDrawer(cand.id)}
                      >
                        {/* Name & Avatar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0">
                              {getInitials(cand.candidate_name)}
                            </div>
                            <div>
                              <span className="font-semibold text-white block">
                                {cand.candidate_name || 'Anonymous Candidate'}
                              </span>
                              <span className="text-[11px] text-slate-400">{cand.original_filename}</span>
                            </div>
                          </div>
                        </td>

                        {/* Experience */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {cand.total_experience_years !== null && cand.total_experience_years !== undefined ? (
                            <span>~{cand.total_experience_years.toFixed(1)} yrs</span>
                          ) : (
                            <span className="text-slate-500 italic">Not determined</span>
                          )}
                        </td>

                        {/* Skills */}
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

                        {/* Status / Rec */}
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

                        {/* Fit Score */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {cand.latest_score !== null && cand.latest_score !== undefined ? (
                            <ScoreBadge score={cand.latest_score} size="md" />
                          ) : (
                            <span className="text-slate-500 text-xs">Unscored</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenCandidateDrawer(cand.id)}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
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
          </Card>
        </div>
      )}

      {/* Tab 3: Overview & Job Snapshot */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card padding="md" className="space-y-4">
              <h3 className="text-base font-bold text-white">Full Job Description</h3>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                {job.description}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card padding="md" className="space-y-3">
              <h3 className="text-sm font-bold text-white">Must-Have Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {job.must_have_skills.map((skill, idx) => (
                  <Badge key={idx} variant="primary" size="md">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card padding="md" className="space-y-3">
              <h3 className="text-sm font-bold text-white">Screening Model & Provenance</h3>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Prompt Version</span>
                  <span className="font-mono text-indigo-400">scoring_v1</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">LLM Mode</span>
                  <span className="font-medium text-slate-200">OpenAI Compatible</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Fallback Engine</span>
                  <span className="font-medium text-emerald-400">Transparent Rule Engine</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Activity */}
      {activeTab === 'audit' && (
        <Card padding="md" className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Audit Trail & Activity Log</span>
          </h3>

          <div className="space-y-3">
            {!auditEvents || auditEvents.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">No audit events recorded yet.</p>
            ) : (
              auditEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" size="sm">
                        {evt.event_type}
                      </Badge>
                      <span className="text-slate-400">by {evt.actor}</span>
                    </div>
                    <p className="text-slate-300 font-mono text-[11px]">
                      {JSON.stringify(evt.details)}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-500 whitespace-nowrap">
                    {formatDate(evt.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

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
