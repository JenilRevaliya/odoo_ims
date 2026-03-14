'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';

interface ProductMock {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  stock: number;
  min_stock: number;
}

const MOCK_DATA: ProductMock[] = [
  { id: '1', name: 'Steel Rod (20mm)', sku: 'STL-001', category: 'Raw Materials', unit: 'kg', stock: 150, min_stock: 50 },
  { id: '2', name: 'Copper Wire', sku: 'COP-002', category: 'Raw Materials', unit: 'kg', stock: 3, min_stock: 20 },
  { id: '3', name: 'Chair Frame', sku: 'CHF-001', category: 'Finished Goods', unit: 'pcs', stock: 0, min_stock: 10 },
];

export default function ProductsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const renderStockBadge = (row: ProductMock) => {
    if (row.stock === 0) {
      return <StatusBadge label="0" colorPreset="red" />;
    } else if (row.stock <= row.min_stock) {
      return <StatusBadge label={row.stock.toString()} colorPreset="amber" />;
    }
    return <StatusBadge label={row.stock.toString()} colorPreset="green" />;
  };

  const columns = [
    { header: 'Product', accessor: 'name' as const },
    { header: 'SKU', accessor: 'sku' as const, className: 'font-mono text-[var(--text-secondary)] hidden sm:table-cell' },
    { header: 'Category', accessor: 'category' as const, className: 'hidden md:table-cell' },
    { header: 'Unit', accessor: 'unit' as const, className: 'hidden sm:table-cell text-[var(--text-secondary)] text-xs' },
    { header: 'Stock', accessor: renderStockBadge },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input 
            type="text" 
            placeholder="Search SKU or product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] pl-9 pr-4 py-2 text-[var(--text-primary)] text-sm outline-none transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-[var(--radius-md)] px-4 py-2 text-[var(--text-primary)] text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          <button 
            onClick={() => router.push('/products/new')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[var(--accent)] text-[var(--text-on-accent)] hover:bg-[var(--accent-glow)] rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Product
          </button>
        </div>
      </div>

      <DataTable
        data={MOCK_DATA}
        columns={columns}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => router.push(`/products/${row.id}`)}
      />
    </div>
  );
}
