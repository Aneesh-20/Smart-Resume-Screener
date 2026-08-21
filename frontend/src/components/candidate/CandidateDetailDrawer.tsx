import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Edit3, FileText, Sparkles, Trash2, AlertTriangle, Cpu } from 'lucide-react';
import { CandidateDetail } from '../../types';
import { ScoreBadge } from '../common/ScoreBadge';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { SkillsTagList } from './SkillsTagList';
import { ExperienceTimeline } from './ExperienceTimeline';
import { ScoreBreakdownBars } from '../screening/ScoreBreakdownBars';
import { RequirementEvidenceList } from '../screening/RequirementEvidenceList';
import { getRecommendationBadge, getStatusBadge } from '../../utils/scoreColors';
import { CorrectionsModal } from './CorrectionsModal';
import { RawTextModal } from './RawTextModal';
import { candidatesApi } from '../../api/candidates';

interface CandidateDetailDrawerProps {
  candidate: CandidateDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onCandidateUpdated: () => void;
  onCandidateDeleted: () => void;
}

export const CandidateDetailDrawer: React.FC<CandidateDetailDrawerProps> = ({
  candidate,
  isOpen,
  onClose,
  onCandidateUpdated,
  onCandidateDeleted,
}) => {
  const [activeTab, setActiveTab] = useState<'assessment' | 'profile' | 'evidence'>('assessment');
  const [isCorrectionsOpen, setIsCorrectionsOpen] = useState(false);
  const [isRawTextOpen, setIsRawTextOpen] = useState(false);
  const [isRescoring, setIsRescoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !candidate) return null;

  const assessment = candidate.latest_assessment;
  const statusBadge = getStatusBadge(candidate.status);
  const recBadge = assessment ? getRecommendationBadge(assessment.recommendation) : null;

  const handleRescore = async () => {
    setIsRescoring(true);
    try {
      await candidatesApi.rescore(candidate.id);
      onCandidateUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to rescore candidate');
    } finally {
      setIsRescoring(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${candidate.candidate_name || candidate.original_filename}? This will purge the stored resume and database records.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await candidatesApi.deleteCandidate(candidate.id);
      onCandidateDeleted();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to delete candidate');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/70 backdrop-blur-md space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {candidate.candidate_name || 'Anonymous Candidate'}
                    </h2>
                    <Badge variant={statusBadge.color.includes('emerald') ? 'success' : 'default'} size="sm" dot>
                      {statusBadge.label}
                    </Badge>
                    {recBadge && (
                      <Badge variant={assessment?.recommendation === 'shortlist' ? 'success' : assessment?.recommendation === 'review' ? 'warning' : 'danger'} size="sm">
                        {recBadge.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Source: {candidate.original_filename}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Contact and Metadata Bento Strip */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                {candidate.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{candidate.email}</span>
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{candidate.phone}</span>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{candidate.location}</span>
                  </div>
                )}
                {candidate.total_experience_years && (
                  <div className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                    ~{candidate.total_experience_years.toFixed(1)} yrs exp
                  </div>
                )}
              </div>

              {/* Quick Actions Bar */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCorrectionsOpen(true)}
                  leftIcon={<Edit3 className="w-3.5 h-3.5 text-indigo-400" />}
                >
                  Recruiter Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRawTextOpen(true)}
                  leftIcon={<FileText className="w-3.5 h-3.5 text-slate-400" />}
                >
                  Raw Text
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRescore}
                  isLoading={isRescoring}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                >
                  Rescore
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  isLoading={isDeleting}
                  className="text-rose-400 hover:text-rose-300 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Tabs Navigation */}
              <div className="flex items-center gap-2 border-b border-slate-800 -mb-6 pt-2">
                <button
                  onClick={() => setActiveTab('assessment')}
                  className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'assessment'
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Match Assessment
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'profile'
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Extracted Profile & Skills
                </button>
                <button
                  onClick={() => setActiveTab('evidence')}
                  className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'evidence'
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Evidence & Gaps
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {candidate.parse_warnings && candidate.parse_warnings.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Parsing Warnings</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-amber-300/80">
                    {candidate.parse_warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tab 1: Assessment Bento Grid */}
              {activeTab === 'assessment' && (
                <div className="space-y-5">
                  {assessment ? (
                    <>
                      {/* Bento Tile: Fit Score & Rationale */}
                      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                              Semantic Fit Score
                            </span>
                            <ScoreBadge score={assessment.fit_score} size="lg" />
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                              Confidence
                            </span>
                            <Badge variant={assessment.confidence === 'high' ? 'success' : 'warning'} size="md">
                              {assessment.confidence} confidence
                            </Badge>
                          </div>
                        </div>

                        {assessment.is_fallback && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                            <Cpu className="w-3.5 h-3.5" />
                            <span>Fallback - semantic LLM score unavailable</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-800/80">
                          <span className="text-xs font-semibold text-slate-300 block mb-1">
                            Summary Justification:
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {assessment.summary_justification}
                          </p>
                        </div>
                      </div>

                      {/* Bento Tile: 4 Components Score Breakdown */}
                      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Score Breakdown Components (10.0 Scale)
                        </h3>
                        <ScoreBreakdownBars breakdown={assessment.score_breakdown} />
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <Sparkles className="w-8 h-8 mx-auto text-slate-500" />
                      <p className="text-sm text-slate-300 font-medium">Candidate has not been scored yet.</p>
                      <Button size="sm" onClick={handleRescore} isLoading={isRescoring}>
                        Score Candidate Now
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Extracted Profile Bento */}
              {activeTab === 'profile' && (
                <div className="space-y-5">
                  {/* Summary */}
                  {candidate.summary && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Professional Summary
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                        {candidate.summary}
                      </p>
                    </div>
                  )}

                  {/* Skills Bento Tile */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Normalized Skills ({candidate.skills.length})
                    </h4>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <SkillsTagList skills={candidate.skills} showCategory />
                    </div>
                  </div>

                  {/* Experience Timeline */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Work Experience Timeline
                    </h4>
                    <ExperienceTimeline entries={candidate.experience_entries} />
                  </div>

                  {/* Education & Certs */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Education & Certifications
                    </h4>
                    <div className="space-y-2">
                      {candidate.education_entries.map((edu, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                          <span className="font-semibold text-white block">{edu.degree} in {edu.field_of_study}</span>
                          <span className="text-slate-400">{edu.institution} • {edu.end_year || 'Year N/A'}</span>
                        </div>
                      ))}
                      {candidate.certifications.map((cert, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                          <span className="font-semibold text-white block">Cert: {cert.name}</span>
                          <span className="text-slate-400">{cert.issuer || ''} ({cert.year || 'N/A'})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Evidence & Gaps Bento */}
              {activeTab === 'evidence' && (
                <div>
                  {assessment ? (
                    <RequirementEvidenceList
                      matchedRequirements={assessment.matched_requirements}
                      gaps={assessment.gaps}
                      uncertainties={assessment.uncertainties}
                      followUpQuestions={assessment.follow_up_questions}
                    />
                  ) : (
                    <p className="text-xs text-slate-500 italic text-center py-8">
                      Evidence matching available once candidate is scored.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Corrections Modal */}
      {isCorrectionsOpen && (
        <CorrectionsModal
          isOpen={isCorrectionsOpen}
          onClose={() => setIsCorrectionsOpen(false)}
          candidate={candidate}
          onSaved={onCandidateUpdated}
        />
      )}

      {/* Raw Text Modal */}
      {isRawTextOpen && (
        <RawTextModal
          isOpen={isRawTextOpen}
          onClose={() => setIsRawTextOpen(false)}
          candidateName={candidate.candidate_name}
          filename={candidate.original_filename}
          rawText={candidate.raw_text}
        />
      )}
    </>
  );
};
