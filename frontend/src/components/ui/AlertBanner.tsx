import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface AlertBannerProps {
  message: React.ReactNode;
  dismissible?: boolean;
}

export default function AlertBanner({ message, dismissible = true }: AlertBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="flex items-start bg-[var(--accent-subtle)] border border-[var(--border-subtle)] border-l-[3px] border-l-[var(--accent)] rounded-[var(--radius-sm)] px-4 py-3 shadow-[var(--shadow-sm)] animate-in fade-in slide-in-from-top-2">
      <AlertCircle className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
      <div className="ml-3 flex-1 text-sm text-[var(--text-primary)] leading-snug">
        {message}
      </div>
      {dismissible && (
        <button
          onClick={() => setVisible(false)}
          className="ml-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--accent-subtle)] rounded-[var(--radius-sm)]"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
