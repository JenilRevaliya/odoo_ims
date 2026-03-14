'use client';

import { useProduct } from '@/hooks/useProducts';
import { useRouter, useParams } from 'next/navigation';
import { Edit3, ArrowLeft, History, PackagePlus, AlertTriangle } from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import StockBadge from '@/components/ui/StockBadge';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = (Array.isArray(params.id) ? params.id[0] : params.id) as string;

  const { data: productData, isLoading, error } = useProduct(productId);
  const product = productData?.data;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Breadcrumb customLabel="Loading..." />
        <LoadingSkeleton variant="default" count={1} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <LoadingSkeleton variant="product-card" />
          </div>
          <div>
            <LoadingSkeleton variant="table-row" count={3} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-20">
        <AlertTriangle className="w-12 h-12 text-[var(--status-danger)] mb-4" />
        <h2 className="text-xl font-medium text-[var(--text-primary)]">Product not found</h2>
        <p className="text-[var(--text-secondary)] mt-2">The product you are looking for does not exist or has been removed.</p>
        <button 
          onClick={() => router.push('/products')}
          className="mt-6 flex items-center gap-2 text-[var(--accent)] hover:text-[var(--accent-glow)] font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </button>
      </div>
    );
  }

  const outOfStock = product.total_stock === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="flex items-center justify-between mb-2">
        <Breadcrumb customLabel={product.name} />
        <button 
          onClick={() => router.push('/products')}
          className="md:hidden flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
            {product.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="font-mono text-sm text-[var(--text-secondary)] py-1 px-2.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)]">
              {product.sku}
            </span>
            <span className="text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-pill)] px-3 py-1">
              {product.category}
            </span>
            <StockBadge 
              quantity={product.total_stock} 
              minimum={product.minimum_stock} 
              unit={product.unit_of_measure} 
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => router.push(`/operations/new?type=receipt&product_id=${product.id}`)}
            className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-sm font-medium text-[var(--text-primary)] rounded-[var(--radius-md)] transition-colors"
          >
            <PackagePlus className="w-4 h-4 text-[#3FB950]" />
            New Receipt
          </button>
          <button 
            onClick={() => router.push(`/products/${product.id}/edit`)}
            className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-[var(--accent)]/10 border border-[var(--accent)]/30 hover:bg-[var(--accent)] hover:text-[var(--text-on-accent)] text-sm font-medium text-[var(--accent)] rounded-[var(--radius-md)] transition-colors group"
          >
            <Edit3 className="w-4 h-4" />
            Edit Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        
        {/* Info Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="relative overflow-hidden bg-[var(--bg-elevated)]/80 backdrop-blur-xl border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 sm:p-6 shadow-md transition-all h-full">
            {/* Subtle gradient glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-[var(--accent)]/10 to-transparent opacity-50 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <h2 className="relative z-10 text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest border-b border-[var(--border-subtle)] pb-4 mb-4 drop-shadow-sm">
              Product Details
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <dt className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Unit of Measure</dt>
                <dd className="text-base text-[var(--text-primary)] font-medium">{product.unit_of_measure}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Minimum Stock Alert</dt>
                <dd className="text-base text-[var(--text-primary)] font-medium">{product.minimum_stock} {product.unit_of_measure}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Reorder Quantity</dt>
                <dd className="text-base text-[var(--text-primary)] font-medium">{product.reorder_quantity} {product.unit_of_measure}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Status</dt>
                <dd className="text-base font-medium flex items-center gap-2 mt-1">
                   {outOfStock ? (
                    <span className="text-[var(--status-danger)] flex items-center gap-1.5"><AlertTriangle className="w-4 h-4"/> Out of Stock</span>
                   ) : product.total_stock <= product.minimum_stock ? (
                    <span className="text-[var(--status-warning)] flex items-center gap-1.5"><AlertTriangle className="w-4 h-4"/> Low Stock Warning</span>
                   ) : (
                    <span className="text-[#3FB950]">In Stock (Healthy)</span>
                   )}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Location Stock Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="relative bg-[var(--bg-elevated)]/80 backdrop-blur-xl border border-[var(--border-subtle)] rounded-[var(--radius-lg)] shadow-md overflow-hidden flex flex-col h-full transition-all">
            {/* Subtle gradient glow */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-radial from-[var(--status-info)]/10 to-transparent opacity-50 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            
            <div className="relative z-10 p-5 sm:p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 flex justify-between items-center">
              <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest drop-shadow-sm">
                Stock by Location
              </h2>
            </div>
            
            <div className="relative z-10 flex-1 p-0">
              {product.stock_by_location?.length === 0 ? (
                <div className="p-6 text-center text-[var(--text-secondary)] text-sm">
                  No stock available in any location.
                </div>
              ) : (
                <ul className="divide-y divide-[var(--border-subtle)]">
                  {product.stock_by_location?.map((loc) => (
                    <li key={loc.location_id} className="p-4 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors">
                      <div className="font-medium text-[var(--text-primary)] text-sm">{loc.location}</div>
                      <div className="font-mono text-sm tracking-tight text-[var(--text-secondary)]">
                        {loc.quantity} <span className="text-[var(--text-muted)] text-xs">{product.unit_of_measure}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="relative z-10 p-4 bg-[var(--bg-surface)]/50 border-t border-[var(--border-subtle)]">
              <button 
                onClick={() => router.push(`/history?search=${product.sku}`)}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors py-2 rounded-[var(--radius-sm)] border border-[var(--border)] hover:border-[var(--border-accent)] hover:bg-[var(--bg-hover)]"
              >
                <History className="w-4 h-4" /> View Move History
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
