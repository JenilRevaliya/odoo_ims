'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCreateOperation } from '@/hooks/useOperations';
import { useLocations } from '@/hooks/useWarehouses';
import { toast } from '@/store/toast';
import { 
  PackagePlus, PackageMinus, ArrowRightLeft, Edit3, 
  ArrowLeft, Save, X, Plus, Trash2, Loader2
} from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ProductSearchInput from '@/components/ui/ProductSearchInput';
import { OperationType, Product, OperationLine } from '@/types';

// Wrapper for Suspense (useSearchParams requires suspense in Next 15+ usually, though we are in 16 Turbopack)
export default function NewOperationPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-[var(--accent)]" /></div>}>
      <NewOperationForm />
    </Suspense>
  );
}

function NewOperationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') as OperationType | null;
  const productIdParam = searchParams.get('product_id');

  if (!typeParam) {
    return <TypeSelector onSelect={(t) => router.replace(`/operations/new?type=${t}${productIdParam ? `&product_id=${productIdParam}` : ''}`)} />;
  }

  return <OperationForm type={typeParam} onBack={() => router.push('/operations')} />;
}

// -------------------------------------------------------------
// STEP 1: TYPE SELECTOR
// -------------------------------------------------------------
function TypeSelector({ onSelect }: { onSelect: (type: OperationType) => void }) {
  const router = useRouter();
  const TYPES = [
    { id: 'receipt' as const, label: 'Receipt', description: 'Receive incoming stock into a location.', icon: PackagePlus, color: 'text-[#3FB950]', border: 'hover:border-[#3FB950]' },
    { id: 'delivery' as const, label: 'Delivery', description: 'Send outbound stock to customers.', icon: PackageMinus, color: 'text-[#F85149]', border: 'hover:border-[#F85149]' },
    { id: 'transfer' as const, label: 'Transfer', description: 'Move stock between internal locations.', icon: ArrowRightLeft, color: 'text-[var(--status-info)]', border: 'hover:border-[var(--status-info)]' },
    { id: 'adjustment' as const, label: 'Adjustment', description: 'Fix inventory discrepancies.', icon: Edit3, color: 'text-[var(--accent)]', border: 'hover:border-[var(--accent)]' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-2">
        <Breadcrumb customLabel="New Operation" />
        <button 
          onClick={() => router.push('/operations')}
          className="md:hidden flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel
        </button>
      </div>

      <div className="text-center py-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] tracking-tight">Select Operation Type</h1>
        <p className="text-[var(--text-secondary)] mt-2">Choose the type of inventory movement you want to record.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TYPES.map(t => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`flex flex-col items-center sm:items-start text-center sm:text-left bg-[var(--bg-elevated)] border border-[var(--border-subtle)] ${t.border} rounded-[var(--radius-lg)] p-6 sm:p-8 hover:bg-[var(--bg-hover)] transition-all group outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] shadow-sm hover:shadow-md`}
          >
            <div className={`p-4 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] group-hover:scale-110 transition-transform ${t.color} mb-4`}>
              <t.icon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-medium text-[var(--text-primary)]">{t.label}</h2>
            <p className="text-[var(--text-secondary)] mt-2">{t.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// STEP 2: FORM
// -------------------------------------------------------------
function OperationForm({ type, onBack }: { type: OperationType, onBack: () => void }) {
  const router = useRouter();
  const createMutation = useCreateOperation();
  const { data: locationsData } = useLocations();
  const locations = locationsData?.data || [];
  
  // Basic Form State
  const [sourceId, setSourceId] = useState('');
  const [destId, setDestId] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  
  // Product Lines State
  const [lines, setLines] = useState<{ id: string; product: Product | null; expected_qty: number }[]>(() => {
    return [{ id: Math.random().toString(), product: null, expected_qty: 1 }];
  });

  // Adjustment specific state (only supports 1 line easily for simpler UI, but lines array handles it)
  const isAdjustment = type === 'adjustment';

  // Titles
  const TITLES = {
    receipt: 'New Receipt',
    delivery: 'New Delivery',
    transfer: 'New Transfer',
    adjustment: 'Inventory Adjustment'
  };

  const validate = () => {
    if (type === 'receipt' && !destId) return 'Destination location is required';
    if (type === 'delivery' && !sourceId) return 'Source location is required';
    if (type === 'transfer' && (!sourceId || !destId)) return 'Source and Destination locations are required';
    if (type === 'transfer' && sourceId === destId) return 'Source and Destination cannot be the same';
    if (type === 'adjustment' && !sourceId) return 'Location is required';

    if (lines.length === 0) return 'At least one product line is required';
    
    for (const line of lines) {
      if (!line.product) return 'All lines must have a selected product';
      if (line.expected_qty === 0 && !isAdjustment) return 'Quantities cannot be zero';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validate();
    if (errorMsg) {
      toast.error('Validation Error', errorMsg);
      return;
    }

    const submissionData = {
      type,
      source_location_id: sourceId || null,
      dest_location_id: destId || null,
      reference_number: reference || null,
      notes: notes || null,
      lines: lines.map(l => ({
        product_id: l.product!.id,
        expected_qty: isAdjustment ? (l.expected_qty - l.product!.total_stock) : l.expected_qty // backend expects delta for adjustment, or expected_qty for others
      })) as OperationLine[] // simplified cast for the payload
    };

    try {
      const res = await createMutation.mutateAsync(submissionData);
      toast.success('Operation Created', `Draft ${type} successfully generated.`);
      router.push(`/operations/${res.data?.id}`);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.error?.message || 'Failed to create operation';
      toast.error('Error', msg);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-2">
        <Breadcrumb customLabel={TITLES[type]} />
        <button 
          onClick={onBack}
          className="md:hidden flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
          {TITLES[type]}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logistics Block */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 sm:p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-2 mb-4">
            Logistics Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(type === 'delivery' || type === 'transfer' || type === 'adjustment') && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-primary)]">Source Location *</label>
                <div className="relative">
                  <select 
                    value={sourceId}
                    onChange={e => setSourceId(e.target.value)}
                    className="w-full appearance-none bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-4 py-2.5 pr-10 text-[var(--text-primary)] text-sm outline-none transition-colors"
                  >
                    <option value="">Select source...</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">▼</div>
                </div>
              </div>
            )}

            {(type === 'receipt' || type === 'transfer') && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-primary)]">Destination Location *</label>
                <div className="relative">
                  <select 
                    value={destId}
                    onChange={e => setDestId(e.target.value)}
                    className="w-full appearance-none bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-4 py-2.5 pr-10 text-[var(--text-primary)] text-sm outline-none transition-colors"
                  >
                    <option value="">Select destination...</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">▼</div>
                </div>
              </div>
            )}

            {!isAdjustment && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-primary)]">Reference Number</label>
                <input 
                  type="text"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  placeholder="Optional reference code"
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-primary)] text-sm outline-none transition-colors font-mono"
                />
              </div>
            )}

            {!isAdjustment && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-[var(--text-primary)]">Notes</label>
                <textarea 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Optional internal notes..."
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-primary)] text-sm outline-none transition-colors resize-y min-h-[80px]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Product Lines Block */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              {isAdjustment ? 'Adjustment Details' : 'Product Lines'}
            </h2>
          </div>

          <div className="space-y-4">
            {lines.map((line, index) => (
              <div key={line.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center p-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-md)]">
                
                <div className="flex-1 w-full space-y-2">
                  <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Product *</label>
                  {line.product ? (
                    <div className="flex items-center justify-between w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-4 py-2 text-sm">
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">{line.product.name}</div>
                        <div className="text-xs font-mono text-[var(--text-muted)] mt-0.5">{line.product.sku}</div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          const newLines = [...lines];
                          newLines[index].product = null;
                          setLines(newLines);
                        }}
                        className="text-[var(--text-secondary)] hover:text-[var(--status-danger)] p-1 rounded transition-colors"
                        title="Change product"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <ProductSearchInput 
                      onSelect={(id, p) => {
                        const newLines = [...lines];
                        newLines[index].product = p;
                        if (isAdjustment) {
                           newLines[index].expected_qty = p.total_stock; // Prep physical == system
                        }
                        setLines(newLines);
                      }} 
                    />
                  )}
                </div>

                {isAdjustment ? (
                  <>
                    <div className="w-full md:w-32 space-y-2 shrink-0">
                      <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">System Qty</label>
                      <div className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-2 text-[var(--text-secondary)] text-sm font-mono opacity-80 cursor-not-allowed">
                        {line.product ? line.product.total_stock : '-'}
                      </div>
                    </div>
                    <div className="w-full md:w-36 space-y-2 shrink-0">
                      <label className="text-xs font-medium text-[var(--text-primary)] uppercase tracking-wider">Physical Count *</label>
                      <input 
                        type="number" 
                        min="0"
                        value={line.expected_qty}
                        onChange={(e) => {
                          const newLines = [...lines];
                          newLines[index].expected_qty = parseFloat(e.target.value) || 0;
                          setLines(newLines);
                        }}
                        disabled={!line.product}
                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-4 py-2 text-[var(--text-primary)] text-sm font-mono outline-none transition-colors"
                      />
                    </div>
                    <div className="w-full md:w-24 space-y-2 shrink-0 hidden sm:block">
                      <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Delta</label>
                      {line.product ? (() => {
                        const delta = line.expected_qty - line.product.total_stock;
                        const isPositive = delta > 0;
                        const isNegative = delta < 0;
                        return (
                          <div className={`w-full px-2 py-2 text-sm font-mono font-medium rounded-[var(--radius-sm)] flex items-center justify-center ${isPositive ? 'text-[#3FB950] bg-[#3FB950]/10' : isNegative ? 'text-[#F85149] bg-[#F85149]/10' : 'text-[var(--text-secondary)]'}`}>
                            {delta > 0 ? '+' : ''}{delta}
                          </div>
                        );
                      })() : (
                        <div className="w-full px-4 py-2 text-[var(--text-muted)] text-sm font-mono">-</div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-full md:w-36 space-y-2 shrink-0 flex flex-col justify-end h-full">
                    <label className="text-xs font-medium text-[var(--text-primary)] uppercase tracking-wider">Expected Qty *</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        min="0"
                        value={line.expected_qty}
                        onChange={(e) => {
                          const newLines = [...lines];
                          newLines[index].expected_qty = parseFloat(e.target.value) || 0;
                          setLines(newLines);
                        }}
                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-primary)] text-sm font-mono outline-none transition-colors"
                      />
                      <span className="text-xs text-[var(--text-muted)] w-8">{line.product?.unit_of_measure || ''}</span>
                    </div>
                  </div>
                )}

                {!isAdjustment && (
                  <button 
                    type="button"
                    title="Remove line"
                    onClick={() => {
                      if (lines.length > 1) {
                        setLines(lines.filter((_, i) => i !== index));
                      }
                    }}
                    disabled={lines.length === 1}
                    className="md:mt-6 p-2 text-[var(--text-secondary)] hover:text-[var(--status-danger)] hover:bg-[var(--status-danger)]/10 rounded-[var(--radius-sm)] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--text-secondary)]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {!isAdjustment && (
            <button 
              type="button"
              onClick={() => setLines([...lines, { id: Math.random().toString(), product: null, expected_qty: 1 }])}
              className="mt-4 flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-glow)] transition-colors rounded-[var(--radius-sm)] px-3 py-1.5 hover:bg-[var(--accent)]/10"
            >
              <Plus className="w-4 h-4" /> Add Product Line
            </button>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 pb-12">
          <button
            type="button"
            onClick={onBack}
            disabled={createMutation.isPending}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[var(--radius-md)] px-5 py-2.5 text-sm font-medium transition-colors border border-[var(--border)] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--accent)] text-[var(--text-on-accent)] hover:bg-[var(--accent-glow)] rounded-[var(--radius-md)] px-6 py-2.5 text-sm font-medium transition-colors shadow-sm disabled:opacity-50 min-w-[140px]"
          >
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {createMutation.isPending ? 'Creating...' : 'Create Draft'}
          </button>
        </div>

      </form>
    </div>
  );
}
