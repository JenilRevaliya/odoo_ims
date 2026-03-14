'use client';

import { useDelayedLoading } from '@/hooks/useDelayedLoading';

interface LoadingSkeletonProps {
  variant?: 'kpi-card' | 'table-row' | 'product-card' | 'default';
  isLoading?: boolean;
  count?: number;
}

export default function LoadingSkeleton({ variant = 'default', isLoading = true, count = 1 }: LoadingSkeletonProps) {
  const show = useDelayedLoading(isLoading, 300);

  if (!show) return null;

  const shimmerClass = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.4s_infinite] before:bg-gradient-to-r before:from-transparent before:via-[var(--border-subtle)] before:to-transparent before:z-10";

  if (variant === 'kpi-card') {
    return (
      <div className={`w-full h-[120px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 flex flex-col justify-between ${shimmerClass}`}>
        <div className="w-24 h-4 bg-[var(--bg-hover)] rounded"></div>
        <div className="w-16 h-8 bg-[var(--bg-hover)] rounded mt-4"></div>
      </div>
    );
  }

  if (variant === 'table-row') {
    return (
      <div className="w-full space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`w-full h-12 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-sm flex items-center px-4 gap-4 ${shimmerClass}`}>
            <div className="w-20 h-4 bg-[var(--bg-hover)] rounded"></div>
            <div className="flex-1 h-4 bg-[var(--bg-hover)] rounded"></div>
            <div className="w-24 h-4 bg-[var(--bg-hover)] rounded hidden sm:block"></div>
            <div className="w-16 h-4 bg-[var(--bg-hover)] rounded hidden md:block"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'product-card') {
    return (
      <div className={`w-full h-[180px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-3 ${shimmerClass}`}>
        <div className="w-2/3 h-5 bg-[var(--bg-hover)] rounded"></div>
        <div className="w-1/3 h-4 bg-[var(--bg-hover)] rounded mt-2"></div>
        <div className="mt-auto w-full h-8 bg-[var(--bg-hover)] rounded"></div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full min-h-8 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] ${shimmerClass}`}></div>
  );
}
