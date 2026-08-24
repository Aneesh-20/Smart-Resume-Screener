import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { jobsApi, CreateJobInput } from '../api/jobs';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Spinner } from '../components/common/Spinner';
import { formatDate } from '../utils/formatters';
import { InteractiveHero3D } from '../components/3d/InteractiveHero3D';
import {
  Briefcase, Plus, AlertCircle, ArrowRight, Search,
  Sparkles, Users, Award, ShieldCheck, Cpu,
  TrendingUp, Compass
} from 'lucide-react';

export const JobsListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [threshold, setThreshold] = useState('7.0');
  const [skillsInput, setSkillsInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobsApi.listJobs,
    refetchInterval: 5000,
  });

  const createMutation = useMutation({
    mutationFn: (newJob: CreateJobInput) => jobsApi.createJob(newJob),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to create screening job');
    },
  });

  const resetForm = () => {
    setTitle('');
    setDepartment('');
    setDescription('');
    setThreshold('7.0');
    setSkillsInput('');
    setFormError(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.length < 2) {
      setFormError('Job title must be at least 2 characters.');
      return;
    }
    if (!description.trim() || description.length < 20) {
      setFormError('Job description must be at least 20 characters.');
      return;
    }

    const mustHaveSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    createMutation.mutate({
      title: title.trim(),
      department: department.trim() || undefined,
      description: description.trim(),
      min_score_threshold: parseFloat(threshold) || 7.0,
      must_have_skills: mustHaveSkills,
    });
  };

  // Aggregated Pipeline Stats
  const totalJobs = jobs?.length || 0;
  const totalCandidates = jobs?.reduce((sum, j) => sum + (j.stats?.total_candidates || 0), 0) || 0;
  const totalScored = jobs?.reduce((sum, j) => sum + (j.stats?.scored_candidates || 0), 0) || 0;
  const totalShortlisted = jobs?.reduce((sum, j) => sum + (j.stats?.shortlisted_candidates || 0), 0) || 0;

  const filteredJobs = jobs?.filter((job) => {
    const q = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      (job.department && job.department.toLowerCase().includes(q)) ||
      job.must_have_skills.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* BRUTAL BENTO GRID: TOP ROW (Hero Banner + Framework Tile) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Bento Tile 1: Brutal Hero Banner */}
        <div className="lg:col-span-7 brutal-hero p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[320px]">
          {/* Interactive 3D Canvas Layer */}
          <InteractiveHero3D />

          <div className="space-y-4 relative z-10">
            <div className="glass-badge-rosegold">
              <Sparkles className="w-3.5 h-3.5 text-[#ff0844] animate-pulse" />
              <span>Auditable AI Candidate Screening</span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 tracking-tight leading-tight">
                Resume Intelligence <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff0844] via-[#ff2a54] via-40% to-[#ff7300]">
                  Command Center
                </span>
              </h1>
              <p className="text-xs sm:text-sm font-bold text-stone-700 mt-2.5 max-w-xl leading-relaxed">
                Intelligently parse resumes, evaluate semantic job fit on an explainable 1.0–10.0 scale, and generate verifiable candidate shortlists.
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap items-center gap-3 relative z-10">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size="md"
              leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
            >
              Create Screening Job
            </Button>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-900" />
              <input
                type="text"
                placeholder="Search workflows or required skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 glass-input rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Bento Tile 2: AI Engine Governance & Framework Brutal Tile */}
        <div className="lg:col-span-5 brutal-card p-6 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b-2 border-stone-900">
              <span className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#ff0844]" />
                <span>Evaluation Framework</span>
              </span>
              <span className="glass-badge-emerald">
                <ShieldCheck className="w-3.5 h-3.5" /> Human-in-the-Loop
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="p-3 glass-inner-box flex items-center justify-between text-xs">
                <span className="text-stone-700 font-bold">Scoring Standard</span>
                <span className="font-mono font-black text-[#ff0844]">
                  1.0 – 10.0 Normalized
                </span>
              </div>

              <div className="p-3 glass-inner-box flex items-center justify-between text-xs">
                <span className="text-stone-700 font-bold">4 Breakdown Factors</span>
                <span className="text-stone-900 font-mono font-bold text-[11px]">Skills (4) • Exp (4) • Edu (1) • Role (1)</span>
              </div>

              <div className="p-3 glass-inner-box flex items-center justify-between text-xs">
                <span className="text-stone-700 font-bold">Model Temperature</span>
                <span className="font-mono font-black text-amber-700">0.1 (High Determinism)</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] font-bold text-stone-600 mt-4 leading-relaxed">
            Protected demographic attributes are excluded from evaluation. All candidate determinations require recruiter verification.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BRUTAL BENTO GRID: STATS METRICS STRIP */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="brutal-card p-4 bg-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-stone-900 uppercase">Active Jobs</span>
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-[#ff0844] via-[#ff2a54] to-[#ff7300] text-white border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000000]">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-stone-950 tracking-tight">{totalJobs}</span>
            <span className="text-[11px] font-bold text-stone-600">workflows</span>
          </div>
        </div>

        <div className="brutal-card p-4 bg-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-stone-900 uppercase">Candidate Pool</span>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900 border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000000]">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-stone-950 tracking-tight">{totalCandidates}</span>
            <span className="text-[11px] font-bold text-amber-700">uploaded</span>
          </div>
        </div>

        <div className="brutal-card p-4 bg-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-stone-900 uppercase">Scored Resumes</span>
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-[#ff0844] via-[#ff2a54] to-[#ff7300] text-white border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000000]">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#ff0844] tracking-tight">{totalScored}</span>
            <span className="text-[11px] font-bold text-stone-600">evaluated</span>
          </div>
        </div>

        <div className="brutal-card p-4 bg-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-stone-900 uppercase">Shortlisted</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-900 border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000000]">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700 tracking-tight">{totalShortlisted}</span>
            <span className="text-[11px] font-bold text-emerald-800">high fit</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BRUTAL BENTO GRID: JOB CARDS GRID */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black text-stone-950 flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#ff0844]" />
            <span>Screening Workspaces</span>
          </h2>
          {searchQuery && (
            <span className="text-xs font-bold text-stone-600">
              Found {filteredJobs?.length || 0} result(s) for "{searchQuery}"
            </span>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spinner size="lg" className="text-[#ff0844]" />
            <p className="text-xs font-bold text-stone-600">Loading screening workflows...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 rounded-2xl bg-rose-100 border-2 border-black shadow-[4px_4px_0px_0px_#000000] text-rose-950 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-700" />
            <div>
              <p className="font-black text-sm">Failed to load jobs</p>
              <p className="text-xs font-bold text-rose-800">{(error as any).message || 'Server connection error.'}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredJobs && filteredJobs.length === 0 && (
          <div className="brutal-card text-center py-16 px-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#ff0844] via-[#ff2a54] to-[#ff7300] text-white border-2 border-black shadow-[3px_3px_0px_0px_#000000] flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-950">No screening jobs found</h3>
              <p className="text-xs font-bold text-stone-600 max-w-sm mx-auto mt-1">
                {searchQuery
                  ? `No jobs matched your search "${searchQuery}".`
                  : 'Create your first screening job with a job description and threshold to start parsing resumes.'}
              </p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size="sm"
              leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
            >
              Create Job Now
            </Button>
          </div>
        )}

        {/* Brutal Jobs Grid */}
        {!isLoading && filteredJobs && filteredJobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map((job) => {
              const stats = job.stats || {
                total_candidates: 0,
                parsed_candidates: 0,
                scored_candidates: 0,
                shortlisted_candidates: 0,
                failed_candidates: 0,
              };

              return (
                <Link key={job.id} to={`/jobs/${job.id}`} className="block group">
                  <div className="brutal-card-interactive p-5 h-full flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {job.department && (
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block mb-1">
                              {job.department}
                            </span>
                          )}
                          <h3 className="text-base font-black text-stone-950 group-hover:text-[#ff0844] transition-colors">
                            {job.title}
                          </h3>
                        </div>

                        <span className="glass-badge-rosegold font-mono font-black">
                          Min {job.min_score_threshold.toFixed(1)}/10
                        </span>
                      </div>

                      {/* Description Preview */}
                      <p className="text-xs font-bold text-stone-700 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      {/* Must-have skills pills */}
                      {job.must_have_skills && job.must_have_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {job.must_have_skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-900 border border-stone-900 shadow-[1px_1px_0px_0px_#1c1917]"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ff0844]" />
                              {skill}
                            </span>
                          ))}
                          {job.must_have_skills.length > 3 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-900">
                              +{job.must_have_skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bento Card Footer & Metric Tiles */}
                    <div className="pt-3 border-t-2 border-stone-900 space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 glass-inner-box">
                          <span className="block font-black text-stone-950 text-xs">
                            {stats.total_candidates}
                          </span>
                          <span className="text-[10px] text-stone-600 font-bold">Total</span>
                        </div>
                        <div className="p-2 glass-inner-box">
                          <span className="block font-black text-[#ff0844] text-xs">
                            {stats.scored_candidates}
                          </span>
                          <span className="text-[10px] text-stone-600 font-bold">Scored</span>
                        </div>
                        <div className="p-2 glass-inner-box">
                          <span className="block font-black text-emerald-700 text-xs">
                            {stats.shortlisted_candidates}
                          </span>
                          <span className="text-[10px] text-stone-600 font-bold">Shortlist</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 pt-1">
                        <span>Created {formatDate(job.created_at)}</span>
                        <span className="inline-flex items-center gap-1 font-black text-[#ff0844] group-hover:translate-x-1 transition-transform">
                          Open Hub <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CREATE JOB MODAL */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Screening Workflow"
          subtitle="Define job requirements, must-have skills, and minimum match threshold."
          maxWidth="xl"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-100 border-2 border-black text-rose-950 text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_#000000]">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-stone-900">
                  Job Title <span className="text-[#ff0844]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-stone-900">
                  Department / Team (Optional)
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Core Platform"
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-stone-900">
                Minimum Fit Score Threshold (1.0 – 10.0)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1.0"
                  max="10.0"
                  step="0.5"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-28 px-3 py-2 glass-input rounded-xl text-xs font-mono font-bold"
                />
                <span className="text-xs font-bold text-stone-600">
                  Default: 7.0/10. Candidates scoring at or above this threshold qualify for shortlist.
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-stone-900">
                Must-Have Skills (comma separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Python, FastAPI, React, PostgreSQL, Docker"
                className="w-full px-3 py-2 glass-input rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-stone-900">
                Job Description <span className="text-[#ff0844]">*</span>
              </label>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste the complete job description, responsibilities, and qualifications..."
                className="w-full px-3 py-2 glass-input rounded-xl text-xs leading-relaxed font-mono font-bold"
              />
            </div>

            <div className="pt-3 border-t-2 border-black flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={createMutation.isPending}
                leftIcon={<Plus className="w-3.5 h-3.5 stroke-[3]" />}
              >
                Create Screening Job
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
