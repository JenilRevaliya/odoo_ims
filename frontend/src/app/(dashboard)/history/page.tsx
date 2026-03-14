'use client';

import { useState } from 'react';
import DataTable from '@/components/ui/DataTable';

const MOCK_DATA = [
  { id: '1', date: '2026-03-14 09:00', type: 'Receipt', product: 'Steel Rod', location: 'Whse A / Rack B', delta: 50, balance: 150 },
  { id: '2', date: '2026-03-14 08:12', type: 'Delivery', product: 'Steel Rod', location: 'Whse A', delta: -20, balance: 100 },
];

export default function HistoryPage() {
  const [search, setSearch] = useState('');

  const renderDelta = (row: typeof MOCK_DATA[0]) => (
    <span className={`font-mono font-medium ${row.delta > 0 ? 'text-[#3FB950]' : 'text-[#F85149]'}`}>
      {row.delta > 0 ? `+${row.delta}` : row.delta}
    </span>
  );

  const columns = [
    { header: 'Date', accessor: 'date' as const, className: 'text-[var(--text-secondary)] whitespace-nowrap' },
    { header: 'Type', accessor: 'type' as const },
    { header: 'Product', accessor: 'product' as const, className: 'font-medium' },
    { header: 'Location', accessor: 'location' as const, className: 'hidden md:table-cell text-[var(--text-secondary)]' },
    { header: 'Delta', accessor: renderDelta },
    { header: 'Balance', accessor: 'balance' as const, className: 'font-mono text-right hidden sm:table-cell text-[var(--text-muted)]' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[var(--text-lg)] text-[var(--text-primary)] font-medium font-mono uppercase tracking-wider">Move History</h2>
      </div>

      <div className="flex gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Filter by product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm bg-[var(--bg-elevated)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-4 py-2 text-[var(--text-primary)] text-sm outline-none transition-colors"
        />
      </div>

      <DataTable
        data={MOCK_DATA}
        columns={columns}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}
