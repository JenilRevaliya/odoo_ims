'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateProduct } from '@/hooks/useProducts';
import { toast } from '@/store/toast';
import { Save, X, ArrowLeft } from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';

const CATEGORIES = [
  'Raw Materials',
  'Components',
  'Finished Goods',
  'Packaging',
  'Consumables'
];

export default function NewProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: CATEGORIES[0],
    unit_of_measure: 'pcs',
    minimum_stock: 0,
    reorder_quantity: 0
  });

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
      const res = await createProduct.mutateAsync(formData);
      toast.success('Product created', `Successfully created ${formData.name}`);
      // In a real app we'd redirect to the ID of the new product, assuming the API returns it
      router.push(`/products/${res.data?.id || 'new'}`);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = (err as any)?.response?.data?.error?.message || 'Failed to create product';
      toast.error('Error', message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="flex items-center justify-between mb-2">
        <Breadcrumb customLabel="New Product" />
        <button 
          onClick={() => router.push('/products')}
          className="md:hidden flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
          Create New Product
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Add a new item to the master inventory catalog.
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
                placeholder="e.g. Steel Rod (20mm)"
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
                className="w-full bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-primary)] text-sm outline-none transition-colors font-mono uppercase"
                placeholder="e.g. STL-001"
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
                placeholder="pcs, kg, m, liters..."
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
              <p className="text-xs text-[var(--text-muted)] mt-1">Triggers low stock warnings when balance falls below this.</p>
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
            onClick={() => router.back()}
            disabled={createProduct.isPending}
            className="flex items-center justify-center gap-2 bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[var(--radius-md)] px-5 py-2.5 text-sm font-medium transition-colors border border-[var(--border)] disabled:opacity-50"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            type="submit"
            disabled={createProduct.isPending}
            className="flex items-center justify-center gap-2 bg-[var(--accent)] text-[var(--text-on-accent)] hover:bg-[var(--accent-glow)] rounded-[var(--radius-md)] px-6 py-2.5 text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {createProduct.isPending ? 'Saving...' : 'Create Product'}
          </button>
        </div>

      </form>
    </div>
  );
}
