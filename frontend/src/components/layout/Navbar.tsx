import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileSearch, Sparkles, Plus } from 'lucide-react';
import { ResponsibleNotice } from './ResponsibleNotice';

interface NavbarProps {
  onCreateJobClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCreateJobClick }) => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-brand-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  Smart Resume Screener
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-2.5 h-2.5" /> AI Assisted
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">Auditable Candidate Matching Engine</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-slate-900 text-white border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              Screening Jobs
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ResponsibleNotice compact />
          {onCreateJobClick && (
            <button
              onClick={onCreateJobClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-98 transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              <span>Create Job</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
