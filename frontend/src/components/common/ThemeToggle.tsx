import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black transition-all duration-150 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_currentColor] ${
        theme === 'light'
          ? 'bg-white hover:bg-amber-50 text-stone-900 border-[2.5px] border-black shadow-[3px_3px_0px_0px_#000000] hover:shadow-[4.5px_4.5px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5'
          : 'bg-stone-900 hover:bg-stone-800 text-amber-300 border-[2.5px] border-stone-200 shadow-[3px_3px_0px_0px_#ffffff] hover:shadow-[4.5px_4.5px_0px_0px_#ffffff] hover:-translate-x-0.5 hover:-translate-y-0.5'
      }`}
    >
      {theme === 'light' ? (
        <>
          <Moon className="w-3.5 h-3.5 text-stone-900 fill-stone-900" />
          <span>Dark</span>
        </>
      ) : (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          <span>Light</span>
        </>
      )}
    </button>
  );
};
