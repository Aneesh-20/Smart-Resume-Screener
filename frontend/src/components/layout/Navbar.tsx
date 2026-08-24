import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileSearch, Plus } from 'lucide-react';

interface NavbarProps {
  onCreateJobClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCreateJobClick }) => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="max-w-7xl mx-auto rounded-2xl bg-white border-[2.5px] border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] px-4 sm:px-6 h-16 flex items-center justify-between transition-all duration-200">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center text-white group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[3px_3px_0px_0px_#0f172a] transition-all">
              <FileSearch className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-base tracking-tight text-slate-900 group-hover:text-[#0284c7] transition-colors">
                Smart Resume Screener
              </span>
              <p className="text-[11px] font-bold text-slate-500 -mt-0.5">Auditable Candidate Intelligence Engine</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2 pl-5 border-l-2 border-slate-900">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border-2 border-slate-900 ${
                location.pathname === '/'
                  ? 'bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] text-white shadow-[2px_2px_0px_0px_#0f172a]'
                  : 'bg-white text-slate-800 hover:bg-sky-50 shadow-none hover:shadow-[2px_2px_0px_0px_#0f172a]'
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
              className="inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-black rounded-2xl bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white border-[2.5px] border-slate-900 shadow-[3.5px_3.5px_0px_0px_#0f172a] hover:shadow-[5.5px_5.5px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#0f172a] transition-all duration-150 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Job</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
