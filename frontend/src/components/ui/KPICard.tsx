'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
      setTimeout(() => setDisplayValue(0), 0);
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

  const borderStyles = {
    healthy: 'border-[var(--border-subtle)] border-l-[3px] border-l-[var(--accent)] hover:border-l-[var(--border-accent)]',
    warning: 'border-[var(--status-warning)] bg-[var(--status-warning)]/5 border-l-[3px] border-l-[var(--status-warning)]',
    critical: 'border-[var(--status-danger)] border-l-[3px] border-l-[var(--status-danger)] bg-[var(--status-danger)]/5',
  };

  return (
    <button 
      onClick={onClick}
      disabled={!onClick}
      className={`w-full h-[120px] flex flex-col justify-between text-left bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] p-5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${borderStyles[status]} ${onClick ? 'cursor-pointer shadow-sm hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5' : 'cursor-default shadow-sm'}`}
      aria-label={`${label}: ${value}`}
    >
      <h3 className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-wider">{label}</h3>
      <div className="flex items-end justify-between mt-auto">
        <div className="text-3xl font-mono text-[var(--text-primary)] font-semibold tracking-tight">
          {displayValue.toLocaleString()}
        </div>
        
        {trend && (
          <div className={`flex items-center text-sm font-medium ${trend.isPositive ? 'text-[#3FB950]' : 'text-[#F85149]'}`}>
            {trend.isPositive ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </button>
  );
}
