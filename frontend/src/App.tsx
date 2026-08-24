import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/layout/Navbar';
import { SplashScreen } from './components/layout/SplashScreen';
import { JobsListPage } from './pages/JobsListPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { CreateJobPage } from './pages/CreateJobPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { InteractiveBackground3D } from './components/3d/InteractiveBackground3D';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* 2-Second Animated Entrance Splash Screen */}
        <SplashScreen durationMs={2000} />

        <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-[#0284c7] selection:text-white relative overflow-x-hidden font-sans">
          {/* Interactive 3D Ambient Constellation Background */}
          <InteractiveBackground3D />

          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
            <Routes>
              {/* Dashboard Route */}
              <Route path="/" element={<JobsListPage />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />

              {/* Create Screening Job Dedicated Route */}
              <Route path="/create-job" element={<CreateJobPage />} />

              {/* Individual Job Workspace Route */}
              <Route path="/jobs/:jobId" element={<JobDetailPage />} />

              {/* Catch-all Not Found Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <footer className="border-t-2 border-slate-900 py-6 text-center text-xs text-slate-600 relative z-10 bg-white">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 font-bold">
              <p className="text-slate-900">Smart Resume Screener • Explainable AI Candidate Intelligence</p>
              <p className="text-[11px] text-slate-500">
                Notice: Recruiter decision-support system. Final hiring determinations require human authorization.
              </p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
