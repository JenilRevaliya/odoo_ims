'use client';

import { FileX2 } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--bg-base)]">
      <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mb-6 text-[var(--accent)] shadow-[var(--shadow-sm)]">
        <FileX2 className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-8">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
