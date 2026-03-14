'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface FilterConfig {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface FilterBarProps {
  filters: FilterConfig[];
  searchPlaceholder?: string;
  searchKey?: string;
}

export default function FilterBar({ filters, searchPlaceholder = "Search...", searchKey = 'q' }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get(searchKey) || '');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        params.set(searchKey, searchTerm);
      } else {
        params.delete(searchKey);
      }
      
      if (params.get(searchKey) !== searchParams.get(searchKey) && (searchTerm || searchParams.has(searchKey))) {
        if (params.has('page')) params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, pathname, router, searchParams, searchKey]);

  useEffect(() => {
    setTimeout(() => setSearchTerm(searchParams.get(searchKey) || ''), 0);
  }, [searchParams, searchKey]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (params.has('page')) params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const activeFiltersCount = Array.from(searchParams.keys()).filter(k => k !== searchKey && k !== 'page').length;

  return (
    <div className="sticky top-0 z-10 bg-[var(--bg-base)]/80 backdrop-blur-md pt-4 pb-4 border-b border-[var(--border-subtle)] sm:border-none sm:py-0 sm:bg-transparent sm:backdrop-blur-none sm:mb-6 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* Search */}
        <div className="flex-1 w-full max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] pl-9 pr-4 py-2 text-[var(--text-primary)] text-sm outline-none transition-colors shadow-sm"
          />
        </div>
        
        {/* Desktop Filters */}
        <div className="hidden sm:flex items-center gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {filters.map((filter) => {
            const currentValue = searchParams.get(filter.key) || '';
            const isActive = !!currentValue;
            return (
              <div key={filter.key} className="relative shrink-0">
                <select 
                  value={currentValue}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className={`appearance-none bg-[var(--bg-elevated)] border cursor-pointer ${isActive ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)]'} hover:border-[var(--border-accent)] rounded-[var(--radius-md)] pl-4 pr-8 py-2 text-sm font-medium outline-none transition-colors shadow-sm`}
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value} className="text-[var(--text-primary)]">{opt.label}</option>
                  ))}
                </select>
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>
                  ▼
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Filter Button */}
        <button className="sm:hidden flex items-center justify-center gap-2 w-full bg-[var(--bg-elevated)] border border-[var(--border)] hover:bg-[var(--bg-hover)] rounded-[var(--radius-md)] py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
          Filter & Sort {activeFiltersCount > 0 && <span className="bg-[var(--accent)] text-[var(--text-on-accent)] rounded-full px-2 py-0.5 text-xs font-bold leading-none">{activeFiltersCount}</span>}
        </button>
      </div>

      {activeFiltersCount > 0 && (
        <div className="hidden sm:flex flex-wrap items-center gap-2 mt-4">
          <span className="text-xs text-[var(--text-muted)] mr-1 uppercase tracking-wider font-medium">Active:</span>
          {filters.map((filter) => {
            const val = searchParams.get(filter.key);
            if (!val) return null;
            const optLabel = filter.options.find(o => o.value === val)?.label || val;
            
            return (
              <button 
                key={filter.key}
                onClick={() => handleFilterChange(filter.key, '')}
                className="flex items-center gap-1.5 px-3 py-1 bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/30 rounded-[var(--radius-pill)] text-xs font-medium hover:bg-[var(--accent)] hover:text-[var(--text-on-accent)] transition-colors group"
                title={`Remove ${filter.label} filter`}
              >
                {optLabel}
                <X className="w-3 h-3 opacity-70 group-hover:opacity-100" />
              </button>
            );
          })}
          <button 
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              filters.forEach(f => params.delete(f.key));
              if (params.has('page')) params.set('page', '1');
              router.push(`${pathname}?${params.toString()}`);
            }}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors ml-2 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
