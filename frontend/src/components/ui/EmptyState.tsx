'use client';

import { LucideIcon, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="w-16 h-16 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl flex items-center justify-center mb-6 shadow-[var(--shadow-sm)]">
        <Icon className="w-8 h-8 text-[var(--text-muted)]" />
      </div>
      
      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-[var(--text-secondary)] max-w-[320px] mb-8 leading-relaxed">
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-[var(--text-on-accent)] font-medium rounded-[var(--radius-md)] hover:bg-[var(--accent-glow)] transition-all shadow-[var(--shadow-sm)]"
        >
          <Plus className="w-4 h-4" />
          {action.label}
        </button>
      )}
    </div>
  );
}
