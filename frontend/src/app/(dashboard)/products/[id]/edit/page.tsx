'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProduct, useUpdateProduct } from '@/hooks/useProducts';
import { toast } from '@/store/toast';
import { Save, X, ArrowLeft, Loader2 } from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';

const CATEGORIES = [
  'Raw Materials',
  'Components',
  'Finished Goods',
  'Packaging',
  'Consumables'
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = (Array.isArray(params.id) ? params.id[0] : params.id) as string;

  const { data: productData, isLoading: isLoadingProduct } = useProduct(productId);
  const updateProduct = useUpdateProduct(productId);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: CATEGORIES[0],
    unit_of_measure: 'pcs',
    minimum_stock: 0,
    reorder_quantity: 0
  });

  useEffect(() => {
    if (productData?.data) {
      const p = productData.data;
      setTimeout(() => {
        setFormData({
          name: p.name,
          sku: p.sku,
          category: CATEGORIES.includes(p.category) ? p.category : CATEGORIES[0],
          unit_of_measure: p.unit_of_measure,
          minimum_stock: p.minimum_stock,
          reorder_quantity: p.reorder_quantity
        });
      }, 0);
    }
  }, [productData]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    else if (!/^[A-Z0-9-]+$/.test(formData.sku)) newErrors.sku = 'SKU must be uppercase letters, numbers, and hyphens only';
    
    if (formData.minimum_stock < 0) newErrors.minimum_stock = 'Cannot be negative';
    if (formData.reorder_quantity < 0) newErrors.reorder_quantity = 'Cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await updateProduct.mutateAsync(formData);
      toast.success('Product updated', `Successfully updated ${formData.name}`);
      router.push(`/products/${productId}`);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = (err as any)?.response?.data?.error?.message || 'Failed to update product';
      toast.error('Error', message);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="flex items-center justify-between mb-2">
        <Breadcrumb customLabel={`Edit: ${productData?.data?.name || ''}`} />
        <button 
          onClick={() => router.push(`/products/${productId}`)}
          className="md:hidden flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Product
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
          Edit Product
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Update details for {productData?.data?.sku}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 sm:p-8 shadow-sm space-y-8">
        
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-2">
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-[var(--text-primary)]">Product Name *</label>
              <input 
                id="name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-primary)] text-sm outline-none transition-colors"
              />
              {errors.name && <p className="text-xs text-[var(--status-danger)] mt-1">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="sku" className="text-sm font-medium text-[var(--text-primary)]">SKU Code *</label>
              <input 
                id="sku"
                type="text"
                value={formData.sku}
                onChange={e => {
                  setFormData({...formData, sku: e.target.value.toUpperCase()});
                  if (errors.sku) setErrors({...errors, sku: ''});
                }}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-primary)] text-sm outline-none transition-colors font-mono uppercase cursor-not-allowed opacity-80"
                disabled // Usually shouldn't change SKU
                title="SKU cannot be changed after creation"
              />
              {errors.sku && <p className="text-xs text-[var(--status-danger)] mt-1">{errors.sku}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-[var(--text-primary)]">Category</label>
              <div className="relative">
                <select 
                  id="category"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full appearance-none bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-4 py-2.5 pr-10 text-[var(--text-primary)] text-sm outline-none transition-colors"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">▼</div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="unit" className="text-sm font-medium text-[var(--text-primary)]">Unit of Measure</label>
              <input 
                id="unit"
                type="text"
                value={formData.unit_of_measure}
                onChange={e => setFormData({...formData, unit_of_measure: e.target.value})}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-primary)] text-sm outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-2">
            Stock Rules
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="min_stock" className="text-sm font-medium text-[var(--text-primary)]">Minimum Stock Level</label>
              <input 
                id="min_stock"
                type="number"
                min="0"
                value={formData.minimum_stock}
                onChange={e => setFormData({...formData, minimum_stock: parseInt(e.target.value) || 0})}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-primary)] text-sm outline-none transition-colors"
              />
              {errors.minimum_stock && <p className="text-xs text-[var(--status-danger)] mt-1">{errors.minimum_stock}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="reorder_qty" className="text-sm font-medium text-[var(--text-primary)]">Reorder Quantity</label>
              <input 
                id="reorder_qty"
                type="number"
                min="0"
                value={formData.reorder_quantity}
                onChange={e => setFormData({...formData, reorder_quantity: parseInt(e.target.value) || 0})}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-primary)] text-sm outline-none transition-colors"
              />
              {errors.reorder_quantity && <p className="text-xs text-[var(--status-danger)] mt-1">{errors.reorder_quantity}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => router.push(`/products/${productId}`)}
            disabled={updateProduct.isPending}
            className="flex items-center justify-center gap-2 bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[var(--radius-md)] px-5 py-2.5 text-sm font-medium transition-colors border border-[var(--border)] disabled:opacity-50"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            type="submit"
            disabled={updateProduct.isPending}
            className="flex items-center justify-center gap-2 bg-[var(--accent)] text-[var(--text-on-accent)] hover:bg-[var(--accent-glow)] rounded-[var(--radius-md)] px-6 py-2.5 text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {updateProduct.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </form>
    </div>
  );
}
