import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { jobsApi, CreateJobInput } from '../api/jobs';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Spinner } from '../components/common/Spinner';
import { formatDate } from '../utils/formatters';
import { Briefcase, Plus, AlertCircle, ArrowRight, Search } from 'lucide-react';

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

  const filteredJobs = jobs?.filter((job) => {
    const q = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      (job.department && job.department.toLowerCase().includes(q)) ||
      job.must_have_skills.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Screening Jobs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create screening workflows, upload candidate resumes, and evaluate candidates with explainable AI scoring.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Screening Job
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by job title, department, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Spinner size="lg" className="text-indigo-500" />
          <p className="text-xs text-slate-400 font-medium">Loading screening jobs...</p>
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
        <Card padding="lg" className="text-center py-16 space-y-4">
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
        </Card>
      )}

      {/* Jobs Grid */}
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
                <Card
                  variant="interactive"
                  padding="md"
                  className="h-full flex flex-col justify-between space-y-4 group-hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {job.department && (
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 block mb-1">
                            {job.department}
                          </span>
                        )}
                        <h2 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {job.title}
                        </h2>
                      </div>

                      <Badge variant="primary" size="sm">
                        Min {job.min_score_threshold.toFixed(1)}/10
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Must-have skills tags */}
                    {job.must_have_skills && job.must_have_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {job.must_have_skills.slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} variant="default" size="sm">
                            {skill}
                          </Badge>
                        ))}
                        {job.must_have_skills.length > 3 && (
                          <Badge variant="default" size="sm">
                            +{job.must_have_skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stats Footer */}
                  <div className="pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span className="block font-bold text-white text-sm">
                          {stats.total_candidates}
                        </span>
                        <span className="text-[10px] text-slate-400">Candidates</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span className="block font-bold text-indigo-400 text-sm">
                          {stats.scored_candidates}
                        </span>
                        <span className="text-[10px] text-slate-400">Scored</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span className="block font-bold text-emerald-400 text-sm">
                          {stats.shortlisted_candidates}
                        </span>
                        <span className="text-[10px] text-slate-400">Shortlisted</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Created {formatDate(job.created_at)}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                        Open Workspace <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Job Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Screening Job"
          subtitle="Define the job requirements and fit threshold for candidate matching."
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
                  Default: 7.0/10. Candidates scoring above this qualify for shortlist.
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
                placeholder="Paste the full job requirements, responsibilities, and qualifications..."
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
                Create Job
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
