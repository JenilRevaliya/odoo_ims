'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings2, MapPin, Building, ShieldCheck } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';

const MOCK_WAREHOUSES = [
  { id: '1', name: 'Main Distribution Center', code: 'MAIN_DC', locations: 120, status: 'Active' },
  { id: '2', name: 'Overflow Storage', code: 'OVR_STR', locations: 45, status: 'Active' },
];

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="flex border-b border-[var(--border-subtle)] pb-8 gap-12 flex-col md:flex-row">
        <div className="w-full md:w-64 shrink-0 px-2 space-y-1">
          <button className="w-full text-left px-4 py-2 bg-[var(--accent-subtle)] text-[var(--accent)] border-l-2 border-[var(--accent)] font-medium text-sm flex items-center gap-3 rounded-r-[var(--radius-sm)]">
            <Building className="w-4 h-4" /> Warehouses
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-l-2 border-transparent transition-colors text-sm flex items-center gap-3 rounded-[var(--radius-sm)]">
            <ShieldCheck className="w-4 h-4" /> Permissions
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-l-2 border-transparent transition-colors text-sm flex items-center gap-3 rounded-[var(--radius-sm)]">
            <Settings2 className="w-4 h-4" /> System Config
          </button>
        </div>

        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-[var(--text-lg)] text-[var(--text-primary)] font-medium font-mono uppercase tracking-wider">Warehouses</h2>
            <button className="bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] px-4 py-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] transition-colors text-sm font-medium">
              + New Warehouse
            </button>
          </div>
          
          <DataTable
            data={MOCK_WAREHOUSES}
            columns={[
              { header: 'Name', accessor: 'name' },
              { header: 'Code', accessor: 'code', className: 'font-mono text-[var(--text-muted)] hidden sm:table-cell' },
              { 
                header: 'Locations', 
                accessor: (r) => <span className="flex items-center gap-2 text-[var(--text-secondary)]"><MapPin className="w-3.5 h-3.5"/> {r.locations}</span>, 
                className: 'hidden md:table-cell' 
              },
              { header: 'Status', accessor: 'status', className: 'text-[#3FB950] font-medium text-xs uppercase' },
            ]}
            keyExtractor={(r) => r.id}
          />
        </div>
      </div>
    </div>
  );
}
