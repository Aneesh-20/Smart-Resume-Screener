import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CandidateDetail } from '../../types';
import { candidatesApi } from '../../api/candidates';
import { AlertCircle, Save, Sparkles } from 'lucide-react';

interface CorrectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateDetail;
  onSaved: () => void;
}

export const CorrectionsModal: React.FC<CorrectionsModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onSaved,
}) => {
  const [candidateName, setCandidateName] = useState(candidate.candidate_name || '');
  const [email, setEmail] = useState(candidate.email || '');
  const [phone, setPhone] = useState(candidate.phone || '');
  const [location, setLocation] = useState(candidate.location || '');
  const [totalYears, setTotalYears] = useState<string>(
    candidate.total_experience_years !== null && candidate.total_experience_years !== undefined
      ? candidate.total_experience_years.toString()
      : ''
  );
  const [summary, setSummary] = useState(candidate.summary || '');
  const [skillsText, setSkillsText] = useState(
    candidate.skills.map((s) => s.normalized_name).join(', ')
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (andRescore = false) => {
    setIsLoading(true);
    setError(null);

    const skillsArray = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => ({
        name: s,
        normalized_name: s,
        category: 'technical' as const,
        evidence: 'Manually verified by recruiter',
      }));

    try {
      await candidatesApi.updateCorrections(candidate.id, {
        candidate_name: candidateName || undefined,
        email: email || undefined,
        phone: phone || undefined,
        location: location || undefined,
        total_experience_years: totalYears ? parseFloat(totalYears) : null,
        summary: summary || undefined,
        skills: skillsArray,
      });

      if (andRescore) {
        await candidatesApi.rescore(candidate.id);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save corrections');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recruiter Manual Corrections"
      subtitle="Modify or verify extracted facts before scoring. Human edits override parsed fields."
      maxWidth="xl"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800">Candidate Name</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full px-3 py-2 glass-input rounded-xl text-xs"
              placeholder="e.g. Alice Chen"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800">Total Experience (Years)</label>
            <input
              type="number"
              step="0.5"
              value={totalYears}
              onChange={(e) => setTotalYears(e.target.value)}
              className="w-full px-3 py-2 glass-input rounded-xl text-xs font-mono"
              placeholder="e.g. 5.5"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 glass-input rounded-xl text-xs"
              placeholder="candidate@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 glass-input rounded-xl text-xs"
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-bold text-stone-800">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 glass-input rounded-xl text-xs"
              placeholder="City, State"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-stone-800">
            Skills (comma separated)
          </label>
          <input
            type="text"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            className="w-full px-3 py-2 glass-input rounded-xl text-xs"
            placeholder="Python, React, TypeScript, PostgreSQL"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-stone-800">Summary / Notes</label>
          <textarea
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full px-3 py-2 glass-input rounded-xl text-xs"
            placeholder="Candidate professional summary or recruiter notes..."
          />
        </div>

        <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSave(false)}
              isLoading={isLoading}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Corrections
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSave(true)}
              isLoading={isLoading}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Save & Re-Score
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
