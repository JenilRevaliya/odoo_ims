'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';

interface KPICardProps {
  label: string;
  value: number;
  trend?: { value: number; isPositive: boolean };
  status?: 'healthy' | 'warning' | 'critical';
  onClick?: () => void;
  isLoading?: boolean;
}

export default function KPICard({ label, value, trend, status = 'healthy', onClick, isLoading = false }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isLoading) return;
    
    // Counter animation 0 to value over 600ms
    const duration = 600;
    const steps = 30;
    const stepTime = duration / steps;
    const increment = value / steps;
    let current = 0;
    
    if (value === 0) {
      setTimeout(() => setDisplayValue(0), 10);
      return;
    }

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, isLoading]);

  if (isLoading) {
    return <LoadingSkeleton variant="kpi-card" isLoading={true} />;
  }

  // Define super premium colors per card status
  const cardThemes = {
    healthy: 'from-[var(--accent)]/10 via-transparent to-transparent group-hover:via-[var(--accent)]/5 border-[var(--border-subtle)] hover:border-[var(--accent)]/30',
    warning: 'from-[var(--status-warning)]/15 via-[var(--status-warning)]/5 to-transparent border-[var(--border-subtle)] hover:border-[var(--status-warning)]/40',
    critical: 'from-[var(--status-danger)]/20 via-[var(--status-danger)]/5 to-transparent border-[var(--status-danger)]/30 hover:border-[var(--status-danger)]/50',
  };

  const iconColors = {
    healthy: 'text-[var(--accent)]',
    warning: 'text-[var(--status-warning)] animate-pulse-amber',
    critical: 'text-[var(--status-danger)] animate-pulse',
  };

  return (
    <button 
      onClick={onClick}
      disabled={!onClick}
      className={`relative w-full h-[130px] flex flex-col justify-between text-left overflow-hidden bg-[var(--bg-elevated)]/80 backdrop-blur-xl border rounded-[var(--radius-lg)] p-5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] group ${cardThemes[status]} ${onClick ? 'cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] duration-300' : 'cursor-default shadow-sm'}`}
      aria-label={`${label}: ${value}`}
    >
      {/* Background radial glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-radial opacity-30 group-hover:opacity-50 blur-2xl transition-opacity pointer-events-none rounded-full translate-x-1/2 -translate-y-1/2 ${
        status === 'healthy' ? 'from-[var(--accent)]' : status === 'warning' ? 'from-[var(--status-warning)]' : 'from-[var(--status-danger)]'
      }`} />
      
      {/* Shimmer Effect overlay */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />

      <div className="flex justify-between items-start relative z-10 w-full">
        <h3 className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-widest drop-shadow-sm">{label}</h3>
        <Activity className={`w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity ${iconColors[status]}`} />
      </div>

      <div className="flex items-end justify-between mt-auto relative z-10">
        <div className="text-4xl font-mono text-[var(--text-primary)] font-medium tracking-tight filter drop-shadow hover:text-[var(--text-primary)] transition-colors">
          {displayValue.toLocaleString()}
        </div>
        
        {trend && (
          <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full backdrop-blur-md bg-white/5 border border-white/10 shadow-inner ${trend.isPositive ? 'text-[#3FB950]' : 'text-[#F85149]'}`}>
            {trend.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 stroke-[3]" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 stroke-[3]" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </button>
  );
}
