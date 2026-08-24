import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileSearch, Plus } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

interface NavbarProps {
  onCreateJobClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCreateJobClick }) => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="max-w-7xl mx-auto rounded-2xl bg-white dark:bg-stone-900 border-[2.5px] border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#000000] px-4 sm:px-6 h-16 flex items-center justify-between transition-all duration-200">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#ff0844] via-[#ff2a54] via-60% to-[#ff7300] border-2 border-black shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center text-white group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[3px_3px_0px_0px_#000000] transition-all">
              <FileSearch className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-base tracking-tight text-stone-900 dark:text-white group-hover:text-[#ff0844] transition-colors">
                Smart Resume Screener
              </span>
              <p className="text-[11px] font-bold text-stone-500 dark:text-stone-400 -mt-0.5">Auditable Candidate Intelligence Engine</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2 pl-5 border-l-2 border-black dark:border-stone-700">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border-2 border-black dark:border-stone-700 ${
                location.pathname === '/'
                  ? 'bg-gradient-to-r from-[#ff0844] via-[#ff2a54] via-60% to-[#ff7300] text-white shadow-[2px_2px_0px_0px_#000000]'
                  : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 shadow-none hover:shadow-[2px_2px_0px_0px_#000000]'
              }`}
            >
              Screening Jobs
            </Link>
          </nav>
        </div>

        {/* Right Side Top Corner Controls */}
        <div className="flex items-center gap-2.5">
          {/* Light / Dark Mode Toggle Switch */}
          <ThemeToggle />

          {onCreateJobClick && (
            <button
              onClick={onCreateJobClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-2xl bg-gradient-to-r from-[#ff0844] via-[#ff2a54] via-60% to-[#ff7300] hover:from-[#e50039] hover:to-[#ea580c] text-white border-[2.5px] border-black shadow-[3.5px_3.5px_0px_0px_#000000] hover:shadow-[5px_5px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000] transition-all duration-150 cursor-pointer"
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
