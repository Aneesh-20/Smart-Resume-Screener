import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { jobsApi, CreateJobInput } from '../api/jobs';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Spinner } from '../components/common/Spinner';
import { formatDate } from '../utils/formatters';
import { InteractiveHero3D } from '../components/3d/InteractiveHero3D';
import { TiltCard3D } from '../components/3d/TiltCard3D';
import {
  Briefcase, Plus, AlertCircle, ArrowRight, Search,
  Sparkles, Users, Award, ShieldCheck, Cpu, Layers,
  TrendingUp
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* BENTO GRID: TOP ROW (Hero Card with 3D Canvas + Engine Card) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Bento Tile 1: Hero Banner with Interactive 3D Neural Particle Core */}
        <div className="lg:col-span-7 bento-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-slate-900/95 via-slate-900/70 to-indigo-950/40 border border-slate-800 min-h-[300px]">
          {/* Interactive 3D Canvas Canvas Layer */}
          <InteractiveHero3D />

          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Interactive 3D Candidate Intelligence</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
                Smart Resume Screening Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                Parse candidate resumes, evaluate semantic job fit on a 1.0–10.0 scale, and generate explainable shortlists with interactive 3D telemetry.
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap items-center gap-3 relative z-10">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 backdrop-blur-sm"
            >
              Create Screening Job
            </Button>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search workflows or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Bento Tile 2: AI Engine Governance & Scoring Model */}
        <div className="lg:col-span-5 bento-card p-6 flex flex-col justify-between bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Evaluation Framework</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" /> Human-in-the-Loop
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Scoring Scale</span>
                <span className="font-mono font-bold text-indigo-300">1.0 – 10.0 Normalized</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">4 Breakdown Factors</span>
                <span className="text-slate-200 font-mono text-[11px]">Skills (4) • Exp (4) • Edu (1) • Role (1)</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Model Temperature</span>
                <span className="font-mono text-cyan-400">0.1 (High Determinism)</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
            Protected demographic attributes are excluded from scoring. Shortlist decisions require human recruiter confirmation.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BENTO GRID: STATS METRICS STRIP (4 Asymmetric Tilt Cards) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <TiltCard3D>
          <div className="bento-card p-4 bg-slate-900/50 border border-slate-800/80 h-full">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Active Jobs</span>
              <Briefcase className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{totalJobs}</span>
              <span className="text-[11px] text-slate-500">workflows</span>
            </div>
          </div>
        </TiltCard3D>

        <TiltCard3D>
          <div className="bento-card p-4 bg-slate-900/50 border border-slate-800/80 h-full">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Candidate Pool</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{totalCandidates}</span>
              <span className="text-[11px] text-cyan-400/80 font-medium">uploaded</span>
            </div>
          </div>
        </TiltCard3D>

        <TiltCard3D>
          <div className="bento-card p-4 bg-slate-900/50 border border-slate-800/80 h-full">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Scored Resumes</span>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-300">{totalScored}</span>
              <span className="text-[11px] text-slate-500">evaluated</span>
            </div>
          </div>
        </TiltCard3D>

        <TiltCard3D>
          <div className="bento-card p-4 bg-slate-900/50 border border-slate-800/80 h-full">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Shortlisted</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">{totalShortlisted}</span>
              <span className="text-[11px] text-emerald-500/80 font-medium">high fit</span>
            </div>
          </div>
        </TiltCard3D>
      </div>

      {/* ========================================================================= */}
      {/* BENTO GRID: JOB CARDS GRID (With 3D Physics Tilt) */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Screening Workspaces</span>
          </h2>
          {searchQuery && (
            <span className="text-xs text-slate-400">
              Found {filteredJobs?.length || 0} result(s) for "{searchQuery}"
            </span>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spinner size="lg" className="text-indigo-500" />
            <p className="text-xs text-slate-400 font-medium">Loading screening workflows...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <div>
              <p className="font-semibold text-sm">Failed to load jobs</p>
              <p className="text-xs text-rose-300/80">{(error as any).message || 'Server connection error.'}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredJobs && filteredJobs.length === 0 && (
          <div className="bento-card text-center py-16 px-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No screening jobs found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {searchQuery
                  ? `No jobs matched your search "${searchQuery}".`
                  : 'Create your first screening job with a job description and threshold to start parsing resumes.'}
              </p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Job Now
            </Button>
          </div>
        )}

        {/* Bento Jobs Grid with 3D Tilt */}
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
                  <TiltCard3D>
                    <div className="bento-card-interactive p-5 h-full flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {job.department && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                                {job.department}
                              </span>
                            )}
                            <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                              {job.title}
                            </h3>
                          </div>

                          <Badge variant="primary" size="sm">
                            Min {job.min_score_threshold.toFixed(1)}/10
                          </Badge>
                        </div>

                        {/* Description Preview */}
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>

                        {/* Must-have skills pills */}
                        {job.must_have_skills && job.must_have_skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {job.must_have_skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-950/80 text-slate-300 border border-slate-800"
                              >
                                <span className="w-1 h-1 rounded-full bg-indigo-400" />
                                {skill}
                              </span>
                            ))}
                            {job.must_have_skills.length > 3 && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-950/60 text-slate-400 border border-slate-800">
                                +{job.must_have_skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Bento Card Footer & Metric Tiles */}
                      <div className="pt-3 border-t border-slate-800/80 space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                            <span className="block font-bold text-white text-xs">
                              {stats.total_candidates}
                            </span>
                            <span className="text-[10px] text-slate-400">Total</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                            <span className="block font-bold text-indigo-400 text-xs">
                              {stats.scored_candidates}
                            </span>
                            <span className="text-[10px] text-slate-400">Scored</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                            <span className="block font-bold text-emerald-400 text-xs">
                              {stats.shortlisted_candidates}
                            </span>
                            <span className="text-[10px] text-slate-400">Shortlist</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span>Created {formatDate(job.created_at)}</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                            Open Hub <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </TiltCard3D>
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
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Job Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Department / Team (Optional)
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Core Platform"
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
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
                  className="w-28 px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-xs text-slate-400">
                  Default: 7.0/10. Candidates scoring at or above this threshold qualify for shortlist.
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Must-Have Skills (comma separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Python, FastAPI, React, PostgreSQL, Docker"
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Job Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste the complete job description, responsibilities, and qualifications..."
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
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
                leftIcon={<Plus className="w-3.5 h-3.5" />}
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
