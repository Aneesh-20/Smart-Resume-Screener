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
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-2">
      <div className="max-w-7xl mx-auto rounded-2xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-glass-md px-4 sm:px-6 h-16 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-[1px] shadow-glow-violet group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-[11px] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center text-white">
                <FileSearch className="w-5 h-5 text-cyan-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-purple-200 group-hover:to-cyan-200 transition-all">
                  Smart Resume Screener
                </span>
                <span className="glass-badge-violet text-[10px]">
                  <Sparkles className="w-2.5 h-2.5 text-purple-300" /> AI 3D
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">Auditable Candidate Intelligence Engine</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5 pl-5 border-l border-white/10">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/'
                  ? 'bg-white/10 text-white border border-white/15 shadow-glass-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              Screening Jobs
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ResponsibleNotice compact />
          {onCreateJobClick && (
            <button
              onClick={onCreateJobClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-glow-violet active:scale-98 transition-all duration-200 border border-white/20"
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
