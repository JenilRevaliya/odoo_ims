'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useWarehouse, useLocations, useCreateLocation, useDeleteLocation } from '@/hooks/useWarehouses';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/store/toast';
import { ArrowLeft, MapPin, Plus, Trash2, Loader2, Building } from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import DataTable from '@/components/ui/DataTable';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { format, parseISO } from 'date-fns';

export default function WarehouseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const warehouseId = (Array.isArray(params.id) ? params.id[0] : params.id) as string;

  const { user } = useAuth();
  const isManager = user?.role === 'manager';

  const { data: warehouseData, isLoading: warehouseLoading } = useWarehouse(warehouseId);
  const warehouse = warehouseData?.data;

  const { data: locationsData, isLoading: locationsLoading } = useLocations(warehouseId);
  const locations = locationsData?.data || [];
  
  const deleteLocationMutation = useDeleteLocation(warehouseId);

  const [showNewModal, setShowNewModal] = useState(false);
  
  // Delete Dialog State
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);

  if (warehouseLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Breadcrumb customLabel="Loading..." />
        <LoadingSkeleton variant="default" count={1} />
        <LoadingSkeleton variant="table-row" count={4} />
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-medium text-[var(--text-primary)]">Warehouse not found</h2>
        <button onClick={() => router.push('/settings')} className="mt-6 flex items-center gap-2 text-[var(--accent)] hover:text-[var(--accent-glow)] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!locationToDelete) return;

    try {
      await deleteLocationMutation.mutateAsync(locationToDelete);
      toast.success('Location Deleted', 'Storage zone successfully removed.');
      setLocationToDelete(null);
    } catch {
      toast.error('Error', 'Cannot delete this location. It may contain existing stock ledger items.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="flex items-center justify-between mb-2">
        <Breadcrumb customLabel={warehouse.name} />
        <button 
          onClick={() => router.push('/settings')}
          className="md:hidden flex flex-row items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
            {warehouse.name}
          </h1>
          <div className="flex flex-wrap items-center gap-6 mt-2">
            <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
              <MapPin className="w-4 h-4" /> {warehouse.address || 'No physical address configured'}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
              <Building className="w-4 h-4" /> Created {format(parseISO(warehouse.created_at), 'MMM yyyy')}
            </span>
          </div>
        </div>

        {isManager && (
          <button 
            onClick={() => setShowNewModal(true)}
            className="w-full md:w-auto flex justify-center items-center gap-2 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-glow)] text-sm font-medium text-[var(--text-on-accent)] rounded-[var(--radius-md)] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Location
          </button>
        )}
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-[var(--text-primary)]">Storage Zones</h2>
          <span className="text-sm text-[var(--text-secondary)]">{locations.length} total zones</span>
        </div>

        {locationsLoading ? (
          <LoadingSkeleton variant="table-row" count={3} />
        ) : (
          <DataTable
            data={locations}
            columns={[
              { header: 'Zone Name', accessor: (row) => <span className="font-medium text-[var(--text-primary)]">{row.name}</span> },
              { header: 'Description', accessor: (row) => <span className="text-[var(--text-secondary)] text-sm">{row.description || '-'}</span> },
              { 
                header: 'ID', 
                accessor: (row) => <span className="font-mono text-xs text-[var(--text-muted)]">{row.id.split('-')[0]}</span>,
                className: 'hidden md:table-cell w-[120px]' 
              },
              { 
                header: '', 
                accessor: (row) => isManager ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setLocationToDelete(row.id); }}
                    className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--status-danger)] hover:bg-[var(--status-danger)]/10 rounded transition-colors"
                    title="Delete location"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : null,
                className: 'w-[60px] text-right'
              },
            ]}
            keyExtractor={(r) => r.id}
            emptyMessage="No locations configured for this warehouse facility."
          />
        )}
      </div>

      <NewLocationModal 
        warehouseId={warehouseId} 
        open={showNewModal} 
        onOpenChange={setShowNewModal} 
      />

      <ConfirmDialog
        open={!!locationToDelete}
        onOpenChange={(v) => !v && setLocationToDelete(null)}
        title="Delete Storage Zone?"
        description="Are you sure you want to completely remove this physical location zone from the warehouse? This cannot be undone."
        confirmLabel="Yes, Delete Zone"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        danger={true}
        isLoading={deleteLocationMutation.isPending}
      />
    </div>
  );
}

function NewLocationModal({ warehouseId, open, onOpenChange }: { warehouseId: string, open: boolean, onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const createMutation = useCreateLocation(warehouseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Zone name is required');
      return;
    }

    try {
      await createMutation.mutateAsync({ name, description: description || null });
      toast.success('Zone Created', `${name} added to warehouse.`);
      onOpenChange(false);
      setName('');
      setDescription('');
      setError('');
    } catch {
      toast.error('Error', 'Failed to create storage zone.');
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Create Storage Zone">
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="space-y-2">
          <label htmlFor="loc-name" className="text-sm font-medium text-[var(--text-primary)]">Zone Identifier *</label>
          <input 
            id="loc-name"
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="e.g. Aisle 4 - Shelf B"
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-primary)] text-sm outline-none transition-colors"
          />
          {error && <p className="text-xs text-[var(--status-danger)] mt-1">{error}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="loc-desc" className="text-sm font-medium text-[var(--text-primary)]">Description</label>
          <input 
            id="loc-desc"
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Optional context about this area..."
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--border-accent)] rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-primary)] text-sm outline-none transition-colors"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)] mt-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-[var(--radius-md)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-[var(--text-on-accent)] bg-[var(--accent)] hover:bg-[var(--accent-glow)] rounded-[var(--radius-md)] transition-colors shadow-sm disabled:opacity-50"
          >
            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {createMutation.isPending ? 'Saving...' : 'Create Zone'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
