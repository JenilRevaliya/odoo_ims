'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';

const MOCK_DATA = [
  { id: '1', ref: 'REC-2026-001', type: 'Receipt', status: 'done', lines: 3, date: '09:00', user: 'Ravi S' },
  { id: '2', ref: 'DEL-2026-004', type: 'Delivery', status: 'waiting', lines: 2, date: '08:12', user: 'Admin' },
];

export default function OperationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const renderStatus = (row: typeof MOCK_DATA[0]) => (
    <StatusBadge status={row.status as any} />
  );

  const columns = [
    { header: 'Ref #', accessor: 'ref' as const, className: 'font-mono text-[var(--accent)] font-medium' },
    { header: 'Type', accessor: 'type' as const },
    { header: 'Status', accessor: renderStatus },
    { header: 'Lines', accessor: 'lines' as const, className: 'hidden sm:table-cell text-[var(--text-secondary)] text-center' },
    { header: 'Date', accessor: 'date' as const, className: 'text-[var(--text-secondary)] hidden md:table-cell' },
    { header: 'User', accessor: 'user' as const, className: 'text-[var(--text-muted)] hidden lg:table-cell' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input 
            type="text" 
            placeholder="Search reference numbers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] pl-9 pr-4 py-2 text-[var(--text-primary)] text-sm outline-none transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar pb-2 sm:pb-0">
          {['All', 'Receipts', 'Deliveries', 'Transfers', 'Adjustments'].map(t => (
            <button key={t} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-[var(--radius-pill)] whitespace-nowrap">
              {t}
            </button>
          ))}
          <div className="w-px h-6 bg-[var(--border-subtle)] mx-2 hidden sm:block"></div>
          <button 
            onClick={() => router.push('/operations/new')}
            className="shrink-0 flex items-center justify-center gap-2 bg-[var(--accent)] text-[var(--text-on-accent)] hover:bg-[var(--accent-glow)] rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition-colors ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Operation</span>
          </button>
        </div>
      </div>

      <DataTable
        data={MOCK_DATA}
        columns={columns}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => router.push(`/operations/${row.id}`)}
      />
    </div>
  );
}
