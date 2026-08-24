import React, { useState, useEffect } from 'react';
import { FileSearch, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 2000,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    // Start fade out slightly before completion
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, durationMs - 400);

    // Completely unmount splash after duration
    const finishTimer = setTimeout(() => {
      setIsMounted(false);
      if (onFinish) onFinish();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#faf7f5] transition-all duration-400 select-none ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(255, 8, 68, 0.18) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(255, 115, 0, 0.18) 0px, transparent 45%),
          radial-gradient(at 50% 50%, rgba(254, 243, 199, 0.3) 0px, transparent 60%),
          radial-gradient(at 0% 100%, rgba(255, 107, 0, 0.15) 0px, transparent 50%)
        `,
      }}
    >
      {/* Centered Brutalist Splash Card */}
      <div className="relative p-8 sm:p-10 rounded-3xl bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000000] max-w-md w-[90%] flex flex-col items-center text-center space-y-6 animate-in zoom-in-90 duration-300">
        
        {/* Glowing Ambient Halo */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-[#ff0844]/20 to-[#ff7300]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Logo Badge matching the user's icon */}
        <div className="relative group">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-r from-[#ff0844] via-[#ff2a54] via-60% to-[#ff7300] border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105">
            <FileSearch className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[2.5]" />
          </div>

          <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-[#ff0844]">
            <Sparkles className="w-4 h-4 animate-spin" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight">
            Smart Resume Screener
          </h1>
          <p className="text-xs sm:text-sm font-bold text-stone-600">
            Auditable Candidate Intelligence Engine
          </p>
        </div>

        {/* 2-Second Animated Progress Bar */}
        <div className="w-full max-w-xs space-y-2 pt-2">
          <div className="h-3 w-full rounded-full bg-stone-100 border-2 border-black overflow-hidden shadow-[2px_2px_0px_0px_#000000] p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ff0844] via-[#ff2a54] via-60% to-[#ff7300]"
              style={{
                animation: `splashProgress ${durationMs}ms cubic-bezier(0.1, 0.7, 0.1, 1) forwards`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-black text-stone-500 uppercase tracking-wider px-1">
            <span className="text-[#ff0844]">Loading Workspace</span>
            <span className="font-mono">2.0s</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes splashProgress {
          0% { width: 0%; }
          30% { width: 45%; }
          70% { width: 85%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};
