'use client';

import { useOperations } from '@/hooks/useOperations';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, ClipboardList } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterBar from '@/components/ui/FilterBar';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Operation } from '@/types';
import { parseISO, format } from 'date-fns';

export default function OperationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Extract filters from URL
  const filters: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (value) filters[key] = value;
  });

  const { data: operationsData, isLoading } = useOperations(filters);
  const operations = operationsData?.data || [];
  const meta = operationsData?.meta;

  const filtersConfig = [
    {
      key: 'type',
      label: 'Operation Type',
      options: [
        { label: 'Receipts', value: 'receipt' },
        { label: 'Deliveries', value: 'delivery' },
        { label: 'Transfers', value: 'transfer' },
        { label: 'Adjustments', value: 'adjustment' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Waiting', value: 'waiting' },
        { label: 'Ready', value: 'ready' },
        { label: 'Done', value: 'done' },
        { label: 'Canceled', value: 'canceled' },
      ],
    },
  ];

  const columns = [
    { 
      header: 'Ref #', 
      accessor: (row: Operation) => (
        <span className="font-mono text-[var(--accent)] font-medium">
          {row.reference_number || row.id.split('-')[0]}
        </span>
      ),
      className: 'w-[140px]' 
    },
    { 
      header: 'Type', 
      accessor: (row: Operation) => <span className="capitalize">{row.type}</span> 
    },
    { 
      header: 'Status', 
      accessor: (row: Operation) => <StatusBadge status={row.status} /> 
    },
    { 
      header: 'Lines', 
      accessor: (row: Operation) => <span className="text-[var(--text-secondary)]">{row.lines?.length || 0}</span>,
      className: 'hidden sm:table-cell text-center' 
    },
    { 
      header: 'Date', 
      accessor: (row: Operation) => (
        <span className="text-[var(--text-secondary)]">
          {format(parseISO(row.created_at), 'MMM d, yy HH:mm')}
        </span>
      ),
      className: 'hidden md:table-cell' 
    },
    { 
      header: 'User', 
      accessor: 'created_by' as const, 
      className: 'text-[var(--text-muted)] hidden lg:table-cell' 
    },
  ];

  const staggerClass = (index: number) => 
    `animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-${index * 75} duration-300`;

  return (
    <div className="space-y-6 pb-8 max-w-7xl mx-auto">
      {/* Top Controls */}
      <div className={`flex justify-end ${staggerClass(0)}`}>
        <button 
          onClick={() => router.push('/operations/new')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--accent)] text-[var(--text-on-accent)] hover:bg-[var(--accent-glow)] rounded-[var(--radius-md)] px-4 py-2 font-medium transition-colors whitespace-nowrap shadow-[var(--shadow-sm)]"
        >
          <Plus className="w-4 h-4" />
          New Operation
        </button>
      </div>

      <div className={staggerClass(1)}>
        <FilterBar 
          filters={filtersConfig} 
          searchPlaceholder="Search reference number..." 
          // We can use the default 'q' for search or something else, but mock backend handles it (well mock currently ignores q, but we'll add it later if needed)
        />
      </div>

      <div className={staggerClass(2)}>
        {isLoading ? (
          <LoadingSkeleton variant="table-row" count={8} />
        ) : (
          <>
            <DataTable
              data={operations}
              columns={columns}
              keyExtractor={(row) => row.id}
              onRowClick={(row) => router.push(`/operations/${row.id}`)}
              emptyComponent={
                <EmptyState 
                  icon={ClipboardList}
                  title="No operations"
                  description="Create a receipt, delivery or transfer to get started."
                  action={{
                    label: "New Operation",
                    onClick: () => router.push('/operations/new')
                  }}
                />
              }
            />
            {meta && meta.total_pages > 1 && (
              <div className="flex items-center justify-between mt-4 px-2 text-sm text-[var(--text-secondary)]">
                <div>
                  Showing {operations.length} of {meta.total} operations
                </div>
                <div>
                  Page {meta.page} of {meta.total_pages}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
