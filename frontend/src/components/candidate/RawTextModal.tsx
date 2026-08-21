import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Copy, Check, Search } from 'lucide-react';
import { Button } from '../common/Button';

interface RawTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string | null;
  filename: string;
  rawText: string;
}

export const RawTextModal: React.FC<RawTextModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  filename,
  rawText,
}) => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = rawText.split('\n');
  const filteredLines = searchQuery
    ? lines.filter((l) => l.toLowerCase().includes(searchQuery.toLowerCase()))
    : lines;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Raw Extracted Text: ${candidateName || filename}`}
      subtitle={`Source file: ${filename} • Audit & Verification View`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search in extracted resume text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Copied' : 'Copy All'}
          </Button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
          {searchQuery && filteredLines.length === 0 ? (
            <p className="text-slate-500 italic">No matches found for "{searchQuery}".</p>
          ) : (
            filteredLines.join('\n')
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>
    </Modal>
  );
};
