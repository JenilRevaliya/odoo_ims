'use client';

import { useEffect } from 'react';
import { useToastStore } from '@/store/toast';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    const timers = toasts.map((t) => {
      return setTimeout(() => removeToast(t.id), 4000);
    });
    return () => timers.forEach(clearTimeout);
  }, [toasts, removeToast]);

  const ICONS = {
    success: <CheckCircle2 className="w-5 h-5 text-[#3FB950]" />,
    error: <XCircle className="w-5 h-5 text-[#F85149]" />,
    warning: <AlertTriangle className="w-5 h-5 text-[var(--status-warning)]" />,
    info: <Info className="w-5 h-5 text-[var(--status-info)]" />,
  };

  const BORDERS = {
    success: 'border-l-[#3FB950]',
    error: 'border-l-[#F85149]',
    warning: 'border-l-[var(--status-warning)]',
    info: 'border-l-[var(--status-info)]',
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 md:px-0 pointer-events-none">
      {toasts.map((t) => (
        <div 
          key={t.id}
          className={`pointer-events-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] border-l-4 ${BORDERS[t.variant]} rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-lg)] flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300`}
        >
          <div className="shrink-0 mt-0.5">{ICONS[t.variant]}</div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[var(--text-primary)] text-sm font-medium leading-tight">{t.title}</h4>
            {t.description && (
              <p className="text-[var(--text-secondary)] text-sm mt-1">{t.description}</p>
            )}
          </div>
          <button 
            onClick={() => removeToast(t.id)}
            className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 -mr-2 -mt-2 outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
