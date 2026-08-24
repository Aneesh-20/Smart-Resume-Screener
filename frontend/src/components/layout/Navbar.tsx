import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileSearch, Plus } from 'lucide-react';

interface NavbarProps {
  onCreateJobClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCreateJobClick }) => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-2">
      <div className="max-w-7xl mx-auto rounded-2xl bg-white/80 backdrop-blur-2xl border border-stone-200/90 shadow-glass-md px-4 sm:px-6 h-16 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-rose-600 to-amber-600 p-[1px] shadow-sm shadow-rose-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-[11px] bg-white flex items-center justify-center">
                <FileSearch className="w-5 h-5 text-rose-600" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-stone-900 group-hover:text-rose-600 transition-colors">
                Smart Resume Screener
              </span>
              <p className="text-[11px] text-stone-500 -mt-0.5">Auditable Candidate Intelligence Engine</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5 pl-5 border-l border-stone-200">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                location.pathname === '/'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
              }`}
            >
              Screening Jobs
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {onCreateJobClick && (
            <button
              onClick={onCreateJobClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white shadow-md shadow-rose-500/20 active:scale-98 transition-all duration-200 border border-rose-400/30"
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
