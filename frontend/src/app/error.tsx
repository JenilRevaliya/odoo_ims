'use client';

import { useEffect } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70dvh] flex flex-col items-center justify-center text-center px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative mb-6">
        <div className="relative w-24 h-24 bg-[var(--status-danger)]/10 border border-[var(--status-danger)]/20 rounded-2xl flex items-center justify-center shadow-[var(--shadow-md)]">
          <AlertTriangle className="w-10 h-10 text-[var(--status-danger)]" />
        </div>
      </div>

      <h1 className="text-3xl font-semibold text-[var(--text-primary)] tracking-tight mb-3">
        Something went wrong
      </h1>
      <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-8 leading-relaxed">
        An unexpected error occurred. We've been notified and are working on it.
        {error.digest && <span className="block mt-2 font-mono text-xs opacity-50 uppercase tracking-widest">Error ID: {error.digest}</span>}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => reset()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--text-primary)] text-[var(--bg-base)] font-medium rounded-[var(--radius-md)] hover:opacity-90 transition-all shadow-[var(--shadow-sm)]"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        <Link 
          href="/dashboard"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium rounded-[var(--radius-md)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-all"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
