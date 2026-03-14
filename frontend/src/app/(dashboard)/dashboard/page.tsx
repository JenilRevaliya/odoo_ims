'use client';

import { useDashboardKPIs, useLowStock, useRecentOperations } from '@/hooks/useDashboard';
import { useRouter } from 'next/navigation';
import { PackagePlus, PackageMinus, ArrowRightLeft, Edit3, ArrowRight, AlertTriangle, RefreshCw } from 'lucide-react';
import KPICard from '@/components/ui/KPICard';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { parseISO, format } from 'date-fns';

export default function Dashboard() {
  const router = useRouter();
  const { data: kpiData, isLoading: kpiLoading, isFetching: kpiFetching, refetch: refetchKpi } = useDashboardKPIs();
  const { data: stockData, isLoading: stockLoading } = useLowStock();
  const { data: opsData, isLoading: opsLoading } = useRecentOperations();

  const kpis = kpiData?.data;
  const lowStockProducts = stockData?.data || [];
  const recentOperations = opsData?.data || [];

  const staggerClass = (index: number) => 
    `animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-${index * 75} duration-300`;

  return (
    <div className="space-y-6 pb-8 max-w-7xl mx-auto">
      {/* Top Controls */}
      <div className={`flex items-center justify-end ${staggerClass(0)}`}>
        <button 
          onClick={() => refetchKpi()}
          disabled={kpiFetching}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[var(--radius-md)] transition-colors disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${kpiFetching ? 'animate-spin text-[var(--accent)]' : ''}`} />
        </button>
      </div>

      {/* KPI Row */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${staggerClass(1)}`}>
        <KPICard 
          label="Total Stock" 
          value={kpis?.total_products_in_stock || 0}
          isLoading={kpiLoading}
          onClick={() => router.push('/products')}
        />
        <KPICard 
          label="Low Stock" 
          value={kpis?.low_stock_count || 0}
          status={(kpis?.low_stock_count || 0) > 0 ? 'warning' : 'healthy'}
          isLoading={kpiLoading}
          onClick={() => router.push('/products?filter=low_stock')}
        />
        <KPICard 
          label="Out of Stock" 
          value={kpis?.out_of_stock_count || 0}
          status={(kpis?.out_of_stock_count || 0) > 0 ? 'critical' : 'healthy'}
          isLoading={kpiLoading}
          onClick={() => router.push('/products?filter=out_of_stock')}
        />
        <KPICard 
          label="Pending Receipts" 
          value={kpis?.pending_receipts || 0}
          isLoading={kpiLoading}
          onClick={() => router.push('/operations?type=receipt&status=waiting')}
        />
        <KPICard 
          label="Pending Deliveries" 
          value={kpis?.pending_deliveries || 0}
          isLoading={kpiLoading}
          onClick={() => router.push('/operations?type=delivery&status=waiting')}
        />
        <KPICard 
          label="Scheduled Transfers" 
          value={kpis?.scheduled_transfers || 0}
          isLoading={kpiLoading}
          onClick={() => router.push('/operations?type=transfer&status=ready')}
        />
      </div>

      {/* Low Stock Alerts */}
      {!stockLoading && lowStockProducts.length > 0 && (
        <div className={`space-y-3 ${staggerClass(2)}`}>
          <h2 className="text-[var(--text-primary)] font-medium text-lg pt-2 tracking-tight">Requires Attention</h2>
          <div className="flex flex-col gap-2">
            {lowStockProducts.slice(0, 3).map(product => {
              const outOfStock = product.total_stock === 0;
              return (
                <div 
                  key={product.id}
                  className={`flex items-center justify-between p-4 rounded-[var(--radius-md)] border ${outOfStock ? 'bg-[var(--status-danger)]/5 border-[var(--status-danger)]/20 animate-pulse-amber' : 'bg-[var(--status-warning)]/5 border-[var(--status-warning)]/20'}`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-5 h-5 ${outOfStock ? 'text-[var(--status-danger)]' : 'text-[var(--status-warning)]'}`} />
                    <div>
                      <div className="font-medium text-[var(--text-primary)]">{product.name}</div>
                      <div className="text-sm font-mono text-[var(--text-secondary)] mt-0.5">{product.sku}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <div className={`font-medium ${outOfStock ? 'text-[var(--status-danger)]' : 'text-[var(--status-warning)]'}`}>
                        {product.total_stock} {product.unit_of_measure}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">Min: {product.minimum_stock}</div>
                    </div>
                    <button 
                      onClick={() => router.push(`/products/${product.id}`)}
                      className="text-sm font-medium hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 shrink-0 px-3 py-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg-hover)]"
                    >
                      Review <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className={`space-y-3 pt-2 ${staggerClass(3)}`}>
        <h2 className="text-[var(--text-primary)] font-medium text-lg tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: PackagePlus, label: 'New Receipt', path: '/operations/new?type=receipt', color: 'text-[#3FB950]' },
            { icon: PackageMinus, label: 'New Delivery', path: '/operations/new?type=delivery', color: 'text-[#F85149]' },
            { icon: ArrowRightLeft, label: 'Transfer', path: '/operations/new?type=transfer', color: 'text-[var(--status-info)]' },
            { icon: Edit3, label: 'Adjustment', path: '/operations/new?type=adjustment', color: 'text-[var(--accent)]' },
          ].map(action => (
            <button
              key={action.label}
              onClick={() => router.push(action.path)}
              className="flex flex-col items-center justify-center p-4 gap-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-accent)] hover:bg-[var(--bg-hover)] transition-all rounded-[var(--radius-lg)] group outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <div className={`p-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] group-hover:scale-110 transition-transform ${action.color}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Operations */}
      <div className={`space-y-3 pt-4 ${staggerClass(4)}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-[var(--text-primary)] font-medium text-lg tracking-tight">Recent Operations</h2>
          <button 
            onClick={() => router.push('/operations')}
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg-hover)]"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {opsLoading ? (
          <LoadingSkeleton variant="table-row" count={5} />
        ) : (
          <DataTable
            data={recentOperations}
            columns={[
              { 
                header: 'Ref #', 
                accessor: (row) => <span className="font-mono text-[var(--accent)]">{row.reference_number || row.id.split('-')[0]}</span>,
                className: 'w-[140px]'
              },
              { 
                header: 'Type', 
                accessor: (row) => <span className="capitalize">{row.type}</span> 
              },
              { 
                header: 'Status', 
                accessor: (row) => <StatusBadge status={row.status} /> 
              },
              { 
                header: 'Lines', 
                accessor: (row) => <span className="text-[var(--text-secondary)]">{row.lines?.length || 0}</span>,
                className: 'hidden sm:table-cell text-center w-[80px]'
              },
              { 
                header: 'Date', 
                accessor: (row) => <span className="text-[var(--text-secondary)]">{format(parseISO(row.created_at), 'MMM d, yy HH:mm')}</span>,
                className: 'hidden md:table-cell'
              },
            ]}
            keyExtractor={r => r.id}
            onRowClick={r => router.push(`/operations/${r.id}`)}
            emptyMessage="No recent operations."
          />
        )}
      </div>
    </div>
  );
}
