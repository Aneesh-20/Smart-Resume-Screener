import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { jobsApi, CreateJobInput } from '../api/jobs';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';
import {
  Briefcase, Plus, AlertCircle, ArrowLeft, Sparkles,
  Sliders, X, Target, Zap
} from 'lucide-react';

const PRESETS = [
  {
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    threshold: 7.5,
    skills: ['React', 'TypeScript', 'Node.js', 'FastAPI', 'PostgreSQL', 'Docker'],
    description: `We are looking for a Senior Full-Stack Engineer to architect and build scalable web applications.
Key Responsibilities:
- Design, build, and maintain efficient, reusable, and reliable front-end and back-end code.
- Collaborate with product managers and designers to implement intuitive user experiences.
- Optimize database queries and manage cloud infrastructure on AWS/GCP.
- Mentor junior engineers and participate in comprehensive code reviews.

Requirements:
- 5+ years of software development experience with React, TypeScript, and Python/Node.js.
- Strong knowledge of relational databases (PostgreSQL) and REST/GraphQL APIs.
- Experience with Docker, CI/CD pipelines, and cloud native architectures.`
  },
  {
    title: 'AI / Machine Learning Engineer',
    department: 'AI Research',
    threshold: 8.0,
    skills: ['Python', 'PyTorch', 'LangChain', 'FastAPI', 'LLM Fine-Tuning', 'Vector Databases'],
    description: `We are seeking an AI / ML Engineer to develop generative AI applications and candidate screening pipelines.
Key Responsibilities:
- Build, evaluate, and optimize LLM prompt engineering pipelines and retrieval-augmented generation (RAG) systems.
- Fine-tune and benchmark open-source and proprietary transformer models.
- Deploy robust, low-latency inference endpoints using FastAPI and Docker.
- Implement ethical AI guardrails, bias detection, and explainable scoring heuristics.

Requirements:
- 3+ years of applied machine learning experience with Python, PyTorch, and Hugging Face.
- Hands-on experience with LLM orchestration (LangChain / LlamaIndex) and vector databases (pgvector/Pinecone).
- Strong computer science foundation and problem-solving skills.`
  },
  {
    title: 'Senior DevOps / SRE Specialist',
    department: 'Infrastructure',
    threshold: 7.0,
    skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Docker', 'Prometheus'],
    description: `We are looking for an experienced DevOps / Site Reliability Engineer to drive infrastructure reliability and automation.
Key Responsibilities:
- Manage multi-cluster Kubernetes environments and automated GitOps deployment pipelines.
- Author infrastructure-as-code using Terraform and Ansible across AWS/GCP.
- Implement observability stacks (Prometheus, Grafana, OpenTelemetry) with automated alerting.
- Ensure strict security compliance, secrets management, and zero-downtime releases.

Requirements:
- 4+ years in DevOps/SRE roles managing production cloud infrastructure.
- Deep expertise in Kubernetes, Docker containerization, and Terraform.
- Proficiency in Linux systems administration, bash, and Python scripting.`
  },
  {
    title: 'Technical Product Manager',
    department: 'Product',
    threshold: 7.0,
    skills: ['Product Strategy', 'Agile / Scrum', 'LLM Evaluation', 'User Research', 'API Design'],
    description: `We are looking for a Technical Product Manager to lead our candidate intelligence and screening product suite.
Key Responsibilities:
- Define product roadmap, feature specifications, and success metrics for AI recruitment tooling.
- Work closely with engineering and AI research teams to translate technical capabilities into user value.
- Conduct user interviews with HR leaders and recruiters to identify workflow bottlenecks.
- Champion responsible AI governance, compliance, and user-centric design.

Requirements:
- 3+ years of product management experience for SaaS or AI-enabled developer tools.
- Strong technical literacy with ability to understand API architectures and data pipelines.
- Exceptional communication, stakeholder management, and analytical skills.`
  }
];

export const CreateJobPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [threshold, setThreshold] = useState<number>(7.0);
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkillInput, setCurrentSkillInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (newJob: CreateJobInput) => jobsApi.createJob(newJob),
    onSuccess: (createdJob) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      navigate(`/jobs/${createdJob.id}`);
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to create screening job');
    },
  });

  const handleAddSkill = () => {
    const trimmed = currentSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCurrentSkillInput('');
    }
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setTitle(preset.title);
    setDepartment(preset.department);
    setThreshold(preset.threshold);
    setSkills([...preset.skills]);
    setDescription(preset.description);
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.length < 2) {
      setFormError('Job title must be at least 2 characters.');
      return;
    }
    if (!description.trim() || description.length < 20) {
      setFormError('Job description must be at least 20 characters.');
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      department: department.trim() || undefined,
      description: description.trim(),
      min_score_threshold: threshold,
      must_have_skills: skills,
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-slate-950 mb-2 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center text-white">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Create Screening Job
              </h1>
              <p className="text-xs sm:text-sm font-bold text-slate-600">
                Configure role criteria, semantic skill prerequisites, and automated shortlist thresholds.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 1-Click Role Presets */}
      <div className="p-5 rounded-2xl bg-white border-[2.5px] border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#0284c7]" />
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Quick Start Role Presets (1-Click Fill)
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => applyPreset(preset)}
              className="p-3 text-left rounded-xl bg-slate-50 hover:bg-sky-50 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] hover:shadow-[3px_3px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all group cursor-pointer"
            >
              <div className="font-black text-xs text-slate-900 group-hover:text-[#0284c7] flex items-center justify-between">
                <span>{preset.title}</span>
                <Zap className="w-3 h-3 text-[#0284c7] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] font-bold text-slate-500 mt-1">
                {preset.skills.slice(0, 3).join(', ')}...
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && (
          <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-900 shadow-[2px_2px_0px_0px_#881337] flex items-start gap-3 text-rose-900 text-xs font-black animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold">Form Submission Error</p>
              <p className="font-medium text-rose-800">{formError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Core Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white border-[2.5px] border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] space-y-5">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b-2 border-slate-900 pb-3">
                <Briefcase className="w-4 h-4 text-[#0284c7]" />
                <span>Job Identity & Scope</span>
              </h2>

              {/* Title & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-900">
                    Job Title <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Machine Learning Engineer"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 bg-slate-50 text-slate-900 text-xs font-bold placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7] transition-all shadow-[2px_2px_0px_0px_#0f172a]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-900">
                    Department / Business Unit
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. AI Platforms & Engineering"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 bg-slate-50 text-slate-900 text-xs font-bold placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7] transition-all shadow-[2px_2px_0px_0px_#0f172a]"
                  />
                </div>
              </div>

              {/* Must-Have Skills Tag Manager */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-900 flex items-center justify-between">
                  <span>Must-Have Skills / Prerequisites</span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {skills.length} added
                  </span>
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentSkillInput}
                    onChange={(e) => setCurrentSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    placeholder="Type skill & press Enter or click Add (e.g. Python, Docker, PyTorch)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-slate-900 bg-slate-50 text-slate-900 text-xs font-bold placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7] transition-all shadow-[2px_2px_0px_0px_#0f172a]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] hover:shadow-[3px_3px_0px_0px_#0f172a] transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-100 border-2 border-slate-900 text-slate-950 text-xs font-black shadow-[1px_1px_0px_0px_#0f172a]"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] font-bold text-slate-500 italic">
                    Tip: Candidates missing must-have skills are flagged in screening gaps.
                  </p>
                )}
              </div>

              {/* Full Job Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-900">
                    Full Job Description & Role Expectations <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[11px] font-bold text-slate-500">
                    {description.length} characters
                  </span>
                </div>
                <textarea
                  required
                  rows={8}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Paste the complete role overview, responsibilities, technical qualifications, and team details here..."
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 bg-slate-50 text-slate-900 text-xs font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7] transition-all shadow-[2px_2px_0px_0px_#0f172a] leading-relaxed resize-y font-mono"
                />
              </div>
            </div>
          </div>

          {/* Right 1 Column: Pass Threshold & Live Preview */}
          <div className="space-y-6">
            {/* Threshold Configuration */}
            <div className="p-6 rounded-2xl bg-white border-[2.5px] border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] space-y-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b-2 border-slate-900 pb-3">
                <Sliders className="w-4 h-4 text-[#0284c7]" />
                <span>Shortlist Threshold</span>
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700">Minimum Fit Score:</span>
                  <span className="font-mono text-base font-black px-3 py-1 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]">
                    {threshold.toFixed(1)} / 10.0
                  </span>
                </div>

                <input
                  type="range"
                  min="5.0"
                  max="9.5"
                  step="0.5"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full accent-[#0284c7] cursor-pointer"
                />

                <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500">
                  <span>5.0 (Lenient)</span>
                  <span>7.0 (Standard)</span>
                  <span>9.0 (Strict)</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-900 text-[11px] font-bold text-slate-700 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-900">
                    <Target className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>Threshold Rule:</span>
                  </div>
                  <p className="text-slate-600">
                    Candidates scoring &ge; {threshold.toFixed(1)} are placed into the recommended Shortlist. Candidates below are flagged for Review or Rejection.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="p-5 rounded-2xl bg-white border-[2.5px] border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] space-y-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                Screening Workspace Preview
              </span>

              <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-slate-900">
                    {title.trim() || 'Untitled Screening Role'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-950 font-black text-[10px] border border-slate-900">
                    Active
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-600">
                  {department.trim() || 'General Department'}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-500">
                    Pass Cutoff:
                  </span>
                  <span className="font-mono font-black text-xs text-slate-900">
                    {threshold.toFixed(1)}/10
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="space-y-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={createMutation.isPending}
                className="w-full justify-center text-sm"
              >
                {createMutation.isPending ? (
                  <>
                    <Spinner size="sm" className="text-white" />
                    <span>Creating Screening Workspace...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 stroke-[3]" />
                    <span>Create Screening Job</span>
                  </>
                )}
              </Button>

              <Link
                to="/"
                className="block text-center text-xs font-black text-slate-600 hover:text-slate-950 transition-colors"
              >
                Cancel & Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
