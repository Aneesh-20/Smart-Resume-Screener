import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-white">404 - Page Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm">
        The screening job, candidate profile, or page you were looking for does not exist.
      </p>
      <Link to="/">
        <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Jobs Dashboard
        </Button>
      </Link>
    </div>
  );
};
