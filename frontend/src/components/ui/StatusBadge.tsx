import React from 'react';

type StatusType = 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';
type ColorType = 'green' | 'amber' | 'blue' | 'red' | 'gray';

interface StatusBadgeProps {
  status?: StatusType;
  label?: string;
  colorPreset?: ColorType;
  icon?: React.ReactNode;
}

const statusMap: Record<StatusType, { bg: string, text: string, dot: string, defaultIcon?: React.ReactNode, label: string }> = {
  draft: { bg: 'bg-[var(--status-draft)]/20', text: 'text-[var(--text-primary)]', dot: 'bg-[var(--text-muted)]', label: 'Draft' },
  waiting: { bg: 'bg-[var(--status-waiting)]/20', text: 'text-[var(--accent)]', dot: 'bg-[var(--accent)]', label: 'Waiting' },
  ready: { bg: 'bg-[var(--status-info)]/20', text: 'text-[#58A6FF]', dot: 'bg-[#58A6FF]', label: 'Ready' },
  done: { bg: 'bg-[var(--status-done)]/20', text: 'text-[#3FB950]', dot: 'bg-[#3FB950]', label: 'Done' },
  canceled: { bg: 'bg-[var(--status-danger)]/20', text: 'text-[#F85149]', dot: 'bg-[#F85149]', label: 'Canceled' }
};

const customMap: Record<ColorType, { bg: string, text: string, dot: string }> = {
  gray: { bg: 'bg-[var(--status-draft)]/20', text: 'text-[var(--text-primary)]', dot: 'bg-[var(--text-muted)]' },
  amber: { bg: 'bg-[var(--status-waiting)]/20', text: 'text-[var(--accent)]', dot: 'bg-[var(--accent)]' },
  blue: { bg: 'bg-[var(--status-info)]/20', text: 'text-[#58A6FF]', dot: 'bg-[#58A6FF]' },
  green: { bg: 'bg-[var(--status-done)]/20', text: 'text-[#3FB950]', dot: 'bg-[#3FB950]' },
  red: { bg: 'bg-[var(--status-danger)]/20', text: 'text-[#F85149]', dot: 'bg-[#F85149]' }
};

export default function StatusBadge({ status, label, colorPreset, icon }: StatusBadgeProps) {
  const config = status ? statusMap[status] : customMap[colorPreset || 'gray'];
  const textLabel = label || (status ? statusMap[status].label : 'Unknown');

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-pill)] text-[11px] font-medium uppercase tracking-wider ${config.bg} ${config.text} transition-colors`}>
      {icon ? (
        <span className="shrink-0">{icon}</span>
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      )}
      {textLabel}
    </span>
  );
}
