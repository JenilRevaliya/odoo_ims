'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70dvh] flex flex-col items-center justify-center text-center px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative mb-6">
        <div className="absolute inset-0 blur-3xl bg-[var(--accent)]/10 rounded-full" />
        <div className="relative w-24 h-24 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl flex items-center justify-center shadow-[var(--shadow-lg)]">
          <Search className="w-10 h-10 text-[var(--accent)]" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[var(--status-danger)] text-white rounded-full flex items-center justify-center font-bold text-xs border-2 border-[var(--bg-base)]">
          404
        </div>
      </div>

      <h1 className="text-3xl font-semibold text-[var(--text-primary)] tracking-tight mb-3">
        Page Not Found
      </h1>
      <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-8 leading-relaxed">
        The resource you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link 
          href="/dashboard"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--accent)] text-[var(--text-on-accent)] font-medium rounded-[var(--radius-md)] hover:bg-[var(--accent-glow)] transition-all shadow-[var(--shadow-sm)]"
        >
          <Home className="w-4 h-4" />
          Dashboard
        </Link>
        <button 
          onClick={() => window.history.back()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium rounded-[var(--radius-md)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  );
}
