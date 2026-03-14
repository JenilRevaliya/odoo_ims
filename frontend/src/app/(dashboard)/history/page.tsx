'use client';

import { Suspense, useEffect } from 'react';
import { useStockLedger } from '@/hooks/useStockLedger';
import { useProduct } from '@/hooks/useProducts';
import { useOperation } from '@/hooks/useOperations';
import { useRouter, useSearchParams } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import FilterBar from '@/components/ui/FilterBar';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useUIStore } from '@/store/ui';
import { LedgerEntry } from '@/types';
import { parseISO, format } from 'date-fns';
import { Loader2, Clock } from 'lucide-react';

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-[var(--accent)]" /></div>}>
      <HistoryContent />
    </Suspense>
  );
}

function HistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Extract filters from URL
  const filters: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (value) filters[key] = value;
  });

  const productId = filters.product_id;
  const operationId = filters.operation_id;

  // Optional fetches for breadcrumb context
  const { data: productData } = useProduct(productId || '');
  const { data: opData } = useOperation(operationId || '');

  const { data: ledgerData, isLoading } = useStockLedger(filters);
  const entries = ledgerData?.data || [];
  const meta = ledgerData?.meta;

  const filtersConfig = [
    {
      key: 'operation_type',
      label: 'Type',
      options: [
        { label: 'Receipts', value: 'receipt' },
        { label: 'Deliveries', value: 'delivery' },
        { label: 'Transfers', value: 'transfer' },
        { label: 'Adjustments', value: 'adjustment' },
      ],
    }
  ];

  /*
    Breadcrumb logic:
    - /history → "Move History"
    - /history?product_id=:id → "Products / [Name] / History"
    - /history?operation_id=:id → "History / [Ref #]"
  */
  const getBreadcrumbLabel = () => {
    if (productId && productData?.data) return `Products / ${productData.data.name} / History`;
    if (operationId && opData?.data) {
      const ref = opData.data.reference_number || opData.data.id.split('-')[0];
      return `Operations / ${ref} / History`;
    }
    return 'Move History';
  };

  const getPageTitle = () => {
    if (productId) return 'Product Move History';
    if (operationId) return 'Operation Move History';
    return 'Global Move History';
  };

  const columns = [
    { 
      header: 'Date', 
      accessor: (row: LedgerEntry) => (
        <span className="text-[var(--text-secondary)] whitespace-nowrap">
          {format(parseISO(row.created_at), 'MMM d, yy HH:mm')}
        </span>
      ),
      className: 'w-[140px]'
    },
    { 
      header: 'Type', 
      accessor: (row: LedgerEntry) => <span className="capitalize text-[var(--text-primary)] font-medium">{row.operation_type}</span>,
      className: 'hidden sm:table-cell'
    },
    { 
      header: 'Product', 
      accessor: (row: LedgerEntry) => (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/products/${row.product_id}`);
          }}
          className="hover:underline hover:text-[var(--accent)] text-left focus:outline-none"
        >
          {row.product_name}
        </button>
      )
    },
    { 
      header: 'Location', 
      accessor: 'location_name' as const, 
      className: 'hidden md:table-cell text-[var(--text-secondary)]' 
    },
    { 
      header: 'Delta', 
      accessor: (row: LedgerEntry) => {
        const isPositive = row.delta > 0;
        const sign = isPositive ? '+' : '';
        return (
          <span className={`font-mono font-medium ${isPositive ? 'text-[#3FB950]' : 'text-[#F85149]'}`}>
            {sign}{row.delta}
          </span>
        );
      },
      className: 'text-right w-[100px]'
    },
    { 
      header: 'Balance', 
      accessor: (row: LedgerEntry) => <span className="font-mono text-[var(--text-primary)] font-medium">{row.balance_after}</span>,
      className: 'text-right w-[100px]'
    },
    { 
      header: 'User', 
      accessor: 'user_name' as const, 
      className: 'text-[var(--text-muted)] hidden xl:table-cell text-xs' 
    },
  ];

  const { setHeader, clearHeader } = useUIStore();

  useEffect(() => {
    const title = getPageTitle();
    const breadcrumb = getBreadcrumbLabel();
    setHeader({ title, breadcrumbLabel: breadcrumb });
    return () => clearHeader();
  }, [productData, opData, productId, operationId]);

  const staggerClass = (index: number) => 
    `animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-${index * 75} duration-300`;

  return (
    <div className="space-y-6 pb-8 max-w-7xl mx-auto">
      <div className={staggerClass(0)}>
        <FilterBar 
          filters={filtersConfig} 
          searchPlaceholder="Search product or ref..." 
        />
      </div>

      <div className={staggerClass(3)}>
        {isLoading ? (
          <LoadingSkeleton variant="table-row" count={10} />
        ) : (
          <>
            <DataTable
              data={entries}
              columns={columns}
              keyExtractor={(row) => row.id}
              onRowClick={(row) => router.push(`/operations/${row.operation_id}`)}
              emptyComponent={
                <EmptyState 
                  icon={Clock}
                  title="No movement history"
                  description="All stock movements will be recorded here automatically."
                />
              }
            />
            {meta && meta.total_pages > 1 && (
              <div className="flex items-center justify-between mt-4 px-2 text-sm text-[var(--text-secondary)]">
                <div>
                  Showing {entries.length} of {meta.total} entries
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
