import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { jobsApi, CreateJobInput } from '../api/jobs';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Spinner } from '../components/common/Spinner';
import { formatDate } from '../utils/formatters';
import { InteractiveHero3D } from '../components/3d/InteractiveHero3D';
import {
  Briefcase, Plus, AlertCircle, ArrowRight, Search,
  Users, Award, Cpu,
  PlusCircle, Layers
} from 'lucide-react';

export const JobsListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for quick inline creation
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
    onSuccess: (createdJob) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setIsCreateModalOpen(false);
      resetForm();
      navigate(`/jobs/${createdJob.id}`);
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

  // Primary active job (find job with candidates, or fallback to first job)
  const primaryJob = jobs?.find((j) => (j.stats?.total_candidates || 0) > 0) || (jobs && jobs.length > 0 ? jobs[0] : null);

  const scrollToWorkspaces = () => {
    setSearchQuery('');
    const el = document.getElementById('screening-workspaces');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStatCardClick = (type: 'jobs' | 'candidates' | 'scored' | 'shortlisted') => {
    if (type === 'jobs' || !primaryJob) {
      scrollToWorkspaces();
      return;
    }

    if (type === 'candidates') {
      navigate(`/jobs/${primaryJob.id}?tab=candidates`);
    } else if (type === 'scored') {
      navigate(`/jobs/${primaryJob.id}?tab=candidates&status=scored`);
    } else if (type === 'shortlisted') {
      navigate(`/jobs/${primaryJob.id}?tab=shortlist`);
    }
  };

  const filteredJobs = jobs?.filter((job) => {
    const q = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      (job.department && job.department.toLowerCase().includes(q)) ||
      job.must_have_skills.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* ========================================================================= */}
      {/* EXECUTIVE DASHBOARD HERO & 3D VISUALIZATION */}
      {/* ========================================================================= */}
      <section className="relative rounded-3xl p-6 sm:p-10 glass-card-strong border-[2.5px] border-slate-900 shadow-[6px_6px_0px_0px_#0f172a] overflow-hidden">
        {/* Subtle Nordic Background Gradient Accent */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-sky-50 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0284c7] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0284c7]"></span>
              </span>
              <span className="text-xs font-black text-slate-900 tracking-wide uppercase">
                Recruitment Intelligence Dashboard
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-[1.1]">
                High-Volume Candidate Screening{' '}
                <span className="bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent underline decoration-slate-900 decoration-4 underline-offset-4">
                  Driven by Semantic AI
                </span>
              </h1>
              <p className="text-sm sm:text-base font-bold text-slate-700 max-w-2xl leading-relaxed">
                Automated multi-dimensional candidate evaluation, deterministic skill matching, and transparent evidence extraction.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/create-job"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-black rounded-2xl bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white border-[2.5px] border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] hover:shadow-[6px_6px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 stroke-[3]" />
                <span>Create Screening Job</span>
              </Link>

              <button
                type="button"
                onClick={scrollToWorkspaces}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-black rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border-[2.5px] border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] hover:shadow-[4px_4px_0px_0px_#0f172a] transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4 text-[#0284c7]" />
                <span>View All Workspaces ({totalJobs})</span>
              </button>
            </div>
          </div>

          {/* Right Column: 3D Interactive Hero Canvas */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="w-full max-w-sm rounded-2xl bg-white/90 border-2 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] p-3 backdrop-blur-sm">
              <InteractiveHero3D />
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-2 pt-2 border-t border-slate-200">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-[#0284c7]" /> 3D Semantic Space
                </span>
                <span className="font-mono text-[#0284c7] font-black">AI Live Engine</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE METRIC TILES */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t-2 border-slate-900">
          {/* Card 1: Total Jobs */}
          <button
            type="button"
            onClick={() => handleStatCardClick('jobs')}
            className="p-4 rounded-2xl bg-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] hover:shadow-[5px_5px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                Screening Jobs
              </span>
              <Briefcase className="w-4 h-4 text-[#0284c7] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 font-mono">
              {totalJobs}
            </div>
            <p className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
              <span>View all workspaces</span>
              <ArrowRight className="w-3 h-3 text-[#0284c7]" />
            </p>
          </button>

          {/* Card 2: Ingested Candidates */}
          <button
            type="button"
            onClick={() => handleStatCardClick('candidates')}
            className="p-4 rounded-2xl bg-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] hover:shadow-[5px_5px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                Ingested Resumes
              </span>
              <Users className="w-4 h-4 text-[#0ea5e9] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 font-mono">
              {totalCandidates}
            </div>
            <p className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
              <span>Candidate Pool</span>
              <ArrowRight className="w-3 h-3 text-[#0ea5e9]" />
            </p>
          </button>

          {/* Card 3: Scored Candidates */}
          <button
            type="button"
            onClick={() => handleStatCardClick('scored')}
            className="p-4 rounded-2xl bg-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] hover:shadow-[5px_5px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                Evaluated Fits
              </span>
              <Cpu className="w-4 h-4 text-[#0284c7] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0284c7] mt-1 font-mono">
              {totalScored}
            </div>
            <p className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
              <span>Scored Profiles</span>
              <ArrowRight className="w-3 h-3 text-[#0284c7]" />
            </p>
          </button>

          {/* Card 4: Shortlisted Talent */}
          <button
            type="button"
            onClick={() => handleStatCardClick('shortlisted')}
            className="p-4 rounded-2xl bg-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] hover:shadow-[5px_5px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                Top Shortlist
              </span>
              <Award className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 font-mono">
              {totalShortlisted}
            </div>
            <p className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
              <span>Qualified Candidates</span>
              <ArrowRight className="w-3 h-3 text-emerald-600" />
            </p>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SCREENING WORKSPACES SECTION (ALL SCREENING JOBS) */}
      {/* ========================================================================= */}
      <div id="screening-workspaces" className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#0284c7]" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                Screening Job Workspaces
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-600">
              Manage candidate ingestion, run batch screening, and review auditable shortlists.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search job title, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-xl border-2 border-slate-900 bg-white text-xs font-bold text-slate-900 placeholder-slate-400 shadow-[2px_2px_0px_0px_#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0284c7] w-56 sm:w-64"
              />
            </div>

            {/* Create Job Primary Button */}
            <Link
              to="/create-job"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white border-2 border-slate-900 shadow-[2.5px_2.5px_0px_0px_#0f172a] hover:shadow-[4px_4px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Job</span>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center rounded-2xl bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a]">
            <Spinner size="lg" className="mx-auto mb-3 text-[#0284c7]" />
            <p className="text-xs font-black text-slate-700">Loading screening jobs from database...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 rounded-2xl bg-rose-50 border-2 border-rose-900 shadow-[4px_4px_0px_0px_#881337] flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-black text-sm text-rose-950">Failed to connect to screening server</h3>
              <p className="text-xs font-bold text-rose-800 mt-1">{(error as any).message}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredJobs && filteredJobs.length === 0 && (
          <div className="p-10 text-center rounded-3xl bg-white border-[2.5px] border-slate-900 shadow-[5px_5px_0px_0px_#0f172a] space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center mx-auto text-[#0284c7]">
              <Briefcase className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">
                {searchQuery ? 'No matching screening jobs found' : 'No screening jobs created yet'}
              </h3>
              <p className="text-xs font-bold text-slate-600 max-w-md mx-auto">
                {searchQuery
                  ? `No roles matched "${searchQuery}". Try clearing search filters.`
                  : 'Get started by creating your first candidate screening workspace.'}
              </p>
            </div>
            <div>
              <Link
                to="/create-job"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black rounded-2xl bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] text-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] hover:shadow-[5px_5px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create Screening Job</span>
              </Link>
            </div>
          </div>
        )}

        {/* Screening Job Grid */}
        {!isLoading && !error && filteredJobs && filteredJobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => {
              const stats = job.stats || { total_candidates: 0, scored_candidates: 0, shortlisted_candidates: 0 };

              return (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="group block rounded-2xl bg-white border-[2.5px] border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] hover:shadow-[7px_7px_0px_0px_#0f172a] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                          {job.department || 'General Role'}
                        </span>
                        <h3 className="text-base font-black text-slate-950 group-hover:text-[#0284c7] transition-colors line-clamp-1">
                          {job.title}
                        </h3>
                      </div>
                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-sky-50 text-[#0284c7] border-2 border-slate-900 shadow-[1px_1px_0px_0px_#0f172a] shrink-0">
                        &ge; {job.min_score_threshold.toFixed(1)}/10
                      </span>
                    </div>

                    {/* Description snippet */}
                    <p className="text-xs font-bold text-slate-600 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Must-have skills pills */}
                    {job.must_have_skills && job.must_have_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.must_have_skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-900"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
                            {skill}
                          </span>
                        ))}
                        {job.must_have_skills.length > 3 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-900">
                            +{job.must_have_skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bento Card Footer & Metric Tiles */}
                  <div className="p-5 pt-0 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t-2 border-slate-900">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-900 shadow-[1px_1px_0px_0px_#0f172a]">
                        <span className="block font-black text-slate-950 text-xs font-mono">
                          {stats.total_candidates}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">Total</span>
                      </div>
                      <div className="p-2 rounded-xl bg-sky-50 border border-slate-900 shadow-[1px_1px_0px_0px_#0f172a]">
                        <span className="block font-black text-[#0284c7] text-xs font-mono">
                          {stats.scored_candidates}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">Scored</span>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-50 border border-slate-900 shadow-[1px_1px_0px_0px_#0f172a]">
                        <span className="block font-black text-emerald-700 text-xs font-mono">
                          {stats.shortlisted_candidates}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">Shortlist</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1">
                      <span>Created {formatDate(job.created_at)}</span>
                      <span className="inline-flex items-center gap-1 font-black text-[#0284c7] group-hover:translate-x-1 transition-transform">
                        Open Workspace <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* QUICK INLINE MODAL (Fallback / Direct creation) */}
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
              <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-900 text-rose-950 text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_#881337]">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-900">
                  Job Title <span className="text-[#0284c7]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 bg-slate-50 text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-900">
                  Department / Team (Optional)
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Core Platform"
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 bg-slate-50 text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-900">
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
                  className="w-28 px-3 py-2 rounded-xl border-2 border-slate-900 bg-slate-50 text-slate-900 text-xs font-mono font-bold"
                />
                <span className="text-xs font-bold text-slate-600">
                  Default: 7.0/10. Candidates scoring at or above this threshold qualify for shortlist.
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-900">
                Must-Have Skills (comma separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Python, FastAPI, React, PostgreSQL, Docker"
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 bg-slate-50 text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-900">
                Job Description <span className="text-[#0284c7]">*</span>
              </label>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste the complete job description, responsibilities, and qualifications..."
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 bg-slate-50 text-slate-900 text-xs font-mono font-bold leading-relaxed resize-y"
              />
            </div>

            <div className="pt-3 border-t-2 border-slate-900 flex items-center justify-end gap-2">
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
