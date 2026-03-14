'use client';

import { useProducts } from '@/hooks/useProducts';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Package } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import StockBadge from '@/components/ui/StockBadge';
import FilterBar from '@/components/ui/FilterBar';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Product } from '@/types';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Extract filters from URL
  const filters: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (value) filters[key] = value;
  });

  const { data: productsData, isLoading } = useProducts(filters);
  const products = productsData?.data || [];
  const meta = productsData?.meta;

  const filtersConfig = [
    {
      key: 'category',
      label: 'Category',
      options: [
        { label: 'Raw Materials', value: 'Raw Materials' },
        { label: 'Components', value: 'Components' },
        { label: 'Finished Goods', value: 'Finished Goods' },
        { label: 'Packaging', value: 'Packaging' },
      ],
    },
    {
      key: 'filter',
      label: 'Stock Status',
      options: [
        { label: 'Low Stock', value: 'low_stock' },
        { label: 'Out of Stock', value: 'out_of_stock' },
      ],
    },
  ];

  const columns = [
    { header: 'Product Name', accessor: 'name' as const },
    { 
      header: 'SKU', 
      accessor: (row: Product) => <span className="font-mono text-[var(--text-secondary)]">{row.sku}</span>,
      className: 'hidden sm:table-cell' 
    },
    { header: 'Category', accessor: 'category' as const, className: 'hidden md:table-cell' },
    { header: 'Unit', accessor: 'unit_of_measure' as const, className: 'hidden sm:table-cell text-[var(--text-secondary)] text-xs' },
    { 
      header: 'Stock', 
      accessor: (row: Product) => (
        <StockBadge 
          quantity={row.total_stock} 
          minimum={row.minimum_stock} 
          unit={row.unit_of_measure} 
        />
      )
    },
  ];

  const staggerClass = (index: number) => 
    `animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-${index * 75} duration-300`;

  return (
    <div className="space-y-6 pb-8 max-w-7xl mx-auto">
      {/* Top Controls */}
      <div className={`flex justify-end ${staggerClass(0)}`}>
        <button 
          onClick={() => router.push('/products/new')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--accent)] text-[var(--text-on-accent)] hover:bg-[var(--accent-glow)] rounded-[var(--radius-md)] px-4 py-2 font-medium transition-colors whitespace-nowrap shadow-[var(--shadow-sm)]"
        >
          <Plus className="w-4 h-4" />
          New Product
        </button>
      </div>

      <div className={staggerClass(1)}>
        <FilterBar 
          filters={filtersConfig} 
          searchPlaceholder="Search product name or SKU..." 
        />
      </div>

      <div className={staggerClass(2)}>
        {isLoading ? (
          <LoadingSkeleton variant="table-row" count={8} />
        ) : (
          <>
            <DataTable
              data={products}
              columns={columns}
              keyExtractor={(row) => row.id}
              onRowClick={(row) => router.push(`/products/${row.id}`)}
              emptyComponent={
                <EmptyState 
                  icon={Package}
                  title="No products yet"
                  description="Start by creating your first product to manage inventory."
                  action={{
                    label: "Create Product",
                    onClick: () => router.push('/products/new')
                  }}
                />
              }
            />
            {meta && meta.total_pages > 1 && (
              <div className="flex items-center justify-between mt-4 px-2 text-sm text-[var(--text-secondary)]">
                <div>
                  Showing {products.length} of {meta.total} products
                </div>
                {/* Minimal pagination logic could go here */}
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
